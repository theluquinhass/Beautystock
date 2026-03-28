import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
};

// --- UTILS ---

const getSupabaseClient = () => createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Registra evento na tabela audit_logs para rastreabilidade.
 * Nunca registra senhas, tokens ou dados pessoais completos.
 */
async function logAuditEvent(
    supabase: any,
    action: string,
    status: 'success' | 'failure' | 'blocked',
    details: Record<string, any> = {},
    userId?: string
) {
    try {
        await supabase.from('audit_logs').insert({
            user_id: userId || null,
            action,
            status,
            details,
        });
    } catch (e) {
        console.warn('[AUDIT] Failed to log event:', e);
    }
}

/**
 * Validates the webhook authentication token from Asaas.
 * Asaas sends the token you configured in the `asaas-access-token` header.
 */
function validateWebhookToken(req: Request): boolean {
    const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
    
    if (!webhookToken) {
        console.warn('[AUTH] ASAAS_WEBHOOK_TOKEN not configured, skipping validation');
        return true; // Allow through if not configured
    }

    const receivedToken = req.headers.get('asaas-access-token');

    if (!receivedToken) {
        console.warn('[AUTH] No asaas-access-token header received');
        return false;
    }

    const isValid = receivedToken === webhookToken;
    if (!isValid) {
        console.warn('[AUTH] Token mismatch');
    }

    return isValid;
}

/**
 * Checks if a webhook event has already been processed (idempotency).
 */
async function isEventProcessed(supabase: any, eventId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('processed_webhooks')
            .select('id')
            .eq('id', eventId)
            .maybeSingle();

        if (error) {
            console.warn('[IDEMPOTENCY] Table may not exist:', error.message);
            return false;
        }
        return !!data;
    } catch (e) {
        console.warn('[IDEMPOTENCY] Check failed, allowing processing:', e);
        return false;
    }
}

/**
 * Marks a webhook event as processed.
 */
async function markEventAsProcessed(supabase: any, eventId: string, eventType: string) {
    try {
        await supabase.from('processed_webhooks').insert({
            id: eventId,
            event_type: eventType,
            provider: 'asaas',
        });
    } catch (e) {
        console.warn('[IDEMPOTENCY] Could not mark event as processed:', e);
    }
}

/**
 * Calculates new expiration date (+30 days).
 * If current plan is still active, extends from existing expires_at.
 */
function calculateNewExpiration(currentExpiresAt: string | null): string {
    const now = new Date();
    let baseDate = now;

    if (currentExpiresAt) {
        const expiresAtDate = new Date(currentExpiresAt);
        if (expiresAtDate > now) {
            baseDate = expiresAtDate;
            console.log(`Plan is still active. Extending from ${currentExpiresAt}`);
        } else {
            console.log(`Plan expired at ${currentExpiresAt}. Starting from now.`);
        }
    }

    const newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + 30);

    return newExpiration.toISOString();
}

// --- CORE PROCESSOR ---

