import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { products } = await req.json();

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                global: { headers: { Authorization: authHeader } }
            }
        );

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('Invalid user token');
        }

        const userId = user.id;

        // Check if user is PRO
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', userId)
            .single();

        if (profile?.plan !== 'pro') {
            throw new Error('Feature available only for PRO plan.');
        }

        const results = {
            inserted: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        console.log(`Starting import for user ${userId}. Total items: ${products.length}`);

        for (const item of products) {
            try {
                // Validation (simple)
                if (!item.name) {
                    throw new Error('Name is required');
                }

                // 1. Upsert Product
                // Check if product exists by name for this user
                const { data: existingProducts } = await supabase
                    .from('products')
                    .select('id')
                    .eq('user_id', userId)
                    .ilike('name', item.name) // Case insensitive check
                    .maybeSingle();

                let productId;
                let isUpdate = false;

                const productData = {
                    user_id: userId,
                    name: item.name,
                    category: item.category || 'Geral',
                    cost: Number(item.cost) || 0,
                    price: Number(item.price) || 0,
                    min_stock: Number(item.min_stock) || 5, // Default min stock
                    // We don't update stock here, stock is in variations
                };

                if (existingProducts) {
                    // Update
                    isUpdate = true;
                    productId = existingProducts.id;
                    const { error: updateError } = await supabase
                        .from('products')
                        .update(productData)
                        .eq('id', productId);

                    if (updateError) throw updateError;
                } else {
                    // Insert
                    const { data: newProduct, error: insertError } = await supabase
                        .from('products')
                        .insert(productData)
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    productId = newProduct.id;
                }

                // 2. Handle Stock via Variations
                // Logic: 
                // - If new product, create "Padrão" variation with stock.
                // - If existing product, find "Padrão" or first variation and update stock. 
                // - If existing product has NO variations, create one.

                const { data: variations } = await supabase
                    .from('variations')
                    .select('*')
                    .eq('product_id', productId);

                const stockQuantity = parseInt(item.stock) || 0;
                const variationName = item.variation_name || 'Padrão'; // Allow SKU/Variation name from excel if mapping implemented later, default to Padrão

                if (variations && variations.length > 0) {
                    // Update the first variation found (simplest logic for single-variation products common in this domain)
                    // Or try to match by name if we support that later. For now, update the first one.
                    const targetVariation = variations[0];
                    await supabase
                        .from('variations')
                        .update({
                            stock_quantity: stockQuantity, // Overwrite stock
                            // name: variationName // Optional: update name? maybe keep existing.
                        })
                        .eq('id', targetVariation.id);
                } else {
                    // Create new variation
                    await supabase
                        .from('variations')
                        .insert({
                            product_id: productId,
                            name: variationName,
                            stock_quantity: stockQuantity
                        });
                }

                if (isUpdate) results.updated++;
                else results.inserted++;

            } catch (err) {
                console.error(`Error importing item ${item.name}:`, err);
                results.failed++;
                results.errors.push({ item: item.name, error: err.message });
            }
        }

        return new Response(
            JSON.stringify(results),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
