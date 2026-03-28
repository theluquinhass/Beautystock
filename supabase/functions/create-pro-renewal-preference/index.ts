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
        return profile.asaas_customer_id;
    }

    const cpf = profile.cpf?.replace(/[^\d]/g, '');
    const fullName = `${profile.first_name || 'Cliente'} ${profile.last_name || ''}`.trim();

    if (cpf) {
        try {
            const searchResult = await asaasRequest(`/v3/customers?cpfCnpj=${cpf}`, 'GET');
            if (searchResult.data && searchResult.data.length > 0) {
                const customerId = searchResult.data[0].id;
                await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('id', profile.id);
                return customerId;
            }
        } catch (e) {
            console.warn('[CUSTOMER] Error searching by CPF, will create new:', e);
        }
    }

    const newCustomer = await asaasRequest('/v3/customers', 'POST', {
        name: fullName,
        email: email,
        cpfCnpj: cpf,
        notificationDisabled: true,
    });

    await supabase.from('profiles').update({ asaas_customer_id: newCustomer.id }).eq('id', profile.id);
    return newCustomer.id;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { userId, email } = await req.json();

        if (!userId) {
            throw new Error('User ID is required');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            throw new Error('User profile not found');
        }

        // Get or create Asaas customer
        const customerId = await getOrCreateAsaasCustomer(
            supabase,
            profile,
            email || profile.email || `user_${userId}@beautystock-customer.com`
        );

        // Create single charge for renewal
        const today = new Date().toISOString().split('T')[0];

        const charge = await asaasRequest('/v3/payments', 'POST', {
            customer: customerId,
            billingType: 'UNDEFINED', // Let user choose on checkout page
            value: 29.90,
            dueDate: today,
            description: 'Renovação BeautyStock PRO (1 Mês)',
            externalReference: `${userId}::renewal`,
            callback: {
                successUrl: 'https://www.beautystockapp.com/dashboard',
                autoRedirect: true
            }
        });

        console.log(`Renewal charge created: ${charge.id}`);

        return new Response(
            JSON.stringify({
                init_point: charge.invoiceUrl, // Same field name for frontend compatibility
                id: charge.id,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
