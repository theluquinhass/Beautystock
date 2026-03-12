import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, PreApproval, Payment } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as crypto from "node:crypto";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

// --- UTILS ---

const getSupabaseClient = () => createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const getMPClient = () => new MercadoPagoConfig({ 
    accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? '' 
});

/**
 * Validates Mercado Pago Webhook Signature
 * Mercado Pago v2 format: HMAC SHA256 of "id:[data.id];request-id:[x-request-id];ts:[timestamp];"
 * Returns true if valid or if validation cannot be performed (missing secret/headers).
 * In production with stable integration, you can make this strict (return false on failure).
 */
function validateSignature(req: Request, resourceId: string): boolean {
    const signatureHeader = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    const secret = Deno.env.get('MP_WEBHOOK_SECRET');

    if (!secret || !signatureHeader) {
        console.warn('[SIGNATURE] Validation skipped: MP_WEBHOOK_SECRET or x-signature header missing');
        return true; 
    }

    try {
        const parts = signatureHeader.split(',').reduce((acc: any, part) => {
            const [key, value] = part.split('=');
            acc[key.trim()] = value;
            return acc;
        }, {});

        const ts = parts['ts'];
        const v1 = parts['v1'];

        if (!ts || !v1) {
            console.warn('[SIGNATURE] Missing ts or v1 in x-signature header');
            return true; // non-blocking
        }

        // Build manifest per Mercado Pago docs
        let manifest = '';
        if (resourceId) manifest += `id:${resourceId};`;
        if (requestId) manifest += `request-id:${requestId};`;
        manifest += `ts:${ts};`;

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const digest = hmac.digest('hex');

        const isValid = digest === v1;
        if (!isValid) {
            console.warn(`[SIGNATURE] Mismatch. manifest="${manifest}", expected=${v1}, got=${digest}`);
            // Non-blocking: allow request but log the warning
            // In production with stable integration, change this to return false
        }
        
        return true; // Always allow through for now
    } catch (err) {
        console.error('[SIGNATURE] Error validating:', err);
        return true; // Non-blocking
    }
}

/**
 * Checks if a webhook has already been processed to ensure idempotency.
 * Returns false (not processed) if the table doesn't exist yet.
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
            return false; // Allow processing
        }
        return !!data;
    } catch (e) {
        console.warn('[IDEMPOTENCY] Check failed, allowing processing:', e);
        return false;
    }
}

/**
 * Marks a webhook as processed. Silently fails if table doesn't exist.
 */
async function markEventAsProcessed(supabase: any, eventId: string, eventType: string) {
    try {
        await supabase.from('processed_webhooks').insert({
            id: eventId,
            event_type: eventType
        });
    } catch (e) {
        console.warn('[IDEMPOTENCY] Could not mark event as processed:', e);
    }
}

/**
 * Calculates new expiration date (+30 days)
 * If current plan is active, adds 30 days to existing expires_at.
 * Otherwise, adds 30 days to current date.
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

/**
 * Extracts userId from external_reference
 * Supports multiple formats:
 *   - New: "beautystock_pro_userId_timestamp"
 *   - Legacy: "userId" or "userId::renewal"
 */
function parseExternalReference(ref: string): { userId: string, isRenewal: boolean } {
    if (!ref) return { userId: '', isRenewal: false };

    const isRenewal = ref.includes('::renewal');

    // New format: beautystock_pro_userId_timestamp
    if (ref.startsWith('beautystock_')) {
        const parts = ref.split('_');
        // parts = ['beautystock', 'pro', 'userId', 'timestamp']
        // The userId is everything between the plan name and the last element (timestamp)
        if (parts.length >= 4) {
            // userId might contain underscores itself (UUID format), so join everything between index 2 and last
            const userId = parts.slice(2, parts.length - 1).join('_');
            console.log(`[WEBHOOK] Parsed new format external_reference: userId=${userId}`);
            return { userId, isRenewal };
        }
    }

    // Legacy format: userId or userId::renewal
    const userId = isRenewal ? ref.split('::')[0] : ref;
    console.log(`[WEBHOOK] Parsed legacy external_reference: userId=${userId}`);
    return { userId, isRenewal };
}

// --- CORE PROCESSORS ---

