
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually since we are running with ts-node/node
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName: string) {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (error) {
        return `[ERROR] ${tableName}: ${error.message}`;
    }
    return `[OK] ${tableName}: ${count} rows`;
}

async function verifySchema() {
    console.log("--- Checking Schemas & Data Volume ---");

    // Schools
    console.log(await checkTable('escolas'));
    console.log(await checkTable('schools'));

    // Menus
    console.log(await checkTable('cardapios'));
    console.log(await checkTable('menu_plans'));

    // Menu Executions
    console.log(await checkTable('menu_executions'));
    // console.log(await checkTable('execucoes_cardapio')); // hypothetical

    // Items
    console.log(await checkTable('cardapio_itens'));
    console.log(await checkTable('menu_dishes'));
    console.log(await checkTable('menu_items'));

    // Stock/Inventory
    console.log(await checkTable('estoque_produtos'));
    console.log(await checkTable('inventory_items'));
    console.log(await checkTable('estoque_movimentacoes'));
    console.log(await checkTable('inventory_movements'));

    // Procurement
    console.log(await checkTable('licitacoes'));
    console.log(await checkTable('purchases'));
    console.log(await checkTable('procurement_processes'));

    console.log("--- End Diagnosis ---");
}

verifySchema();
