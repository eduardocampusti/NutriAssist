
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.includes('=') && line.split('=')[0].trim() === key) {
            return line.split('=')[1].trim();
        }
    }
    return null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    const sql = fs.readFileSync('fix_missing_columns.sql', 'utf8');
    console.log('--- Applying fix_missing_columns.sql ---');

    // We try to use exec_sql RPC if available
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ FAILED to apply migration via RPC:', error.message);
        console.log('\n--- MANUAL ACTION REQUIRED ---');
        console.log('Copy the following SQL and run it in the Supabase Dashboard SQL Editor:');
        console.log(sql);
    } else {
        console.log('✅ Migration APPLIED SUCCESSFULLY via RPC!');
    }
}

runMigration();