async function processSubscription(preapprovalId: string, req: Request) {
    console.log(`[SUBSCRIPTION] Processing ID: ${preapprovalId}`);
    
    const supabase = getSupabaseClient();
    
    if (await isEventProcessed(supabase, `sub_${preapprovalId}`)) {
        console.log(`[SUBSCRIPTION] ID ${preapprovalId} already processed. Skipping.`);
        return new Response('Already processed', { status: 200 });
    }

    if (!validateSignature(req, preapprovalId)) {
        console.warn(`[SUBSCRIPTION] Signature validation failed for ${preapprovalId}`);
    }

    try {
        const client = getMPClient();
        const preapproval = new PreApproval(client);
        const subscription = await preapproval.get({ id: preapprovalId });

        console.log(`[SUBSCRIPTION] Data fetched: status=${subscription.status}, external_ref=${subscription.external_reference}`);

        const { userId } = parseExternalReference(subscription.external_reference || '');

        if (!userId) {
            console.error('[SUBSCRIPTION] No external_reference (userId) found');
            return new Response('No userId found', { status: 200 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, expires_at')
            .eq('id', userId)
            .maybeSingle();

        if (profileError || !profile) {
            console.error(`[SUBSCRIPTION] Profile not found for user ${userId}`);
            return new Response('Profile not found', { status: 200 });
        }

        if (subscription.status === 'authorized') {
            const newExpiresAt = calculateNewExpiration(profile.expires_at);
            
            console.log(`[SUBSCRIPTION] Updating user ${userId} to PRO until ${newExpiresAt}`);

            const { error: updateError } = await supabase.from('profiles').update({
                plan: 'pro',
                mp_subscription_id: preapprovalId,
                expires_at: newExpiresAt,
                updated_at: new Date().toISOString()
            }).eq('id', userId);

            if (updateError) throw updateError;
            
            await markEventAsProcessed(supabase, `sub_${preapprovalId}`, 'subscription_preapproval');
        } else if (subscription.status === 'cancelled') {
            console.log(`[SUBSCRIPTION] User ${userId} cancelled subscription. Plan remains until expires_at.`);
            await markEventAsProcessed(supabase, `sub_${preapprovalId}`, 'subscription_preapproval_cancelled');
        }

        return new Response('Success', { status: 200 });
    } catch (error: any) {
        console.error('[SUBSCRIPTION] Critical Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

async function processPayment(paymentId: string, req: Request) {
    console.log(`[PAYMENT] Processing ID: ${paymentId}`);
    
    const supabase = getSupabaseClient();

    if (await isEventProcessed(supabase, `pay_${paymentId}`)) {
        console.log(`[PAYMENT] ID ${paymentId} already processed. Skipping.`);
        return new Response('Already processed', { status: 200 });
    }

    if (!validateSignature(req, paymentId)) {
        console.warn(`[PAYMENT] Signature validation failed for ${paymentId}`);
    }

    try {
        const client = getMPClient();
        const paymentClient = new Payment(client);
        const paymentData = await paymentClient.get({ id: paymentId });

        console.log(`[PAYMENT] Data fetched: status=${paymentData.status}, amount=${paymentData.transaction_amount}, external_ref=${paymentData.external_reference}`);

        // Validate Status
        if (paymentData.status !== 'approved') {
            console.log(`[PAYMENT] Status is ${paymentData.status}. Ignoring update.`);
            return new Response('Not approved', { status: 200 });
        }

        const { userId, isRenewal } = parseExternalReference(paymentData.external_reference || '');

        if (!userId) {
            console.error('[PAYMENT] No external_reference (userId) found');
            return new Response('No userId found', { status: 200 });
        }

        // Validate Amount (Optional but recommended)
        // if (paymentData.transaction_amount < 29.90) { ... }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, expires_at')
            .eq('id', userId)
            .maybeSingle();

        if (profileError || !profile) {
            console.error(`[PAYMENT] Profile not found for user ${userId}`);
            return new Response('Profile not found', { status: 200 });
        }

        const newExpiresAt = calculateNewExpiration(profile.expires_at);
        console.log(`[PAYMENT] Updating user ${userId} to PRO until ${newExpiresAt}`);

        const { error: updateError } = await supabase.from('profiles').update({
            plan: 'pro',
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString()
        }).eq('id', userId);

        if (updateError) throw updateError;

        // Clear unread expiration notifications
        if (isRenewal) {
            await supabase.from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('type', 'plan_expiring')
                .eq('is_read', false);
        }

        await markEventAsProcessed(supabase, `pay_${paymentId}`, 'payment');

        return new Response('Success', { status: 200 });
    } catch (error: any) {
        console.error('[PAYMENT] Critical Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// --- MAIN SERVER ---

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        // Robust parsing of ID and Topic
        let topic = searchParams.get('topic') || searchParams.get('type');
        let resourceId = searchParams.get('id') || searchParams.get('data.id');

        // Fallback for body content (v1/v2 format differences)
        if (!topic || !resourceId) {
            try {
                const body = await req.clone().json();
                topic = topic || body.type || (body.topic);
                resourceId = resourceId || (body.data?.id) || (body.id);
            } catch (e) {
                console.log('No valid JSON body found');
            }
        }

        console.log(`[WEBHOOK] Received event: topic=${topic}, id=${resourceId}`);

        if (!topic || resourceId === null || resourceId === undefined) {
            console.warn('[WEBHOOK] Missing topic or ID. Returning 200 but ignored.');
            return new Response('Ignored', { status: 200 });
        }

        // Convert resourceId to string to be safe
        const resourceIdStr = String(resourceId);

        // Process based on topic
        if (topic === 'subscription_preapproval') {
            return await processSubscription(resourceIdStr, req);
        }

        if (topic === 'payment') {
            return await processPayment(resourceIdStr, req);
        }

        return new Response('Topic not handled', { status: 200 });

    } catch (error: any) {
        console.error('[WEBHOOK] Global Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
