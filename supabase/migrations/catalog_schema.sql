-- Create catalog_settings table
CREATE TABLE IF NOT EXISTS public.catalog_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    show_prices BOOLEAN DEFAULT true,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create catalog_categories table
CREATE TABLE IF NOT EXISTS public.catalog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE public.catalog_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_categories ENABLE ROW LEVEL SECURITY;

-- Policies for catalog_settings
CREATE POLICY "Users can manage their own catalog settings"
    ON public.catalog_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Read access for everyone to resolve conflicts just in case (optional, we'll use RPC mainly)
CREATE POLICY "Public can read active catalog settings"
    ON public.catalog_settings FOR SELECT
    USING (is_active = true);

-- Policies for catalog_categories
CREATE POLICY "Users can manage their own catalog categories"
    ON public.catalog_categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RPC for fetching public catalog
-- This uses SECURITY DEFINER to bypass RLS and fetch the user's products 
-- safely without opening the products table to the public.
CREATE OR REPLACE FUNCTION get_public_catalog(p_slug TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_catalog record;
    v_result json;
BEGIN
    -- Obter configuracoes do catalogo e nome do usuario
    SELECT cs.*, p.first_name
    INTO v_catalog
    FROM public.catalog_settings cs
    JOIN public.profiles p ON p.id = cs.user_id
    WHERE cs.slug = p_slug AND cs.is_active = true;

    -- Se não encontrar ou inativo, retorna null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Montar JSON de retorno com categorias visíveis e seus produtos
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

-- Grant execution to public anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_public_catalog(TEXT) TO anon, authenticated;
