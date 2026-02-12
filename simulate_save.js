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

async function testSave() {
    console.log('--- SIMULANDO SALVAMENTO DE FICHA TÉCNICA ---');

    const preparacao = {
        nome: 'ARROZ COLORIDO COM LEGUMES (TESTE)',
        descricao: 'Preparação de teste via script',
        modo_preparo: 'Teste de modo de preparo',
        rendimento_porcoes: 150,
        categoria_cardapio: 'CRECHE',
        etapa_ensino: '',
        modalidade_ensino: 'quilombola',
        faixa_etaria: '01 - 3 anos',
        updated_at: new Date().toISOString()
    };

    const ingredientes = [
        {
            alimento_id: '86899564-9be7-4638-95af-69b779a52709', // Assumindo um ID existente ou tentando inserir qualquer um
            quantidade_per_capita: 50
        }
    ];

    console.log('1. Tentando salvar cabeçalho...');
    const { data: prepData, error: prepError } = await supabase
        .from('fnde_preparacoes')
        .insert([preparacao])
        .select()
        .single();

    if (prepError) {
        console.error('❌ ERRO NO CABEÇALHO:', prepError.message);
        console.error('Detalhes:', prepError.details);
        console.error('Hint:', prepError.hint);
        return;
    }

    console.log('✅ Cabeçalho salvo! ID:', prepData.id);

    console.log('2. Tentando salvar ingredientes...');
    const { error: ingError } = await supabase
        .from('fnde_preparacao_ingredientes')
        .insert(ingredientes.map(ing => ({
            ...ing,
            preparacao_id: prepData.id
        })));

    if (ingError) {
        console.error('❌ ERRO NOS INGREDIENTES:', ingError.message);
        console.error('Detalhes:', ingError.details);
    } else {
        console.log('✅ Tudo salvo com sucesso!');
    }

    // Cleanup
    await supabase.from('fnde_preparacoes').delete().eq('id', prepData.id);
}

testSave();
