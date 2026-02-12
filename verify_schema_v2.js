import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log('--- VERIFICAÇÃO DE ESQUEMA ---');

    // Check fnde_preparacoes columns via RPC or direct select if there are rows
    const { data: cols, error: err } = await supabase.rpc('fnde_get_table_columns', { p_table_name: 'fnde_preparacoes' });

    if (err) {
        console.log('RPC fnde_get_table_columns not found, trying direct select...');
        const { data, error } = await supabase.from('fnde_preparacoes').select('*').limit(1);
        if (error) {
            console.error('Erro ao acessar fnde_preparacoes:', error.message);
        } else if (data.length > 0) {
            console.log('Colunas fnde_preparacoes:', Object.keys(data[0]));
        } else {
            console.log('Tabela fnde_preparacoes está vazia, não foi possível inferir colunas via SELECT.');
        }
    } else {
        console.log('Colunas fnde_preparacoes:', cols);
    }

    const { data: nutriData, error: nutriErr } = await supabase.from('fnde_composicao_nutricional').select('*').limit(1);
    if (!nutriErr && nutriData.length > 0) {
        console.log('Colunas fnde_composicao_nutricional:', Object.keys(nutriData[0]));
    }
}

checkSchema();
