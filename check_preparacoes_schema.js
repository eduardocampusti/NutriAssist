
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

async function checkPreparacoesSchema() {
    console.log('--- Checking fnde_preparacoes schema ---');

    // We try to select various columns to see which ones exist
    const potentialCols = [
        'id', 'nome', 'descricao', 'modo_preparo', 'rendimento_porcoes',
        'categoria_cardapio', 'etapa_ensino', 'modalidade_ensino',
        'faixa_etaria', 'imagem_url', 'created_by', 'created_at', 'updated_at'
    ];

    let existing = [];
    let missing = [];

    for (const col of potentialCols) {
        const { error } = await supabase.from('fnde_preparacoes').select(col).limit(1);
        if (error && (error.code === '42703' || error.message.includes('column') && error.message.includes('does not exist'))) {
            missing.push(col);
        } else if (!error) {
            existing.push(col);
        } else {
            console.error(`Error checking ${col}:`, error.message, 'Code:', error.code);
        }
    }

    console.log('✅ Existing columns:', existing.join(', '));
    console.log('❌ Missing columns:', missing.join(', '));

    if (missing.includes('imagem_url')) {
        console.log('CRITICAL: imagem_url is missing!');
    }
}

checkPreparacoesSchema();
