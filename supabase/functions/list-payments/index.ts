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
        const { userId } = await req.json();

        if (!userId) {
            throw new Error('userId é obrigatório');
        }

        const accessToken = Deno.env.get('MP_ACCESS_TOKEN') ?? '';

        // Search for payments with external_reference containing the userId
        // This catches both old format (userId) and new format (beautystock_pro_userId_timestamp)
        const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=${userId}&sort=date_created&criteria=desc&limit=20`;

        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!response.ok) {
            console.error('MP Search API error:', response.status);
            throw new Error('Erro ao buscar pagamentos no Mercado Pago');
        }

        const data = await response.json();

        // Format payments for the frontend
        const payments = (data.results || []).map((p: any) => ({
            id: String(p.id),
            date: p.date_created,
            amount: p.transaction_amount,
            currency: p.currency_id || 'BRL',
            status: p.status, // approved, pending, rejected, etc.
            method: p.payment_type_id === 'credit_card' ? 'Cartão de Crédito'
                  : p.payment_type_id === 'debit_card' ? 'Cartão de Débito'
                  : p.payment_method_id === 'pix' ? 'PIX'
                  : p.payment_type_id === 'bank_transfer' ? 'PIX'
                  : p.payment_type_id || 'Outro',
            description: p.description || '',
            external_reference: p.external_reference || '',
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
