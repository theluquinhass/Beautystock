import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables. Check your .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAsaasSubscription() {
    console.log("🚀 Starting Asaas Subscription Test...");

    const testEmail = `test_asaas_${Date.now()}@beautystock.com`;
    const testPassword = 'password123';

    try {
        // 1. Create a temporary test user
        console.log(`Creating test user: ${testEmail}`);
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            email_confirm: true,
            password: testPassword,
            user_metadata: {
                first_name: 'Test',
                last_name: 'Asaas',
                cpf: '12345678909' // Added for Asaas requirement
            }
        });

        if (authError) throw authError;
        const userId = authUser.user.id;
        console.log(`✅ User created: ${userId}`);

        // 2. Wait for profile trigger (common in Supabase setups)
        console.log("Waiting for profile creation...");
        await new Promise(r => setTimeout(r, 3000));

        // 3. Invoke the create-subscription edge function
        console.log("Involving 'create-subscription' Edge Function (Asaas)...");
        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: {
                userId: userId,
                email: testEmail
            }
        });

        if (error) {
            console.error("❌ Edge Function Error:", error);
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const body = await error.context.json();
                    console.error("📦 Error Response Body:", JSON.stringify(body, null, 2));
                } catch (e) {
                    console.warn('⚠️ Could not parse error response body:', e);
                }
            } else if (error.details) {
                console.error("📦 Error Details:", error.details);
            }
            // Cleanup user on error
            console.log("\nCleaning up test user...");
            await supabase.auth.admin.deleteUser(userId);
            return;
        }

        console.log("✅ Success! Edge Function response:");
        console.log(JSON.stringify(data, null, 2));

        if (data?.init_point) {
            console.log("\n🔗 Test checkout URL (Asaas):");
            console.log(data.init_point);
        } else {
            console.warn("\n⚠️ No init_point (checkout URL) returned.");
        }

        // 4. Cleanup (Optional: uncomment to delete the user after test)
        // console.log("\nCleaning up test user...");
        // await supabase.auth.admin.deleteUser(userId);
        // console.log("✅ Cleanup complete.");

    } catch (err) {
        console.error("💥 Unexpected test error:", err.message);
    }
}

testAsaasSubscription();
