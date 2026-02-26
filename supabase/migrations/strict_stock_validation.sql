-- 1. ADD CONSTRAINT TO GUARANTEE STOCK >= 0 AT ALL TIMES
ALTER TABLE public.variations 
ADD CONSTRAINT check_stock_positive CHECK (stock_quantity >= 0);

-- 2. REPLACE THE SALES RPC
-- We use a single transaction and SELECT ... FOR UPDATE to prevent concurrency bugs
-- And we RAISE EXCEPTION if any stock cannot fulfill the requested quantity

CREATE OR REPLACE FUNCTION process_sale_transaction(
    p_user_id UUID,
    p_customer_id UUID,
    p_is_on_credit BOOLEAN,
    p_total_amount NUMERIC,
    p_items JSONB -- Array of { variation_id, quantity, unit_price }
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item RECORD;
    v_variation_record RECORD;
    v_insufficient_items JSONB := '[]'::JSONB;
BEGIN

    -- 1. Validate stock for ALL items before creating any movements
    -- We extract items to a temporary set, sort them by variation_id to prevent deadlocks
    FOR v_item IN 
        SELECT 
            (value->>'variation_id')::UUID AS variation_id,
            (value->>'quantity')::INTEGER AS req_qty,
            (value->>'unit_price')::NUMERIC AS req_price
        FROM jsonb_array_elements(p_items) AS value
        ORDER BY (value->>'variation_id')::UUID
    LOOP
        -- Lock the row using FOR UPDATE to prevent concurrent sales of the same stock
        SELECT id, name, stock_quantity 
        INTO v_variation_record
        FROM public.variations
        WHERE id = v_item.variation_id
          AND product_id IN (SELECT id FROM public.products WHERE user_id = p_user_id)
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'VARIATION_NOT_FOUND:%', v_item.variation_id;
        END IF;

        -- Check stock
        IF v_variation_record.stock_quantity < v_item.req_qty THEN
            -- Add to the list of insufficient items
            v_insufficient_items := v_insufficient_items || jsonb_build_object(
                'variation_id', v_variation_record.id,
                'name', v_variation_record.name,
                'requested', v_item.req_qty,
                'available', v_variation_record.stock_quantity
            );
        END IF;
    END LOOP;

    -- If there's any item with insufficient stock, abort entirely and return the detailed JSON error
    IF jsonb_array_length(v_insufficient_items) > 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_insufficient_items::TEXT;
    END IF;

    -- 2. All Good. Create the Sale Header
    INSERT INTO public.sales (user_id, customer_id, is_on_credit, total_amount)
    VALUES (p_user_id, p_customer_id, p_is_on_credit, p_total_amount)
    RETURNING id INTO v_sale_id;

    -- 3. Insert the movement items
    -- (We don't do UPDATE variations SET stock_ = stock_ - qtd here anymore,
    -- because your triggers.sql handles this via ON INSERT TO movements)
    
    FOR v_item IN 
        SELECT 
            (value->>'variation_id')::UUID AS variation_id,
            (value->>'quantity')::INTEGER AS req_qty,
            (value->>'unit_price')::NUMERIC AS req_price
        FROM jsonb_array_elements(p_items) AS value
    LOOP
        INSERT INTO public.movements (
            user_id, 
            customer_id, 
            variation_id, 
            type, 
            quantity, 
            unit_price, 
            is_on_credit, 
            sale_id
        ) VALUES (
            p_user_id,
            p_customer_id,
            v_item.variation_id,
            'EXIT',
            v_item.req_qty,
            v_item.req_price,
            p_is_on_credit,
            v_sale_id
        );
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
