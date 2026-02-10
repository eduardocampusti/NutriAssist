
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

async function checkTable(tableName) {
    try {
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        if (error) {
            return `❌ ${tableName}: ${error.code} - ${error.message}`;
        }
        const columns = data && data.length > 0 ? Object.keys(data[0]).join(', ') : '(vazia)';
        return `✅ ${tableName}: [${columns}]`;
    } catch (e) {
        return `❌ ${tableName}: Exception`;
    }
}

async function run() {
    const tables = [
        'procurement_processes', 'contracts', 'licitacoes', 'compras',
        'inventory_movements', 'estoque_movimentacoes',
        'menu_executions', 'execucoes_cardapio'
    ];
    let output = [];
    for (const t of tables) {
        output.push(await checkTable(t));
    }
    fs.writeFileSync('table_results_final.txt', output.join('\n'), 'utf-8');
    console.log('Results written to table_results_final.txt');
}

run();
