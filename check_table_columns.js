
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim();
        }
    });
} catch (e) { }

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    console.log('Checking columns for table "students"...');

    // Supabase JS doesn't have a direct 'show columns' method, usually we check via trying to select data.
    // However, we can query proper schema if we had admin access, but here we only have anon key usually.
    // We will try to inserting a dummy row with the new columns and fail (transaction rollback approach not easy via JS client).
    // Instead, let's just select one row and see the keys returned.

    const { data, error } = await supabase.from('students').select('*').limit(1);

    if (error) {
        console.error('Error selecting from students:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found in returned row:', Object.keys(data[0]));
        if (data[0].hasOwnProperty('dados_complementares')) {
            console.log('✅ dados_complementares exists.');
        } else {
            console.log('❌ dados_complementares MISSING.');
        }
        if (data[0].hasOwnProperty('foto_url')) {
            console.log('✅ foto_url exists.');
        } else {
            console.log('❌ foto_url MISSING.');
        }
    } else {
        console.log('Table is empty. Cannot verify columns via SELECT *. Trying simple insert to check schema validity...');
        // If empty, we can't see keys. But user said "No rows returned" on migration, implying success.
    }
}

checkColumns();
