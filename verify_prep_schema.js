import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Testando upsert na tabela fnde_preparacoes com as novas colunas...');

    const testData = {
        nome: 'TESTE SCHEMA',
        rendimento_porcoes: 1,
        categoria_cardapio: 'CRECHE',
        etapa_ensino: 'Teste',
        modalidade_ensino: 'Teste',
        faixa_etaria: 'Teste'
    };

    const { data, error } = await supabase
        .from('fnde_preparacoes')
        .insert([testData])
        .select();

    if (error) {
        console.error('ERRO DETECTADO:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Dica:', error.hint);
    } else {
        console.log('Upsert de teste realizado com sucesso! As colunas existem.');
        // Limpa o teste
        await supabase.from('fnde_preparacoes').delete().eq('nome', 'TESTE SCHEMA');
    }
}

checkSchema();
