-- Add new columns for store name and logo
ALTER TABLE public.catalog_settings ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.catalog_settings ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

-- Update the RPC to return the new columns
CREATE OR REPLACE FUNCTION get_public_catalog(p_slug TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_catalog record;
    v_result json;
BEGIN
    SELECT cs.*, p.first_name, p.plan INTO v_catalog 
    FROM public.catalog_settings cs 
    JOIN public.profiles p ON p.id = cs.user_id 
    WHERE cs.slug = p_slug AND cs.is_active = true;
    
    IF NOT FOUND THEN RETURN NULL; END IF;
    
    SELECT json_build_object(
        'store_name', COALESCE(v_catalog.store_name, v_catalog.first_name),
        'store_logo_url', v_catalog.store_logo_url,
        'slug', v_catalog.slug,
        'whatsapp', v_catalog.whatsapp,
        'show_prices', v_catalog.show_prices,
        'plan', v_catalog.plan,
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
