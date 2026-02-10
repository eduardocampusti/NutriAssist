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

async function debugLoad() {
    console.log('Testing fndePreparacaoService.getById logic...');

    // 1. Check tables first
    const tables = ['fnde_preparacoes', 'fnde_preparacao_ingredientes', 'fnde_alimentos'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error accessing ${table}:`, error.message);
        } else {
            console.log(`Table ${table} is accessible. Columns:`, Object.keys(data[0] || {}));
        }
    }

    // 2. Try the complex select
    const { data: preps } = await supabase.from('fnde_preparacoes').select('id').limit(1);
    if (preps && preps.length > 0) {
        const id = preps[0].id;
        console.log(`Attempting to load preparation ID: ${id}`);
        const { data, error } = await supabase
            .from('fnde_preparacoes')
            .select(`
                *,
                ingredientes:fnde_preparacao_ingredientes(
                    *,
                    alimento:fnde_alimentos(nome, grupo_alimentar)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Complex fetch failed:', error.message);
            console.error('Hint:', error.hint);
            console.error('Details:', error.details);
        } else {
            console.log('Complex fetch succeeded!');
        }
    } else {
        console.log('No preparations found to test loading.');
    }
}

debugLoad();
