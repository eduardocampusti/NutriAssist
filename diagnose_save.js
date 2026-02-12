
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erro: Credenciais do Supabase não encontradas no .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- DIAGNÓSTICO DE SALVAMENTO (JS) ---");

    // Tentar Upsert simplificado
    const testPrep = {
        nome: "TESTE DIAGNOSTICO " + new Date().toISOString(),
        categoria_cardapio: 'CRECHE',
        rendimento_porcoes: 1
    };

    console.log("Tentando upsert de teste na tabela fnde_preparacoes...");
    const { data, error } = await supabase
        .from('fnde_preparacoes')
        .upsert(testPrep)
        .select()
        .single();

    if (error) {
        console.error("ERRO NO UPSERT:");
        console.error("Mensagem:", error.message);
        console.error("Detalhes:", error.details);
        console.error("Dica (Hint):", error.hint);
        console.error("Código:", error.code);
    } else {
        console.log("✅ Upsert de teste funcionou! ID:", data.id);

        // Limpar
        await supabase.from('fnde_preparacoes').delete().eq('id', data.id);
        console.log("✅ Registro de teste removido.");
    }
}

diagnose();
