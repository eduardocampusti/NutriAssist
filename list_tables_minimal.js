
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const getEnv = (key) => {
    const line = envLines.find(l => l.startsWith(key));
    return line ? line.split('=')[1].trim() : null;
};
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function c(t) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    return count;
}

async function run() {
    console.log(`cardapios: ${await c('cardapios')}`);
    console.log(`menu_plans: ${await c('menu_plans')}`);
    console.log(`estoque_movimentacoes: ${await c('estoque_movimentacoes')}`);
    console.log(`inventory_movements: ${await c('inventory_movements')}`);
    console.log(`licitacoes: ${await c('licitacoes')}`);
    console.log(`purchases: ${await c('purchases')}`);
    console.log(`escolas: ${await c('escolas')}`);
    console.log(`schools: ${await c('schools')}`);
}
run();
