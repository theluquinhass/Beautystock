import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get('MP_ACCESS_TOKEN') ?? ''
    });
    const preference = new Preference(client);

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const baseUrl = Deno.env.get('FRONTEND_URL') || origin;

    const body = {
      items: [
        {
          id: 'pro_renewal_1_month',
          title: 'Renovação BeautyStock PRO (1 Mês)',
          description: 'Renovação do acesso premium por mais 30 dias',
          picture_url: 'https://beautystock.com.br/icon-512x512.png',
          quantity: 1,
          unit_price: 29.90,
          currency_id: 'BRL',
        }
      ],
      payer: {
        email: email || profile.email || `user_${userId}@beautystock-customer.com`,
        name: profile.first_name || 'Cliente',
        surname: profile.last_name || 'BeautyStock'
      },
      back_urls: {
        success: `${baseUrl}/conta?renewal=success`,
        failure: `${baseUrl}/conta?renewal=failure`,
        pending: `${baseUrl}/conta?renewal=pending`
      },
      auto_return: 'approved',
      external_reference: `${userId}::renewal`, // Tagging as renewal
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [{ id: 'ticket' }], // Allow PIX and Credit Card, disable boleto for speed
        installments: 1
      },
      statement_descriptor: 'BEAUTYSTOCK PRO'
    };

    const result = await preference.create({ body });

    return new Response(
      JSON.stringify({ init_point: result.init_point, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
