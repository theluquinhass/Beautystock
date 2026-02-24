import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, PreApproval } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as crypto from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify Webhook Signature (Simplified for MVP, but recommended)
        const url = new URL(req.url);
        const searchParams = url.searchParams;
        const topic = searchParams.get('topic') || searchParams.get('type');
        const id = searchParams.get('id') || searchParams.get('data.id');

        if (!topic || !id) {
            // Some webhooks come in the body
            const body = await req.json();
            if (body.type === 'subscription_preapproval') {
                // Process body
                return await processSubscription(body.data.id);
            }
            return new Response('Ignored', { status: 200 });
        }

        if (topic === 'subscription_preapproval') {
            return await processSubscription(id);
        }

        return new Response('Ignored', { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});

async function processSubscription(preapprovalId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? '' });
    const preapproval = new PreApproval(client);

    try {
        const subscription = await preapproval.get({ id: preapprovalId });

        console.log('Subscription update:', subscription.id, subscription.status);

        let newPlan = 'free';
        // 'authorized' is the status when payment is approved and subscription is active
        if (subscription.status === 'authorized') {
            newPlan = 'pro';
        }

        const userId = subscription.external_reference;

        if (userId) {
            const { error } = await supabase.from('profiles').update({
                plan: newPlan,
                mp_subscription_id: preapprovalId,
                // store status for debugging/logging
                updated_at: new Date().toISOString()
            }).eq('id', userId);

            if (error) {
                console.error('Error updating profile:', error);
                throw error;
            }
        } else {
            console.error('No external_reference found for subscription:', preapprovalId);
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } catch (error) {
        console.error('Error processing subscription:', error);
        return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
}
