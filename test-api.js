const https = require('https');
require('dotenv').config();

const data = JSON.stringify({ userId: '716de81c-8e4d-4e92-93df-520fd0e7bb17', email: 'test@beautystock-customer.com' });

const options = {
  hostname: new URL(process.env.VITE_SUPABASE_URL).hostname,
  port: 443,
  path: '/functions/v1/create-pix-payment',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => { process.stdout.write(d); });
});

req.on('error', error => { console.error(error); });
req.write(data);
req.end();
