
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados em .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosePreparation(id) {
    console.log(`\n🔍 Diagnosticando Preparação ID: ${id}...`);
    
    const { data, error } = await supabase
        .from('fnde_preparacoes')
        .select(`
            *,
            ingredientes:fnde_preparacao_ingredientes(
                *,
                alimento:fnde_alimentos(
                    nome:descricao, 
                    grupo_alimentar,
                    composicao:fnde_composicao_nutricional(*)
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('❌ Erro na consulta:', error);
        return;
    }

    console.log('\n✅ Dados carregados com sucesso.');
    console.log(`Nome: ${data.nome}`);
    console.log(`Ingredientes encontrados: ${data.ingredientes?.length || 0}`);

    if (data.ingredientes && data.ingredientes.length > 0) {
        data.ingredientes.forEach((ing, i) => {
            console.log(`\n--- Ingrediente ${i + 1}: ${ing.alimento?.nome || 'N/A'} ---`);
            console.log(`Quantidade Per Capita: ${ing.quantidade_per_capita}`);
            
            const alimento = ing.alimento;
            if (!alimento) {
                console.log('⚠️ Alimento não encontrado no objeto ingrediente.');
                return;
            }

            console.log('Chaves no objeto alimento:', Object.keys(alimento));
            
            const composicao = alimento.composicao;
            if (!composicao) {
                console.log('❌ Propriedade "composicao" AUSENTE no objeto alimento.');
                // Verifica se veio com o nome original da tabela
                if (alimento.fnde_composicao_nutricional) {
                    console.log('💡 Encontrado com nome original: "fnde_composicao_nutricional"');
                }
            } else if (Array.isArray(composicao)) {
                console.log(`Propriedade "composicao" é ARRAY com ${composicao.length} itens.`);
                if (composicao.length > 0) {
                    console.log('Nutrientes do primeiro item:', Object.keys(composicao[0]).join(', '));
                    console.log('Energia Kcal:', composicao[0].energia_kcal);
                } else {
                    console.log('⚠️ Array "composicao" está VAZIO.');
                }
            } else {
                console.log('❓ Propriedade "composicao" existe mas não é um array:', typeof composicao);
            }
        });
    } else {
        console.log('⚠️ A preparação não possui ingredientes cadastrados.');
    }
}

// Pega o ID do argumento ou tenta buscar a primeira preparação disponível
async function main() {
    const argId = process.argv[2];
    if (argId) {
        await diagnosePreparation(argId);
    } else {
        console.log('Buscando primeira preparação disponível para diagnóstico...');
        const { data } = await supabase.from('fnde_preparacoes').select('id, nome').limit(1).single();
        if (data) {
            await diagnosePreparation(data.id);
        } else {
            console.log('Nenhuma preparação encontrada no banco.');
        }
    }
}

main();
