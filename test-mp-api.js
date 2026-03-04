const { MercadoPagoConfig, Payment } = require('mercadopago');

async function testMP() {
    const client = new MercadoPagoConfig({ 
        accessToken: process.env.VITE_MP_ACCESS_TOKEN || 'APP_USR-8729955231044261-030316-296b4249b85537d6f10fe8113f0bce34-2938704088' 
    });
    
    const payment = new Payment(client);
    
    try {
        const result = await payment.create({
            body: {
                transaction_amount: 29.90,
                description: 'BeautyStock PRO - Acesso de 1 Mês',
                payment_method_id: 'pix',
                payer: {
                    email: 'test@beautystock-customer.com',
                    first_name: 'Test',
                    last_name: 'Customer'
                }
            }
        });
        console.log("SUCCESS:", result.id);
    } catch(err) {
        console.error("MP ERROR:", err.response?.data?.cause || err.message || err);
    }
}
testMP();
