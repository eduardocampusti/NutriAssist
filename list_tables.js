
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis do .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const getEnv = (key) => {
    const line = envLines.find(l => l.startsWith(key));
    return line ? line.split('=')[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    // Check existence by selecting 1 row
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') { // Undefined Table
            return `❌ ${tableName.padEnd(25)}: NÃO EXISTE`;
        }
        return `⚠️ ${tableName.padEnd(25)}: ERRO ${error.code} - ${error.message}`;
    }

    // Check columns if it exists
    const { data, error: colError } = await supabase.from(tableName).select('*').limit(1);
    const columns = data && data.length > 0 ? Object.keys(data[0]).join(', ') : '(vazia ou sem permissão de leitura de colunas)';

    return `✅ ${tableName.padEnd(25)}: ${count} registros. Cols: [${columns.substring(0, 50)}...]`;
}

async function runDiagnosis() {
    console.log('--- DIAGNÓSTICO DE TABELAS ---');


    // MENUS
    // console.log(await checkTable('cardapios'));
    // console.log(await checkTable('menu_plans'));

    // EXECUCOES
    // console.log(await checkTable('menu_executions'));
    // console.log(await checkTable('execucoes_cardapio'));

    // ESTOQUE
    // console.log(await checkTable('estoque_movimentacoes'));
    // console.log(await checkTable('inventory_movements'));
    // console.log(await checkTable('estoque_produtos'));
    // console.log(await checkTable('inventory_items'));

    // ESCOLAS
    // console.log(await checkTable('escolas'));
    // console.log(await checkTable('schools'));

    // COMPRAS
    console.log(await checkTable('licitacoes'));
    console.log(await checkTable('purchases'));
    console.log(await checkTable('procurement_processes'));

    console.log('--- FIM DO DIAGNÓSTICO ---');
}

runDiagnosis();
