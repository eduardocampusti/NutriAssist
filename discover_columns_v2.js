
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

async function inspectColumns(table) {
    const commonCols = [
        'id', 'created_at', 'item_id', 'quantidade', 'tipo',
        'valor', 'valor_total', 'preco', 'preco_unitario', 'custo', 'custo_unitario',
        'cost', 'unit_cost', 'total_cost', 'price', 'unit_price',
        'finalidade', 'observacao', 'justificativa', 'origem', 'af', 'agricultura_familiar'
    ];
    let working = [];
    for (const c of commonCols) {
        const { error } = await supabase.from(table).select(c).limit(1);
        if (!error) working.push(c);
    }
    return `${table}: [${working.join(', ')}]`;
}

async function run() {
    const res = [
        await inspectColumns('inventory_movements'),
        await inspectColumns('inventory_items'),
        await inspectColumns('menu_plans'),
        await inspectColumns('cardapios')
    ];
    fs.writeFileSync('column_discovery_v2.txt', res.join('\n'));
}

run();
