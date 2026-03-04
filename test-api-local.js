require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

async function test() {
    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    try {
        const result = await payment.create({
            body: {
                transaction_amount: 29.90,
                description: 'BeautyStock PRO - Acesso de 1 Mês',
                payment_method_id: 'pix',
                payer: {
                    email: 'test@beautystock.com',
                    first_name: 'Test',
                    last_name: 'User'
                },
                external_reference: '12345'
            }
        });
        console.log("Success:", result.point_of_interaction?.transaction_data?.qr_code);
    } catch(e) {
        console.log("Error:", e.response?.data || e.message);
    }
}
test();
