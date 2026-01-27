import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis do .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const getEnv = (key) => {
    const line = envLines.find(l => l.startsWith(key));
    return line ? line.split('=')[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
    console.log('--- INICIANDO VERIFICAÇÃO DO ESQUEMA V3.0 ---');

    const tables = ['usuarios', 'alimentos', 'cardapios', 'cardapio_itens', 'alertas', 'justificativas', 'documentos'];

    for (const table of tables) {
        process.stdout.write(`Verificando tabela [${table}]... `);
        const { error } = await supabase.from(table).select('id').limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log('❌ NÃO ENCONTRADA');
            } else {
                console.log(`⚠️ ERRO DE PERMISSÃO/RLS (${error.message})`);
            }
        } else {
            console.log('✅ OK');
        }
    }
}

verifySchema();
