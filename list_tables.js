import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('--- LISTANDO TABELAS DO BANCO ---');

    // Consulta ao information_schema via RPC se possível, 
    // ou tentamos acessar tabelas comuns para ver o que responde.

    // Tenta uma query de sistema
    const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    });

    if (error) {
        console.error('Erro ao listar via RPC:', error.message);

        console.log('Tentando acesso direto a tabelas conhecidas...');
        const commonTables = ['profiles', 'fnde_preparacoes', 'fnde_alimentos', 'schools', 'escolas', 'preparacoes'];
        for (const t of commonTables) {
            const { error: e } = await supabase.from(t).select('*').limit(0);
            if (e) {
                console.log(`❌ ${t}: ${e.message}`);
            } else {
                console.log(`✅ ${t}: Existe`);
            }
        }
    } else {
        console.log('Tabelas encontradas:');
        data.forEach(t => console.log(`- ${t.table_name}`));
    }
}

listTables();
