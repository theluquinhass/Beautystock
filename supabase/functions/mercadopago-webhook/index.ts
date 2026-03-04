import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, PreApproval, Payment } from 'npm:mercadopago';
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

        // Fallback for body type events
        if (!topic || !id) {
            const body = await req.json();
            if (body.type === 'subscription_preapproval') {
                return await processSubscription(body.data.id);
            }
            if (body.type === 'payment') {
                return await processPayment(body.data.id);
            }
            return new Response('Ignored', { status: 200 });
        }

        if (topic === 'subscription_preapproval') {
            return await processSubscription(id);
        }

        if (topic === 'payment') {
            return await processPayment(id);
        }

        return new Response('Ignored', { status: 200 });

    } catch (error: any) {
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

        const userId = subscription.external_reference;

        if (userId) {
            if (subscription.status === 'authorized') {
                // Subscription is active/authorized, grant PRO for +30 days
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                const { error } = await supabase.from('profiles').update({
                    plan: 'pro',
                    mp_subscription_id: preapprovalId,
                    updated_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString()
                }).eq('id', userId);

                if (error) {
                    console.error('Error updating profile to PRO:', error);
                    throw error;
                }
            } else if (subscription.status === 'cancelled') {
                // Explicitly cancelled. Just log or optionally remove mp_subscription_id.
                // Real downgrades should happen via check-plan-expiration cron when expires_at is reached.
                console.log(`Subscription ${preapprovalId} cancelled for user ${userId}. Cron will downgrade when expired.`);
            } else {
                console.log(`Subscription ${preapprovalId} is ${subscription.status} for user ${userId}. No profile changes made.`);
            }
        } else {
            console.error('No external_reference found for subscription:', preapprovalId);
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } catch (error: any) {
        console.error('Error processing subscription:', error);
        return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
}

async function processPayment(paymentId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? '' });
    const payment = new Payment(client);

    try {
        const paymentData = await payment.get({ id: paymentId });
        console.log('Payment update:', paymentData.id, paymentData.status);

        // Ensure this is an approved payment for the PRO plan (we sent external_reference as userId)
        if (paymentData.status === 'approved') {
            const externalRef = paymentData.external_reference || '';
            const isRenewal = externalRef.endsWith('::renewal');
            const userId = isRenewal ? externalRef.split('::')[0] : externalRef;

            if (userId) {
                // Determine base date: if extending an active plan, use expires_at, otherwise use now
                // For simplicity as requested: Add 30 days to the current date for the expiry
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                const { error } = await supabase.from('profiles').update({
                    plan: 'pro',
                    // Using the existing subscription id field to store the payment ID so we have a trace
                    mp_subscription_id: `payment_${paymentId}`,
                    updated_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    // last_expiration_notice_at: null // Reset notice check on renewal
                }).eq('id', userId);

                // Clear unread notifications
                if (isRenewal) {
                    await supabase.from('notifications')
                        .update({ is_read: true })
                        .eq('user_id', userId)
                        .eq('type', 'plan_expiring')
                        .eq('is_read', false);
                }

                if (error) {
                    console.error('Error updating profile from payment:', error);
                    throw error;
                }

                console.log(`User ${userId} upgraded/renewed to PRO via Single Payment config until ${expiresAt.toISOString()}`);
            } else {
                console.error('No external_reference found for payment:', paymentId);
            }
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } catch (error: any) {
        console.error('Error processing payment:', error);
        return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
}
