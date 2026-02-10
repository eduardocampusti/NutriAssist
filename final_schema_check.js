
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

async function inspect(table) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) return `❌ ${table}: ${error.message}`;
    if (!data || data.length === 0) return `✅ ${table}: EMPTY`;
    return `✅ ${table}: [${Object.keys(data[0]).join(', ')}]`;
}

async function run() {
    const res = [
        await inspect('escolas'),
        await inspect('cardapios'),
        await inspect('inventory_items'),
        await inspect('inventory_movements'),
        await inspect('students_ne')
    ];
    fs.writeFileSync('schema_final_check.txt', res.join('\n'));
}

run();
