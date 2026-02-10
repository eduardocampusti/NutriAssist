
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

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
    // query information_schema.tables
    const { data, error } = await supabase.rpc('get_tables');

    if (error) {
        // Fallback: try to select from a common table or use a raw query if RPC fails
        console.log('RPC failed, trying raw query via select on pg_catalog (if permitted)');
        const { data: data2, error: error2 } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
        if (error2) {
            console.log('Raw query failed. Listing common names manually:');
            const tables = ['schools', 'escolas', 'purchases', 'licitacoes', 'menu_plans', 'cardapios', 'alimentos_normativos', 'inventory_items'];
            for (const t of tables) {
                const { error: e } = await supabase.from(t).select('*', { count: 'exact', head: true });
                console.log(`${t}: ${e ? '❌ ' + e.code : '✅'}`);
            }
        } else {
            console.log('Tables:', data2.map(t => t.tablename).join(', '));
        }
    } else {
        console.log('Tables:', data);
    }
}

listAllTables();
