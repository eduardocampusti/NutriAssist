
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

const tables = [
    'schools', 'escolas',
    'purchases', 'licitacoes', 'compras',
    'menu_plans', 'cardapios',
    'menu_items', 'cardapio_itens',
    'menu_executions', 'execucoes_cardapio',
    'inventory_items', 'alimentos_normativos', 'estoque_produtos',
    'inventory_movements', 'estoque_movimentacoes',
    'students', 'alunos',
    'students_ne', 'alunos_nae',
    'nutritional_evaluations', 'avaliacoes_nutricionais',
    'cooks', 'merendeiras'
];

async function run() {
    let results = [];
    for (const t of tables) {
        try {
            const { error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!error) {
                results.push(`✅ ${t}`);
            } else if (error.code !== '42P01') {
                results.push(`⚠️ ${t} (error ${error.code})`);
            }
        } catch (e) {
            results.push(`❌ ${t} (exception)`);
        }
    }
    console.log(results.join('\n'));
}

run();
