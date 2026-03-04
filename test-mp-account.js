const { MercadoPagoConfig, PreApproval } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-3102015251223059-021209-b80ffe6cb30f778d963b12440998d36b-2938704088' });
console.log("SDK versions loaded");
