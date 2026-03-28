import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const WEBHOOK_URL = process.env.VITE_SUPABASE_URL + '/functions/v1/asaas-webhook';
const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || 'test-token';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testWebhook(payload) {
    console.log(`🚀 Sending ${payload.event} to ${WEBHOOK_URL}...`);

    try {
        const response = await axios.post(WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'asaas-access-token': WEBHOOK_TOKEN
            }
        });

        console.log(`✅ Response (${response.status}):`, response.data);
    } catch (error) {
        console.error(`❌ Error (${error.response?.status || 'Unknown'}):`, error.response?.data || error.message);
        console.log("💡 Tip: If you get 401, the ASAAS_WEBHOOK_TOKEN in your .env might not match the one set in Supabase Edge Functions.");
    }
}

/**
 * Simulates the EXACT logic found in supabase/functions/asaas-webhook/index.ts
 * But runs it locally using the service role key.
 */
async function simulateActivationDirectly(payload) {
    const event = payload.event;
    const payment = payload.payment;
    const userId = payment.externalReference;

    console.log(`\n🛠️ Simulating ${event} logic directly for User: ${userId}...`);

    if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
        console.log(`ℹ️ Event ${event} does not trigger activation in current logic.`);
        return;
    }

    try {
        // 1. Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, expires_at')
            .eq('id', userId)
            .maybeSingle();

        if (profileError || !profile) {
            console.error(`❌ Profile not found:`, profileError);
            return;
        }

        // 2. Calculate new expiration (+30 days)
        const now = new Date();
        let baseDate = now;
        if (profile.expires_at) {
            const exp = new Date(profile.expires_at);
            if (exp > now) baseDate = exp;
        }
        const newExpiration = new Date(baseDate);
        newExpiration.setDate(newExpiration.getDate() + 30);

        console.log(`📈 Current Plan: ${profile.plan}`);
        console.log(`📅 New Expiration: ${newExpiration.toISOString()}`);

        // 3. Update profile
        const { error: updateError } = await supabase.from('profiles').update({
            plan: 'pro',
            expires_at: newExpiration.toISOString(),
            updated_at: new Date().toISOString(),
        }).eq('id', userId);

        if (updateError) throw updateError;

        console.log(`✅ User ${userId} successfully updated to PRO!`);

    } catch (err) {
        console.error("💥 Simulation error:", err.message);
    }
}

// User-provided sample (PAYMENT_CREATED)
const sampleCreated = {
    "id": "evt_05b708f961d739ea7eba7e4db318f621&14621775",
    "event": "PAYMENT_CREATED",
    "dateCreated": "2026-03-12 23:24:00",
    "account": {
        "id": "066287b4-0862-457c-8724-1bd2d480ec79",
        "ownerId": null
    },
    "payment": {
        "object": "payment",
        "id": "pay_3nsk87fee3dzcq4j",
        "dateCreated": "2026-03-12",
        "customer": "cus_000007668516",
        "checkoutSession": null,
        "paymentLink": null,
        "value": 29.9,
        "netValue": 28.91,
        "originalValue": null,
        "interestValue": null,
        "description": "Assinatura PRO - BEAUTYSTOCK (1 Mês)",
        "billingType": "PIX",
        "pixTransaction": null,
        "status": "PENDING",
        "dueDate": "2026-03-13",
        "originalDueDate": "2026-03-13",
        "paymentDate": null,
        "clientPaymentDate": null,
        "installmentNumber": null,
        "invoiceUrl": "https://sandbox.asaas.com/i/3nsk87fee3dzcq4j",
        "invoiceNumber": "13444849",
        "externalReference": "0ec7e637-0909-4df9-959f-e59285e9cae4",
        "deleted": false,
        "anticipated": false,
        "anticipable": false,
        "creditDate": null,
        "estimatedCreditDate": null,
        "transactionReceiptUrl": null,
        "nossoNumero": null,
        "bankSlipUrl": null,
        "lastInvoiceViewedDate": null,
        "lastBankSlipViewedDate": null,
        "discount": {
            "value": 0,
            "limitDate": null,
            "dueDateLimitDays": 0,
            "type": "FIXED"
        },
        "fine": {
            "value": 0,
            "type": "FIXED"
        },
        "interest": {
            "value": 0,
            "type": "PERCENTAGE"
        },
        "postalService": false,
        "escrow": null,
        "refunds": null
    }
};

// Simulated PAYMENT_CONFIRMED (to verify plan activation logic)
const sampleConfirmed = JSON.parse(JSON.stringify(sampleCreated));
sampleConfirmed.event = "PAYMENT_CONFIRMED";
sampleConfirmed.payment.status = "CONFIRMED";

async function runTests() {
    console.log("--- Testing PAYMENT_CREATED ---");
    await testWebhook(sampleCreated);
    
    console.log("\n--- Testing PAYMENT_CONFIRMED (HTTP) ---");
    await testWebhook(sampleConfirmed);

    console.log("\n--- Direct DB Simulation ---");
    await simulateActivationDirectly(sampleConfirmed);
}

runTests();
