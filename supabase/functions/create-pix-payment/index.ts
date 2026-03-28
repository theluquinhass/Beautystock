import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Business Rules & Config ---
const PLAN_PRICE = 29.90;
const SYSTEM_NAME = 'beautystock';
const PLAN_NAME = 'pro';

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
    // 1. Check if we already have the Asaas customer ID stored
    if (profile.asaas_customer_id) {
        console.log(`[CUSTOMER] Using existing Asaas customer: ${profile.asaas_customer_id}`);
        return profile.asaas_customer_id;
    }

    const cpf = profile.cpf?.replace(/[^\d]/g, '');
    const fullName = `${profile.first_name || 'Cliente'} ${profile.last_name || ''}`.trim();

    // 2. Try to find existing customer by CPF
    if (cpf) {
        try {
            const searchResult = await asaasRequest(`/v3/customers?cpfCnpj=${cpf}`, 'GET');
            if (searchResult.data && searchResult.data.length > 0) {
                const customerId = searchResult.data[0].id;
                console.log(`[CUSTOMER] Found existing Asaas customer by CPF: ${customerId}`);

                // Save for future use
                await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('id', profile.id);
                return customerId;
            }
        } catch (e) {
            console.warn('[CUSTOMER] Error searching by CPF, will create new:', e);
        }
    }

    // 3. Create new customer
    console.log(`[CUSTOMER] Creating new Asaas customer for: ${fullName} (${email})`);
    const newCustomer = await asaasRequest('/v3/customers', 'POST', {
        name: fullName,
        email: email,
        cpfCnpj: cpf,
        notificationDisabled: true, // We handle our own notifications
    });

    const customerId = newCustomer.id;
    console.log(`[CUSTOMER] Created Asaas customer: ${customerId}`);

    // Save for future use
    await supabase.from('profiles').update({ asaas_customer_id: customerId }).eq('id', profile.id);

    return customerId;
}

// --- CPF Validation ---
function isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    return true;
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

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Não autorizado: Cabeçalho de autorização ausente.');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // EXTRA SECURITY: O anon client valida o JWT do usuário
        const anonClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await anonClient.auth.getUser();
        if (authError || !user) {
            throw new Error('Sessão expirada ou inválida. Faça login novamente.');
        }

        // ANTI-IMPERSONATION: Garante que o usuário só pode gerar pagamento para si mesmo
        if (user.id !== userIdText) {
            console.error(`[SECURITY] User ${user.id} tried to create payment for ${userIdText}`);
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: 'payment_impersonation_attempt',
                status: 'blocked',
                details: { target_user_id: userIdText }
            });
            throw new Error('Violação de segurança: Você não pode gerar pagamentos para outra conta.');
        }

        // 3. Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userIdText)
            .single();

        if (profileError || !profile) {
            console.error('Database Error:', profileError);
            throw new Error('Usuário não encontrado no banco de dados.');
        }

        // 4. Validate Critical Information
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
        if (!cpf || !isValidCPF(cpf)) {
            throw new Error('Você precisa de um CPF válido cadastrado para realizar o pagamento. Vá nas configurações do seu perfil e adicione.');
        }

        // 5. Get or create Asaas customer
        const customerId = await getOrCreateAsaasCustomer(supabase, profile, payerEmail);

        // 6. Create PIX payment in Asaas
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`[PIX] Creating Asaas charge for customer: ${customerId} | User: ${userIdText}`);

        const charge = await asaasRequest('/v3/payments', 'POST', {
            customer: customerId,
            billingType: 'PIX',
            value: PLAN_PRICE,
            dueDate: today,
            description: `Assinatura ${PLAN_NAME.toUpperCase()} - ${SYSTEM_NAME.toUpperCase()} (1 Mês)`,
            externalReference: userIdText,
        });

        console.log(`[PIX] Charge created: ${charge.id}, status: ${charge.status}`);

        // 7. Get PIX QR Code
        const pixData = await asaasRequest(`/v3/payments/${charge.id}/pixQrCode`, 'GET');

        if (!pixData.encodedImage || !pixData.payload) {
            throw new Error('Asaas retornou sucesso, mas os dados do PIX (QRCode) não vieram no payload.');
        }

        // AUDIT LOG: Registro de geração de fatura
        await supabase.from('audit_logs').insert({
            user_id: userIdText,
            action: 'payment_created',
            status: 'success',
            details: { payment_id: charge.id, type: 'PIX', value: PLAN_PRICE }
        });

        // 8. Standardized Success Response
        return new Response(
            JSON.stringify({
                success: true,
                paymentId: charge.id,
                qrCode: pixData.payload,          // Pix copia-e-cola
                qrCodeBase64: pixData.encodedImage, // Base64 image for QR code
                externalReference: userIdText,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('[CRITICAL ASAAS API ERROR]:', error);

        let errorMsg = 'Ocorreu um erro inesperado ao gerar a fatura. Tente novamente mais tarde.';
        if (error.message) {
            errorMsg = error.message;
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMsg,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
