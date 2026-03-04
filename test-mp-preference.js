const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-8729955231044261-030316-5441c6d3edb6c2f356a33d513234be4b-2938704088' });
const preference = new Preference(client);

async function run() {
  try {
    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Assinatura BeautyStock PRO (1 Mês)',
            quantity: 1,
            unit_price: 29.90,
            currency_id: 'BRL'
          }
        ],
        payer: {
          email: 'test_user_123@test.com'
        },
        back_urls: {
          success: 'https://beautystock-app.vercel.app/dashboard',
          failure: 'https://beautystock-app.vercel.app/upgrade',
          pending: 'https://beautystock-app.vercel.app/dashboard'
        },
        auto_return: 'approved',
        external_reference: 'user_123'
      }
    });
    console.log("Success", result.init_point);
  } catch (e) {
    console.error("Error", e.message, e.response?.data);
  }
}
run();
