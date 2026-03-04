import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';
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

    // Fallback for missing user email since MercadoPago requires one
    if (!email) {
      email = `user_${userId}@beautystock-customer.com`;
    }

    console.log(`Starting 1-month PRO preference creation for user: ${userId}, email: ${email}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get user profile
    console.log('Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Usuário não encontrado');
    }

    // 2. Setup Mercado Pago Client
    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? ''
    });
    const preference = new Preference(client);

    // Ensure we have a valid first name
    let firstName = profile.first_name || '';
    let lastName = profile.last_name || '';

    if (!firstName) {
      // Fallback to email prefix or default
      firstName = email.split('@')[0].replace(/[^a-zA-Z\s]/g, '') || 'Cliente';
    }

    console.log(`Using customer name: ${firstName} ${lastName}`);

    const backUrl = Deno.env.get('FRONTEND_URL') || 'https://beautystock-app.vercel.app/dashboard';

    const preferenceData = {
      body: {
        items: [
          {
            id: 'PRO_1_MONTH',
            title: 'BeautyStock PRO - Acesso de 1 Mês',
            quantity: 1,
            unit_price: 29.90, // Update this if you want to test with 1.00 directly real life
            currency_id: 'BRL',
            description: 'Acesso completo às ferramentas BeautyStock PRO por 30 dias.'
          }
        ],
        payer: {
          email: email,
          name: firstName,
          surname: lastName
        },
        back_urls: {
          success: backUrl,
          failure: `${Deno.env.get('FRONTEND_URL') || 'https://beautystock-app.vercel.app'}/upgrade`,
          pending: backUrl
        },
        auto_return: 'approved',
        external_reference: userId, // CRITICAL: This links the payment back to the user in our webhook
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: []
        },
        statement_descriptor: 'BEAUTYSTOCK'
      }
    };

    console.log('Creating Mercado Pago Preference...');
    const result = await preference.create(preferenceData);

    console.log('Preference created successfully:', result.id);

    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: result.id,
        initPoint: result.init_point
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    const errorMsg = error.response?.data || error.message || error;
    console.error('CRITICAL MP ERROR:', JSON.stringify(errorMsg));
    return new Response(
      JSON.stringify({ error: errorMsg, message: "Debug Payload" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
