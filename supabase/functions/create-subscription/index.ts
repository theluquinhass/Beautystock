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
        console.log(`Starting subscription creation for user: ${userId}, email: ${email}`);

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Get user profile
        console.log('Fetching user profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw new Error(`Profile error: ${profileError.message}`);
        }

        if (!profile) {
            console.error('User not found');
            throw new Error('User not found');
        }

        console.log('Profile found:', profile.id);

        const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
        if (!accessToken) {
            console.error('MP_ACCESS_TOKEN is missing');
            throw new Error('Server configuration error: MP_ACCESS_TOKEN missing');
        }
        console.log('MP Access Token prefix:', accessToken.substring(0, 5) + '...');

        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const customerClient = new Customer(client);
        const preapprovalClient = new PreApproval(client);

        let customerId = profile.mp_customer_id;

        // 2. Create/Get Customer in Mercado Pago
        if (!customerId) {
            console.log('Creating/Finding customer in Mercado Pago...');

            // Ensure we have a valid first name
            let firstName = profile.first_name || '';
            let lastName = profile.last_name || '';

            if (!firstName) {
                // Fallback to email prefix or default
                firstName = email.split('@')[0].replace(/[^a-zA-Z\s]/g, '') || 'Cliente';
            }

            console.log(`Using customer name: ${firstName} ${lastName}`);

            const customerData = {
                email: email,
                first_name: firstName,
                last_name: lastName
            };

            // Search if customer already exists by email to avoid duplicates
            const searchCustomer = await customerClient.search({ options: { email: email } });

            if (searchCustomer.results && searchCustomer.results.length > 0) {
                customerId = searchCustomer.results[0].id;
                console.log('Customer found in MP:', customerId);
            } else {
                console.log('Creating new customer with data:', JSON.stringify(customerData));
                const newCustomer = await customerClient.create({ body: customerData });
                customerId = newCustomer.id;
                console.log('New customer created in MP:', customerId);
            }

            // Update profile with mp_customer_id
            await supabase
                .from('profiles')
                .update({ mp_customer_id: customerId })
                .eq('id', userId);
        } else {
            console.log('Using existing customer ID:', customerId);
        }

        // 3. Create Subscription (PreApproval)
        console.log('Creating preapproval for customer:', customerId);

        const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://beautystock-app.vercel.app';
        const backUrl = `${frontendUrl}/dashboard`;

        const subscriptionData = {
            payer_email: email,
            back_url: backUrl,
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
        console.log('Subscription created:', subscription.id);

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
        console.error('Error in create-subscription:', error);
        return new Response(
            JSON.stringify({ error: error.message, stack: error.stack }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
