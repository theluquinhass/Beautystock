const { MercadoPagoConfig, PreApproval } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-3102015251223059-021209-b80ffe6cb30f778d963b12440998d36b-2938704088' });
const preapproval = new PreApproval(client);

async function run() {
  try {
    const result = await preapproval.create({
      body: {
        payer_email: 'test_user_123@test.com',
        back_url: 'https://google.com',
        reason: 'Test',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 10,
          currency_id: 'BRL'
        },
        status: 'pending',
        external_reference: '123'
      }
    });
    console.log("Success", result);
  } catch (e) {
    console.error("Error", e.message, e.response?.data);
  }
}
run();
