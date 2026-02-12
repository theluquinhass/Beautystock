import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Customer, PreApproval } from 'npm:mercadopago';
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
        const { userId, email } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!profile) {
            throw new Error('User not found');
        }

        const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? '' });
        const customerClient = new Customer(client);
        const preapprovalClient = new PreApproval(client);

        let customerId = profile.mp_customer_id;

        // 2. Create/Get Customer in Mercado Pago
        if (!customerId) {
            const customerData = {
                email: email,
                first_name: email.split('@')[0], // Fallback name
            };

            // Search if customer already exists by email to avoid duplicates
            const searchCustomer = await customerClient.search({ options: { email: email } });

            if (searchCustomer.results && searchCustomer.results.length > 0) {
                customerId = searchCustomer.results[0].id;
            } else {
                const newCustomer = await customerClient.create({ body: customerData });
                customerId = newCustomer.id;
            }

            // Update profile with mp_customer_id
            await supabase
                .from('profiles')
                .update({ mp_customer_id: customerId })
                .eq('id', userId);
        }

        // 3. Create Subscription (PreApproval)
        const subscriptionData = {
            payer_email: email,
            back_url: 'https://beautystock-app.vercel.app/dashboard', // Adjust to your production URL
            reason: 'BeautyStock PRO - Mensal',
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                transaction_amount: 29.90,
                currency_id: 'BRL',
            },
            status: 'pending',
            external_reference: userId,
        };

        const subscription = await preapprovalClient.create({ body: subscriptionData });

        return new Response(
            JSON.stringify({
                init_point: subscription.init_point,
                id: subscription.id
            }),
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
