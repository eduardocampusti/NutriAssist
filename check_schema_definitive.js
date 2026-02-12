
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

async function checkSchemaDefinitive() {
    console.log('--- Definitive Schema Check (via RPC/Query) ---');

    // Attempting to query information_schema if possible (often blocked or restricted)
    // A better way is to try to select the column specifically and handle the error code.
    const colsToCheck = [
        'categoria_cardapio', 'etapa_ensino', 'modalidade_ensino',
        'faixa_etaria', 'imagem_url', 'created_by'
    ];

    for (const col of colsToCheck) {
        const { error } = await supabase.from('fnde_preparacoes').select(col).limit(1);
        if (error) {
            if (error.code === '42703') {
                console.log(`❌ Column ${col}: MISSING`);
            } else if (error.code === '42501') {
                console.log(`✅ Column ${col}: EXISTS (but RLS prevents access or table is restricted)`);
            } else {
                console.log(`❓ Column ${col}: Error ${error.code} - ${error.message}`);
            }
        } else {
            console.log(`✅ Column ${col}: EXISTS`);
        }
    }
}

checkSchemaDefinitive();
