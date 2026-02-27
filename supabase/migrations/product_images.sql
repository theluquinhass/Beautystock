-- 1. Add image_path to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Instructions for the user to run manually in Supabase Dashboard (Storage section):
-- 1. Create a new bucket named: product-images
-- 2. Set it to "Public" (Public bucket = true)

-- 2. Set up RLS for Storage (Run these in SQL Editor AFTER creating the bucket)

-- Enable RLS for storage.objects if not already enabled (usually is by default)
-- Note: Replace <<PRODUCT_IMAGES_BUCKET_ID>> with 'product-images' if needed.

-- Create policies for authenticated users to upload/update/delete their own images
CREATE POLICY "Users can upload their own product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for the catalog and app
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 3. Modify get_public_catalog function to include image_path
-- We need to update the RPC to SELECT 'image_path', pr.image_path as well
CREATE OR REPLACE FUNCTION get_public_catalog(p_slug TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_catalog record;
    v_result json;
BEGIN
    SELECT cs.*, p.first_name INTO v_catalog FROM public.catalog_settings cs JOIN public.profiles p ON p.id = cs.user_id WHERE cs.slug = p_slug AND cs.is_active = true;
    IF NOT FOUND THEN RETURN NULL; END IF;
    
    SELECT json_build_object(
        'store_name', v_catalog.first_name,
        'slug', v_catalog.slug,
        'whatsapp', v_catalog.whatsapp,
        'show_prices', v_catalog.show_prices,
        'categories', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cat.id,
                        'name', cat.name,
                        'color', cat.color,
                        'products', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', pr.id,
                                        'name', pr.name,
                                        'price', pr.price,
                                        'image_path', pr.image_path,
                                        'variations', COALESCE(
                                            (
                                                SELECT json_agg(
                                                    json_build_object(
                                                        'id', v.id,
                                                        'name', v.name,
                                                        'stock_quantity', v.stock_quantity
                                                    )
                                                )
                                                FROM public.variations v
                                                WHERE v.product_id = pr.id
                                            ), '[]'::json
                                        )
                                    )
                                )
                                FROM public.products pr
                                WHERE pr.category_id = cat.id AND pr.user_id = v_catalog.user_id
                            ), '[]'::json
                        )
                    )
                )
                FROM (
                    SELECT c.id, c.name, c.color, cc.sort_order
                    FROM public.catalog_categories cc
                    JOIN public.categories c ON c.id = cc.category_id
                    WHERE cc.user_id = v_catalog.user_id AND cc.is_visible = true
                    ORDER BY cc.sort_order ASC, c.name ASC
                ) cat
            ), '[]'::json
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;
