import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
    const sql = fs.readFileSync('./supabase/migrations/update_catalog_store_info.sql', 'utf8');

    // Split SQL by statements (naive approach for this specific script)
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
        if (stmt.startsWith('--')) continue;
        console.log('Executing:', stmt.substring(0, 50) + '...');
        const { error } = await supabase.rpc('run_sql', { sql_query: stmt });
        if (error) {
            console.log('Trying alternative approach for statement...');
            // Not all DBs have run_sql. For schema changes without direct sql access in JS client, 
            // we might need to rely on the user to run it in the Supabase Dashboard SQL Editor
            console.error(error);
        }
    }
    console.log('Check complete.');
}

run();
