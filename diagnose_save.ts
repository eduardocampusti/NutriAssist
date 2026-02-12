
import { supabase } from './services/supabase';

async function diagnose() {
    console.log("--- DIAGNÓSTICO DE SALVAMENTO ---");

    // 1. Verificar conexão e sessão
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Usuário logado:", session?.user?.email || "Nenhum");

    // 2. Tentar Upsert simplificado
    const testPrep = {
        nome: "TESTE DIAGNOSTICO " + Date.now(),
        categoria_cardapio: 'CRECHE',
        rendimento_porcoes: 1
    };

    console.log("Tentando upsert de teste...");
    const { data, error } = await supabase
        .from('fnde_preparacoes')
        .upsert(testPrep)
        .select()
        .single();

    if (error) {
        console.error("ERRO NO UPSERT:", error);
        console.error("Mensagem:", error.message);
        console.error("Detalhes:", error.details);
        console.error("Dica (Hint):", error.hint);
    } else {
        console.log("Upsert de teste funcionou! ID:", data.id);

        // Se funcionou, o problema pode ser nos ingredientes ou ID específico
        console.log("Tentando inserir ingrediente fake...");
        const { error: ingError } = await supabase
            .from('fnde_preparacao_ingredientes')
            .insert({
                preparacao_id: data.id,
                alimento_id: 'e86b978e-670d-405a-8b83-a75d5e2f6bf6', // Espero que este ID exista, ou vai dar FK error
                quantidade_per_capita: 10
            });

        if (ingError) {
            console.error("ERRO NO INGREDIENTE:", ingError.message);
        } else {
            console.log("Ingrediente de teste funcionou!");
        }
    }
}

diagnose();
