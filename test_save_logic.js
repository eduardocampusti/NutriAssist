import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSave() {
    console.log("🧪 Iniciando Teste de Salvamento de Ficha Técnica...");

    // 1. Simular Perfil de Nutricionista (Se houver algum no banco para teste)
    // Para teste anon, se o RLS permitir inserção para anon (não deve), falhará.
    // Mas aqui validamos a ESTRUTURA dos dados enviados.

    const testPrep = {
        nome: "TESTE AI SAVE " + Date.now(),
        descricao: "Teste automatizado de salvamento de receituário",
        modo_preparo: "Passo 1, Passo 2",
        rendimento_porcoes: 50,
        categoria_cardapio: 'ENSINO',
        etapa_ensino: 'Ensino Fundamental I e II',
        modalidade_ensino: 'Programa Mais Educação',
        faixa_etaria: 'da etapa de ensino correspondente'
    };

    const testIngredients = [
        {
            alimento_id: '861a34ca-1959-4d6d-bcc7-939103e5c94d', // ID fixo de exemplo se existir ou pegamos um
            quantidade_per_capita: 100
        }
    ];

    try {
        console.log("📤 Tentando salvar ficha técnica via RPC...");
        // O serviço faz upsert manual no fnde_preparacoes e insert em fnde_preparacao_ingredientes

        const { data, error } = await supabase
            .from('fnde_preparacoes')
            .insert({
                ...testPrep,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Erro ao salvar cabeçalho:", error.message);
            if (error.message.includes("permission denied")) {
                console.log("ℹ️ RLS funcionando corretamente: Bloqueou inserção sem auth.");
            }
        } else {
            console.log("✅ Cabeçalho salvo com ID:", data.id);
            // Salvar ingredientes
            const { error: ingError } = await supabase
                .from('fnde_preparacao_ingredientes')
                .insert(testIngredients.map(i => ({ ...i, preparacao_id: data.id })));

            if (ingError) {
                console.error("❌ Erro ao salvar ingredientes:", ingError.message);
            } else {
                console.log("✅ Ingredientes salvos com sucesso.");
            }
        }

    } catch (err) {
        console.error("💥 Erro crítico no teste:", err);
    }
}

testSave();
