
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

async function checkDeepDiscovery() {
    console.log('--- Deep Discovery: FNDE Modules ---');

    // Check fnde_preparacao_ingredientes
    const { error: ingErr } = await supabase.from('fnde_preparacao_ingredientes').select('id').limit(1);
    if (ingErr && ingErr.code === 'PGRST116') { // No rows found (if table exists but empty)
        console.log('✅ Table fnde_preparacao_ingredientes exists (empty).');
    } else if (ingErr && ingErr.code === '42P01') { // Undefined table
        console.log('❌ Table fnde_preparacao_ingredientes DOES NOT EXIST.');
    } else if (!ingErr) {
        console.log('✅ Table fnde_preparacao_ingredientes exists.');
    } else {
        console.log('❓ Table fnde_preparacao_ingredientes check error:', ingErr.message, ingErr.code);
    }

    // Check function fnde_get_preparacao_nutrientes (indirectly via rpc)
    // UUID zero is a good dummy id
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const { error: rpcErr } = await supabase.rpc('fnde_get_preparacao_nutrientes', { p_preparacao_id: dummyId });
    if (rpcErr && rpcErr.code === 'P0001') { // Custom exception if not found maybe, or 42883
        console.log('❌ Function fnde_get_preparacao_nutrientes DOES NOT EXIST or failed.');
    } else if (rpcErr && rpcErr.code === '42883') { // Undefined function
        console.log('❌ Function fnde_get_preparacao_nutrientes DOES NOT EXIST.');
    } else if (!rpcErr || rpcErr.code === 'PGRST116') {
        console.log('✅ Function fnde_get_preparacao_nutrientes seems to exist.');
    } else {
        console.log('❓ Function check error:', rpcErr.message, rpcErr.code);
    }
}

checkDeepDiscovery();
