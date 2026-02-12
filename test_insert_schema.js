
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

async function testInsert() {
    console.log('--- Testing insert into fnde_preparacoes with imagem_url ---');
    const { data, error } = await supabase.from('fnde_preparacoes').insert({
        nome: 'TEST_INSERT_SCHEMA',
        imagem_url: 'http://example.com/test.jpg'
    }).select();

    if (error) {
        console.error('❌ Insert failed:', error.message, 'Code:', error.code);
    } else {
        console.log('✅ Insert SUCCESSFUL! Columns exist.');
        // Clean up
        await supabase.from('fnde_preparacoes').delete().eq('nome', 'TEST_INSERT_SCHEMA');
    }
}

testInsert();
