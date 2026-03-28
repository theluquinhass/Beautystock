import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Asaas API Helper ---
async function asaasRequest(endpoint: string, method: string, body?: any) {
    const apiUrl = Deno.env.get('ASAAS_API_URL') ?? 'https://sandbox.asaas.com/api';
    const apiKey = Deno.env.get('ASAAS_API_KEY') ?? '';

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': apiKey,
            'User-Agent': 'BeautyStock/1.0',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${apiUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        console.error(`[ASAAS] API Error ${response.status}:`, JSON.stringify(data));
        const errorMsg = data.errors?.[0]?.description || data.message || `Erro na API Asaas (${response.status})`;
        throw new Error(errorMsg);
    }

    return data;
}

// --- Customer Management ---
async function getOrCreateAsaasCustomer(
    supabase: any,
    profile: any,
    email: string
): Promise<string> {
    if (profile.asaas_customer_id) {
        console.log(`[CUSTOMER] Using existing Asaas customer: ${profile.asaas_customer_id}`);
        return profile.asaas_customer_id;
    }

    const cpf = profile.cpf?.replace(/[^\d]/g, '');
    const fullName = `${profile.first_name || 'Cliente'} ${profile.last_name || ''}`.trim();

    if (cpf) {
        try {
            const searchResult = await asaasRequest(`/v3/customers?cpfCnpj=${cpf}`, 'GET');
            if (searchResult.data && searchResult.data.length > 0) {
                const customerId = searchResult.data[0].id;
                console.log(`[CUSTOMER] Found existing Asaas customer by CPF: ${customerId}`);
                await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('id', profile.id);
                return customerId;
            }
        } catch (e) {
            console.warn('[CUSTOMER] Error searching by CPF, will create new:', e);
        }
    }

    console.log(`[CUSTOMER] Creating new Asaas customer for: ${fullName} (${email})`);
    const newCustomer = await asaasRequest('/v3/customers', 'POST', {
        name: fullName,
        email: email,
        cpfCnpj: cpf,
        notificationDisabled: true,
    });

    const customerId = newCustomer.id;
    console.log(`[CUSTOMER] Created Asaas customer: ${customerId}`);
    await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('id', profile.id);

    return customerId;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        let { userId, email } = await req.json();

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Não autorizado');
        }

        if (!email) {
            email = `user_${userId}@beautystock-customer.com`;
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Security check: anti-impersonation
        const anonClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await anonClient.auth.getUser();
        if (authError || !user || user.id !== userId) {
            console.error(`[SECURITY] User ${user?.id} tried to create subscription for ${userId}`);
            await supabase.from('audit_logs').insert({
                user_id: user?.id || null,
                action: 'payment_subscription_impersonation_attempt',
                status: 'blocked',
                details: { target_id: userId }
            });
            throw new Error('Não autorizado');
        }

        // 1. Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw new Error(`Erro no perfil: ${profileError.message}`);
        }

        if (!profile) {
            throw new Error('Usuário não encontrado');
        }

        // 2. Get or create Asaas customer
        const customerId = await getOrCreateAsaasCustomer(supabase, profile, email);

        // 3. Create Asaas subscription (recurring monthly)
        console.log('Creating Asaas subscription for customer:', customerId);

        const subscription = await asaasRequest('/v3/subscriptions', 'POST', {
            customer: customerId,
            billingType: 'CREDIT_CARD', // Enforce Credit Card for monthly subscription
            value: 29.90,
            cycle: 'MONTHLY',
            description: 'BeautyStock PRO - Assinatura Mensal',
            externalReference: userId,
            callback: {
                successUrl: 'https://www.beautystockapp.com/dashboard',
                autoRedirect: true
            }
        });

        // AUDIT LOG: Registro de assinatura iniciada
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'payment_subscription_started',
            status: 'success',
            details: { subscription_id: subscription.id, type: 'CREDIT_CARD' }
        });

        console.log('Subscription created:', subscription.id);

        // Get the first charge's invoiceUrl for redirect
        // The subscription response may include the first payment info
        let invoiceUrl = '';

        // Fetch the first payment of the subscription to get invoiceUrl
        if (subscription.id) {
            try {
                const payments = await asaasRequest(`/v3/subscriptions/${subscription.id}/payments`, 'GET');
                if (payments.data && payments.data.length > 0) {
                    invoiceUrl = payments.data[0].invoiceUrl || '';
                }
            } catch (e) {
                console.warn('Could not fetch subscription payments:', e);
            }
        }

        // Fallback: use bankSlipUrl or build the invoice URL
        if (!invoiceUrl && subscription.id) {
            invoiceUrl = `https://www.asaas.com/i/${subscription.id}`;
        }

        return new Response(
            JSON.stringify({
                init_point: invoiceUrl, // Keeping same field name for frontend compatibility
                id: subscription.id,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('Error in create-subscription:', error);

        let errorMessage = error.message || 'Erro ao criar assinatura';

        return new Response(
            JSON.stringify({
                error: errorMessage,
                message: errorMessage,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
