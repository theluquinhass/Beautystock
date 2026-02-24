-- 1. Create SALES table (Header for multi-product transactions)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(10,2) DEFAULT 0,
    is_on_credit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Apply RLS policies to sales
CREATE POLICY "Users can view their own sales"
    ON public.sales FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
    ON public.sales FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
    ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- 2. Add sale_id reference to MOVEMENTS (The items)
ALTER TABLE public.movements
ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE;

-- 3. Create an RPC to safely process a sale in one transaction
-- This handles creating the sale, inserting the movement items, and updating the stock.
CREATE OR REPLACE FUNCTION process_sale_transaction(
    p_user_id UUID,
    p_customer_id UUID,
    p_is_on_credit BOOLEAN,
    p_total_amount NUMERIC,
    p_items JSONB -- Array of { variation_id, quantity, unit_price }
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
BEGIN
    -- 1. Create the sale header
    INSERT INTO public.sales (user_id, customer_id, is_on_credit, total_amount)
    VALUES (p_user_id, p_customer_id, p_is_on_credit, p_total_amount)
    RETURNING id INTO v_sale_id;

    -- 2. Loop through each item in the JSON payload
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- a. Insert the movement item
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
            (v_item->>'variation_id')::UUID,
            'EXIT',
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::NUMERIC,
            p_is_on_credit,
            v_sale_id
        );

        -- b. Deduct the stock purely in the variation table
        UPDATE public.variations
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
        WHERE id = (v_item->>'variation_id')::UUID
          AND product_id IN (SELECT id FROM public.products WHERE user_id = p_user_id);
          
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
