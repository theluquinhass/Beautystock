import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log("Creating test user...");
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'test_mp_error@beautystock.com',
        email_confirm: true,
        password: 'password123',
        user_metadata: {
            first_name: 'Test',
            last_name: 'User'
        }
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    console.log("User created:", authUser.user.id);

    // Profile is usually created by trigger, let's wait a bit
    await new Promise(r => setTimeout(r, 2000));

    console.log("Testing create-subscription edge function...");
    const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
            userId: authUser.user.id,
            email: authUser.user.email
        }
    });

    if (error) {
        console.error("Function Error:", error);
    } else {
        console.log("Function Success:", data);
    }
}

test();
