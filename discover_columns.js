
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
    // Try to select a non-existent column to trigger a "column not found" error 
    // that might contain hint if we were in psql, but here we just try to see 
    // if we can at least get an error that lists something or try to use rpc if possible.
    // Better: Since we can't see columns from empty tables easily without rpc, 
    // we'll try to select common columns and see which ones fail.
    const commonCols = ['id', 'created_at', 'item_id', 'inventory_item_id', 'quantidade', 'quantity', 'tipo', 'type', 'total_value', 'value', 'price', 'cost'];
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
        await inspectColumns('escolas'),
        await inspectColumns('menu_plans')
    ];
    fs.writeFileSync('column_discovery.txt', res.join('\n'));
}

run();
