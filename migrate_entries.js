import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    const sql = `
-- Create STOCK_ENTRIES table (Header for multi-product restock)
CREATE TABLE IF NOT EXISTS public.stock_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    supplier_name TEXT,
    notes TEXT,
    total_cost NUMERIC(10,2) DEFAULT 0,
    items_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;

-- Apply RLS
DROP POLICY IF EXISTS "Users can view their own entries" ON public.stock_entries;
CREATE POLICY "Users can view their own entries" ON public.stock_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own entries" ON public.stock_entries;
CREATE POLICY "Users can insert their own entries" ON public.stock_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add entry_id to movements
ALTER TABLE public.movements
ADD COLUMN IF NOT EXISTS entry_id UUID REFERENCES public.stock_entries(id) ON DELETE CASCADE;

-- Create RPC for entry transaction
CREATE OR REPLACE FUNCTION process_entry_transaction(
    p_user_id UUID,
    p_supplier_name TEXT,
    p_notes TEXT,
    p_total_cost NUMERIC,
    p_items_count INTEGER,
    p_items JSONB -- Array of { product_id, variation_id, quantity, unit_price }
) RETURNS UUID AS $$
DECLARE
    v_entry_id UUID;
    v_item JSONB;
BEGIN
    -- 1. Create the entry header
    INSERT INTO public.stock_entries (user_id, supplier_name, notes, total_cost, items_count)
    VALUES (p_user_id, p_supplier_name, p_notes, p_total_cost, p_items_count)
    RETURNING id INTO v_entry_id;

    -- 2. Loop through each item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- a. Insert the movement item (ENTRY)
        INSERT INTO public.movements (
            user_id, 
            variation_id, 
            type, 
            quantity, 
            unit_price, 
            entry_id
        ) VALUES (
            p_user_id,
            (v_item->>'variation_id')::UUID,
            'ENTRY',
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::NUMERIC,
            v_entry_id
        );

        -- b. Note: The database trigger "handle_stock_update" ALREADY adds to variation.stock_quantity!
        -- So we DO NOT manually update variation stock here to avoid double-adding.

        -- c. Update the product's cost with the new entered cost
        UPDATE public.products
        SET cost = (v_item->>'unit_price')::NUMERIC
        WHERE id = (v_item->>'product_id')::UUID
          AND user_id = p_user_id;
          
    END LOOP;

    RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Attempt to run the SQL using the rest API or pg extension.
    // If supabase JS doesn't have raw query, I'll fall back to saving the SQL and asking the user to paste it.
    // Actually, supabase JS has `rpc` but not generic `query()`. I'll create a generic .sql file and instruct the UI to show a toast, or try to run it via psql if local.
    // The user runs a remote supabase... So I can't `psql` locally without the connection string.
    fs.writeFileSync('multi_entries_rpc.sql', sql);
    console.log("SQL file generated.");
}
run();
