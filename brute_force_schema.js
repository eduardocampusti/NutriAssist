
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

async function check(t) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) return null;
    return { table: t, cols: data.length > 0 ? Object.keys(data[0]) : [] };
}

async function run() {
    const tables = [
        'schools', 'escolas', 'escola',
        'purchases', 'purchases_items', 'compras', 'compras_itens', 'pedidos',
        'licitacoes', 'licitacao_itens', 'procurement_processes', 'procurement_items',
        'inventory_items', 'alimentos_normativos', 'produtos', 'item_estoque',
        'inventory_movements', 'estoque_movimentacoes', 'movimentacoes',
        'menu_plans', 'cardapios', 'cardapio',
        'menu_dishes', 'pratos', 'preparacoes',
        'menu_executions', 'execucoes_cardapio', 'execucoes',
        'students', 'alunos', 'aluno',
        'students_ne', 'alunos_nae', 'nae',
        'profiles', 'usuarios', 'perfis'
    ];
    let found = [];
    for (const t of tables) {
        const res = await check(t);
        if (res) found.push(res);
    }
    fs.writeFileSync('brute_force_schema.json', JSON.stringify(found, null, 2));
}

run();
