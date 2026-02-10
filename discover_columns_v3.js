
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

async function inspect(table, cols) {
    let working = [];
    for (const c of cols) {
        const { error } = await supabase.from(table).select(c).limit(1);
        if (!error) working.push(c);
    }
    return `${table}: [${working.join(', ')}]`;
}

async function run() {
    const res = [
        await inspect('inventory_items', ['id', 'nome', 'descricao', 'cost_per_unit', 'preco_unitario', 'is_ultra_processed', 'classificacao_nova', 'allowed_af']),
        await inspect('inventory_movements', ['id', 'item_id', 'quantidade', 'tipo', 'finalidade', 'created_at', 'data_movimento']),
        await inspect('menu_plans', ['id', 'titulo', 'escola_id', 'status', 'created_at']),
        await inspect('cardapios', ['id', 'nome', 'escola_id', 'status', 'created_at'])
    ];
    fs.writeFileSync('column_discovery_v3.txt', res.join('\n'));
}

run();
