import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: webhooks, error: err1 } = await supabase.from('processed_webhooks').select('*').order('created_at', { ascending: false }).limit(5);
    console.log("Recent webhooks:", webhooks, "Error:", err1);
    
    const { data: profiles, error: err2 } = await supabase.from('profiles').select('email, plan').order('updated_at', { ascending: false }).limit(5);
    console.log("Recent profiles updated:", profiles);
}
check();
