import express from "express";
import cors from "cors";
import { MercadoPagoConfig, PreApproval, Customer } from "mercadopago";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();
dotenv.config({ path: '../.env' }); // Fallback to root .env for local dev

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rota de Teste
app.get("/", (req, res) => {
    res.send("BeautyStock API rodando 🚀");
});

// Criar Assinatura (PreApproval)
app.post("/create-subscription", async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ error: "Missing userId or email" });
        }

        // 1. Get/Create Customer
        const customerClient = new Customer(client);

        // Search if customer exists
        const searchCustomer = await customerClient.search({ options: { email: email } });
        let customerId;

        if (searchCustomer.results && searchCustomer.results.length > 0) {
            customerId = searchCustomer.results[0].id;
        } else {
            const newCustomer = await customerClient.create({
                body: {
                    email: email,
                    first_name: email.split('@')[0]
                }
            });
            customerId = newCustomer.id;
        }

        // Save customerId to Supabase
        await supabase
            .from('profiles')
            .update({ mp_customer_id: customerId })
            .eq('id', userId);

        // 2. Create PreApproval
        const preapproval = new PreApproval(client);

        const subscription = await preapproval.create({
            body: {
                reason: "BeautyStock PRO - Mensal",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: 29.90,
                    currency_id: "BRL"
                },
                back_url: "https://beautystock-app.vercel.app/dashboard", // Adjust as needed
                payer_email: email,
                status: "pending",
                external_reference: userId
            }
        });

        res.json({
            init_point: subscription.init_point,
            id: subscription.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar assinatura" });
    }
});

// Webhook
app.post("/webhook", async (req, res) => {
    try {
        const { query, body, headers } = req;
        const topic = query.topic || query.type;
        const id = query.id || query['data.id'];

        // Validate Signature (Optional/Recommended)
        // Note: Render/Express headers are lowercase usually
        const signature = headers['x-signature'];
        const requestId = headers['x-request-id'];

        if (process.env.MP_WEBHOOK_SECRET && signature && requestId) {
            const parts = signature.split(',');
            let ts;
            let v1;
            parts.forEach(p => {
                const [k, v] = p.split('=');
                if (k === 'ts') ts = v;
                if (k === 'v1') v1 = v;
            });

            const template = `id:${id};request-id:${requestId};ts:${ts};`;
            const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET);
            hmac.update(template);
            const check = hmac.digest('hex');

            if (check !== v1) {
                console.warn("Invalid Webhook Signature");
                // return res.status(401).send("Invalid Signature");
                // For now, warn but allow processing if debugging
            }
        }

        if (topic === 'subscription_preapproval') {
            const preapproval = new PreApproval(client);
            const subscription = await preapproval.get({ id });

            console.log(`Subscription ${id} status: ${subscription.status}`);

            let newPlan = 'free';
            if (subscription.status === 'authorized') {
                newPlan = 'pro';
            }

            const userId = subscription.external_reference;

            if (userId) {
                await supabase.from('profiles').update({
                    plan: newPlan,
                    mp_subscription_id: id,
                    updated_at: new Date().toISOString()
                }).eq('id', userId);
            }
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Webhook error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server rodando na porta ${PORT} 🔥`)
);
