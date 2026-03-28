import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Asaas API Helper ---
async function asaasRequest(endpoint: string, method: string) {
    const apiUrl = Deno.env.get('ASAAS_API_URL') ?? 'https://sandbox.asaas.com/api';
    const apiKey = Deno.env.get('ASAAS_API_KEY') ?? '';

    const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': apiKey,
            'User-Agent': 'BeautyStock/1.0',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(`[ASAAS] API Error ${response.status}:`, JSON.stringify(data));
        throw new Error(data.errors?.[0]?.description || `Erro na API Asaas (${response.status})`);
    }

    return data;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            throw new Error('userId é obrigatório');
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Não autorizado');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Security check: must be the user themselves
        const anonClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await anonClient.auth.getUser();
        if (authError || !user || user.id !== userId) {
            console.error(`[SECURITY] Unauthorized access to payments by user: ${user?.id} for target: ${userId}`);
            throw new Error('Não autorizado a visualizar pagamentos de outra conta.');
        }

        // Get the user's Asaas customer ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('asaas_customer_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.asaas_customer_id) {
            console.log('[LIST-PAYMENTS] No Asaas customer ID for this user');
            return new Response(
                JSON.stringify({ success: true, payments: [] }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            );
        }

        // Fetch payments from Asaas for this customer
        const data = await asaasRequest(
            `/v3/payments?customer=${profile.asaas_customer_id}&limit=20&order=desc`,
            'GET'
        );

        // Format payments for the frontend
        const payments = (data.data || []).map((p: any) => ({
            id: p.id,
            date: p.dateCreated || p.paymentDate,
            amount: p.value,
            currency: 'BRL',
            status: mapAsaasStatus(p.status),
            method: mapBillingType(p.billingType),
            description: p.description || '',
            external_reference: p.externalReference || '',
        }));

        return new Response(
            JSON.stringify({ success: true, payments }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('[LIST-PAYMENTS] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message, payments: [] }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});

/**
 * Maps Asaas payment status to the frontend-expected status format.
 */
function mapAsaasStatus(asaasStatus: string): string {
    switch (asaasStatus) {
        case 'CONFIRMED':
        case 'RECEIVED':
        case 'RECEIVED_IN_CASH':
            return 'approved';
        case 'PENDING':
        case 'AWAITING_RISK_ANALYSIS':
            return 'pending';
        case 'OVERDUE':
            return 'pending';
        case 'REFUNDED':
        case 'REFUND_REQUESTED':
        case 'CHARGEBACK_REQUESTED':
        case 'CHARGEBACK_DISPUTE':
            return 'rejected';
        default:
            return asaasStatus.toLowerCase();
    }
}

/**
 * Maps Asaas billing type to a readable Portuguese string.
 */
function mapBillingType(billingType: string): string {
    switch (billingType) {
        case 'PIX':
            return 'PIX';
        case 'CREDIT_CARD':
            return 'Cartão de Crédito';
        case 'BOLETO':
            return 'Boleto';
        case 'DEBIT_CARD':
            return 'Cartão de Débito';
        case 'UNDEFINED':
            return 'Checkout';
        default:
            return billingType || 'Outro';
    }
}