async function processPaymentConfirmed(payment: any, event: string) {
    console.log(`[PAYMENT] Processing: id=${payment.id}, status=${payment.status}, event=${event}`);

    const supabase = getSupabaseClient();

    // IDEMPOTENCY CHECK BLINDADO - Primeiro checamos.
    const eventKey = `asaas_${payment.id}_${event}`;
    if (await isEventProcessed(supabase, eventKey)) {
        console.log(`[PAYMENT] Event ${eventKey} already processed. Skipping.`);
        // Note: Retornamos 200 pro Asaas não re-tentar
        return new Response('Already processed', { status: 200 });
    }

    // REGRA DE NEGÓCIO DE PREÇOS MÍNIMOS (Anti-Fraude de "Upgrade por 1 centavo")
    const PRO_PLAN_PRICE = 29.90; // DEVE ser idêntico ao PLAN_PRICE em create-pix-payment
    const valuePaid = parseFloat(payment.value);
    
    if (valuePaid < PRO_PLAN_PRICE) {
        console.error(`[FRAUD ALERT] Attempt to upgrade with insufficient funds. Paid: ${valuePaid}, Expected: ${PRO_PLAN_PRICE}`);
        
        // AUDIT LOG: Registra tentativa de fraude
        await logAuditEvent(supabase, 'payment_fraud_attempt', 'blocked', {
            payment_id: payment.id,
            value_paid: valuePaid,
            expected_value: PRO_PLAN_PRICE,
            external_reference: payment.externalReference,
        }, payment.externalReference);
        
        return new Response('Invalid payment amount for PRO plan', { status: 400 });
    }

    // Extract userId from externalReference
    const userId = payment.externalReference;

    if (!userId) {
        console.error('[PAYMENT] No externalReference (userId) found in payment');
        return new Response('No userId found', { status: 200 });
    }

    console.log(`[PAYMENT] UserId from externalReference: ${userId}`);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan, expires_at')
        .eq('id', userId)
        .maybeSingle();

    if (profileError || !profile) {
        console.error(`[PAYMENT] Profile not found for user ${userId}:`, profileError);
        return new Response('Profile not found', { status: 200 });
    }

    // MARCA COMO PROCESSADO ANTES do UPDATE do PLANO pra evitar Race conditions:
    await markEventAsProcessed(supabase, eventKey, event);

    // Update plan to PRO
    const newExpiresAt = calculateNewExpiration(profile.expires_at);
    console.log(`[PAYMENT] Updating user ${userId} to PRO until ${newExpiresAt}`);

    const { error: updateError } = await supabase.from('profiles').update({
        plan: 'pro',
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (updateError) {
        console.error('[PAYMENT] Failed to update profile:', updateError);
        throw updateError;
    }

    // Clear unread expiration notifications
    await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('type', 'plan_expiring')
        .eq('is_read', false);

    console.log(`[PAYMENT] ✅ Successfully activated PRO for user ${userId}`);
    
    // AUDIT LOG: Registra upgrade bem-sucedido
    await logAuditEvent(supabase, 'plan_upgrade', 'success', {
        payment_id: payment.id,
        from_plan: profile.plan,
        to_plan: 'pro',
        value_paid: valuePaid,
        expires_at: newExpiresAt,
    }, userId);
    
    return new Response('Success', { status: 200 });
}

// --- MAIN SERVER ---

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Validate webhook token
        if (!validateWebhookToken(req)) {
            console.warn('[WEBHOOK] Unauthorized request');
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Parse body
        const body = await req.json();
        const event = body.event;
        const payment = body.payment;

        console.log(`[WEBHOOK] Received event: ${event}`);

        if (!event) {
            console.warn('[WEBHOOK] No event type in body');
            return new Response('No event', { status: 200 });
        }

        // 3. Route events
        // PAYMENT_CONFIRMED → PIX/Boleto/Card payment confirmed
        // PAYMENT_RECEIVED  → Payment received (alternative for some billing types)
        if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
            if (!payment) {
                console.warn('[WEBHOOK] Payment data missing from webhook body');
                return new Response('No payment data', { status: 200 });
            }

            return await processPaymentConfirmed(payment, event);
        }

        // PAYMENT_OVERDUE → Payment overdue (informational, plan will expire via check-plan-expiration)
        if (event === 'PAYMENT_OVERDUE') {
            console.log(`[WEBHOOK] Payment overdue: ${payment?.id}. Plan will expire naturally.`);
            return new Response('Noted', { status: 200 });
        }

        // PAYMENT_CREATED → Just log it
        if (event === 'PAYMENT_CREATED') {
            console.log(`[WEBHOOK] Payment created: ${payment?.id}`);
            return new Response('OK', { status: 200 });
        }

        // Any other event
        console.log(`[WEBHOOK] Unhandled event: ${event}`);
        return new Response('Event not handled', { status: 200 });

    } catch (error: any) {
        console.error('[WEBHOOK] Global Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});
