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

async function checkColumns() {
    console.log('--- DB STRUCT CHECK ---');

    // Check fnde_preparacoes
    const { data: prepCols, error: prepErr } = await supabase
        .from('fnde_preparacoes')
        .select('*')
        .limit(0); // Only gets headers/schema info if handled by client, but Supabase client doesn't return columns for empty result easily.

    // Better way: use RPC to query information_schema if available, or just try a specific column
    const { error: colErr } = await supabase
        .from('fnde_preparacoes')
        .select('categoria_cardapio')
        .limit(1);

    if (colErr) {
        if (colErr.message.includes('column "categoria_cardapio" does not exist')) {
            console.log('❌ MIGRATION NOT APPLIED: column "categoria_cardapio" missing in fnde_preparacoes.');
        } else {
            console.error('Error checking column:', colErr.message);
        }
    } else {
        console.log('✅ MIGRATION APPLIED: column "categoria_cardapio" exists in fnde_preparacoes.');
    }

    const { error: nutErr } = await supabase
        .from('fnde_composicao_nutricional')
        .select('gordura_saturada_g')
        .limit(1);

    if (nutErr) {
        if (nutErr.message.includes('column "gordura_saturada_g" does not exist')) {
            console.log('❌ MIGRATION NOT APPLIED: column "gordura_saturada_g" missing in fnde_composicao_nutricional.');
        } else {
            console.error('Error checking nutrition column:', nutErr.message);
        }
    } else {
        console.log('✅ MIGRATION APPLIED: column "gordura_saturada_g" exists in fnde_composicao_nutricional.');
    }
}

checkColumns();
