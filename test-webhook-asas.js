import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    // get a valid user first
    const { data: users } = await supabase.from('profiles').select('id, email, plan').limit(1);
    if (!users || users.length === 0) {
        console.log("No users found to test with");
        return;
    }
    const user = users[0];
    console.log(`Testing with user: ${user.email} (current plan: ${user.plan})`);

    const { data, error } = await supabase.functions.invoke('asaas-webhook', {
        headers: {
             'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN
        },
        body: {
            event: "PAYMENT_CONFIRMED",
            payment: {
                id: `pay_test_${Date.now()}`,
                status: "CONFIRMED",
                externalReference: user.id
            }
        }
    });

    console.log("Webhook Response:", data, error);

    // check if plan updated
    const { data: updatedUser } = await supabase.from('profiles').select('plan, expires_at').eq('id', user.id).single();
    console.log(`Plan after webhook: ${updatedUser.plan}, expires_at: ${updatedUser.expires_at}`);
}
test();
