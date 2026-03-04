const axios = require('axios');

async function createTestUser() {
    try {
        const response = await axios.post(
            'https://api.mercadopago.com/users/test_user',
            {
                site_id: 'MLB',
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN || 'TEST-8729955231044261-030316-5441c6d3edb6c2f356a33d513234be4b-2938704088'}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\n\n✅ CONTA DE TESTE COMPRADOR CRIADA COM SUCESSO!\n');
        console.log('Use EXATAMENTE ESSE E-MAIL e SENHA para logar na tela do Mercado Pago ("Entrar na minha conta do Mercado Pago") ao abrir o link de assinatura na ABA ANÔNIMA:\n');
        console.log('-----------------------------------');
        console.log('📧 E-mail: ' + response.data.email);
        console.log('🔒 Senha:  ' + response.data.password);
        console.log('-----------------------------------\n');
        console.log('Após o login, você pode usar os cartões de testes (Mastercard 4545...) e o CPF que ele já pedir.\n');

    } catch (error) {
        console.error('Erro ao criar conta de teste:', error.response ? error.response.data : error.message);
    }
}

createTestUser();
