import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as crypto from "node:crypto";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Business Rules & Config ---
// Em produção, use 29.90. Valor mantido em 1.00 para facilitar seus testes atuais.
const PLAN_PRICE = 1.02;
const SYSTEM_NAME = 'beautystock';
const PLAN_NAME = 'pro';

// --- Utility Functions ---

/**
 * Basic CPF validation (checks length and repeated sequences).
 * For production, consider adding a full mod-11 validation block.
 */
function isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11) return false;
    // Reject known invalid sequences (e.g. 11111111111)
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    return true;
}

/**
 * Generates an idempotency key to prevent double charging.
 */
function generateIdempotencyKey(userId: string): string {
    // A simple v4 UUID per request is best practice for idempotency.
    return crypto.randomUUID();
}

/**
 * Creates a highly traceable external_reference
 * Format: system_plan_userId_timestamp
 */
function generateExternalReference(userId: string): string {
    const timestamp = Date.now();
    return `${SYSTEM_NAME}_${PLAN_NAME}_${userId}_${timestamp}`;
}

serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const userIdText = payload.userId;
        const emailRequest = payload.email;

        // 2. Strict Input Validation (Fail Fast)
        if (!userIdText) {
            throw new Error('O ID do usuário é obrigatório para transações de pagamento.');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 3. Fetch canonical user data from Database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userIdText)
            .single();

        if (profileError || !profile) {
            console.error('Database Error:', profileError);
            throw new Error('Usuário não encontrado no banco de dados.');
        }

        // 4. Validate Critical Information (Email, Name, CPF)
        const payerEmail = emailRequest || profile.email;
        if (!payerEmail || !payerEmail.includes('@')) {
            throw new Error('Um e-mail válido é obrigatório para processar o pagamento.');
        }

        const firstName = profile.first_name?.trim();
        const lastName = profile.last_name?.trim();

        if (!firstName || !lastName) {
            throw new Error('Nome e sobrenome são obrigatórios. Por favor, complete seu cadastro antes de assinar.');
        }

        const cpf = profile.cpf?.replace(/[^\d]/g, '');

        // Anti-Gambiarra: Nunca use CPF falso em produção se a sua conta for real, 
        // caso contrário sua conta MercadoPago pode ser bloqueada.
        if (!cpf || !isValidCPF(cpf)) {
            throw new Error('Você precisa de um CPF válido cadastrado para realizar o pagamento Pix. Vá nas configurações do seu perfil e adicione.');
        }

        // 5. Setup MP SDK
        const client = new MercadoPagoConfig({
            accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? ''
        });
        const payment = new Payment(client);

        // 6. Build the highly structured payload
        const externalReference = generateExternalReference(userIdText);
        const idempotencyKey = generateIdempotencyKey(userIdText);

        const paymentData = {
            body: {
                transaction_amount: PLAN_PRICE, // Security: Must ALWAYS come from the backend layer, NEVER trust frontend sent prices
                description: `Assinatura ${PLAN_NAME.toUpperCase()} - ${SYSTEM_NAME.toUpperCase()} (1 Mês)`,
                payment_method_id: 'pix',
                payer: {
                    email: payerEmail,
                    first_name: firstName,
                    last_name: lastName,
                    identification: {
                        type: 'CPF',
                        number: cpf
                    }
                },
                external_reference: externalReference,

                // Extra metadata helps significantly in debugging and webhook logic
                metadata: {
                    user_id: userIdText,
                    plan: PLAN_NAME,
                    environment: 'production',
                    application: SYSTEM_NAME
                }
            },
            requestOptions: {
                idempotencyKey: idempotencyKey // Security: Prevents duplicate charges
            }
        };

        console.log(`[PIX] Creating for: ${payerEmail} | ExternalRef: ${externalReference} | IdemKey: ${idempotencyKey}`);

        // 7. Execute payment creation
        const result = await payment.create(paymentData);

        // EXTRA (TODO): Future Improvement
        // Here you would register this intent to a 'payments' table:
        // await supabase.from('payments').insert({
        //     payment_id: String(result.id),
        //     user_id: userIdText,
        //     external_reference: externalReference,
        //     status: result.status, // e.g., 'pending'
        //     amount: PLAN_PRICE,
        //     payment_method: 'pix'
        // });

        const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

        if (!qrCode) {
            throw new Error("Mercado Pago retornou sucesso, mas as credenciais do PIX (QRCode) não vieram no payload.");
        }

        // 8. Standardized Success Response
        return new Response(
            JSON.stringify({
                success: true,
                paymentId: result.id,
                qrCode: qrCode,
                qrCodeBase64: qrCodeBase64,
                externalReference: externalReference
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        // 9. Standardized Detailed Error Logging & Response
        console.error('[CRITICAL MP API ERROR]:', error);

        let errorMsg = 'Ocorreu um erro inesperado ao gerar a fatura. Tente novamente mais tarde.';
        let statusCode = 400;

        // Try to parse exact Mercado Pago API rejection
        if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
            statusCode = error.response.status || 400;
        } else if (error.message) {
            errorMsg = error.message; // Our custom thrown errors
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMsg,
                details: error.response?.data || null
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Important: using 400 to trigger browser 'catch' correctly
            }
        );
    }
});
