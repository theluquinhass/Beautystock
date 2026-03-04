import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';
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
        let { userId, email } = await req.json();

        if (!email) {
            email = `user_${userId}@beautystock-customer.com`;
        }

        console.log(`Starting transparent PIX creation for user: ${userId}, email: ${email}`);

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching profile:', profileError);
            throw new Error('Usuário não encontrado');
        }

        let firstName = profile.first_name || email.split('@')[0].replace(/[^a-zA-Z\s]/g, '') || 'Cliente';
        let lastName = profile.last_name || 'BeautyStock';

        // 2. Setup Mercado Pago Client
        const client = new MercadoPagoConfig({
            accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? ''
        });
        const payment = new Payment(client);

        console.log(`Creating PIX Payment for: ${firstName} ${lastName}`);

        const paymentData = {
            body: {
                transaction_amount: 29.90, // Valor do plano PRO de 1 mês
                description: 'BeautyStock PRO - Acesso de 1 Mês',
                payment_method_id: 'pix',
                payer: {
                    email: email,
                    first_name: firstName,
                    last_name: lastName
                },
                external_reference: userId, // CRITICAL: Links payment to our Webhook
            }
        };

        const result = await payment.create(paymentData);
        console.log('PIX Payment created successfully:', result.id);

        // O retorno da API de pagamentos do MP em PIX devolve o QR code copiável e a imagem base64
        const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;
        const paymentId = result.id;

        if (!qrCode) {
            throw new Error("Mercado Pago não retornou o código PIX.");
        }

        return new Response(
            JSON.stringify({
                success: true,
                paymentId: paymentId,
                qrCode: qrCode,
                qrCodeBase64: qrCodeBase64
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        const errorMsg = error.response?.data || error.message || error;
        console.error('CRITICAL MP API ERROR:', JSON.stringify(errorMsg));
        return new Response(
            JSON.stringify({ error: errorMsg }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
