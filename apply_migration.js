import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function applyMigration() {
    console.log('--- APLICANDO MIGRAÇÃO SQL ---');

    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260211_complete_fnde_fix.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('Arquivo de migração não encontrado:', sqlPath);
        return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Tentando aplicar via RPC customizado (exec_sql) se disponível...');

    // Tentativa de usar um RPC de utilidade para rodar SQL (comum em setups de nutrição escolar para migrações rápidas)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Falha via RPC (provavelmente não permitido ou inexistente):', error.message);
        console.log('\n--- ATENÇÃO: EXECUÇÃO MANUAL NECESSÁRIA ---');
        console.log('O cliente Supabase não tem permissão para rodar comandos ALTER TABLE diretamente.');
        console.log('Por favor, copie o conteúdo de: ');
        console.log(sqlPath);
        console.log('E cole no SQL Editor do seu dashboard Supabase.');
    } else {
        console.log('✅ Migração aplicada com sucesso via RPC!');
    }
}

applyMigration();
