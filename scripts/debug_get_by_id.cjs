const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetById() {
    // First, get one preparation ID
    const { data: preps, error: listError } = await supabase
        .from('fnde_preparacoes')
        .select('id, nome')
        .limit(1);

    if (listError || !preps.length) {
        console.error("No preparations found or error listing:", listError);
        return;
    }

    const prepId = preps[0].id;
    console.log(`Testing Preparation: ${preps[0].nome} (${prepId})`);

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
        .eq('id', prepId)
        .single();

    if (error) {
        console.error("Error fetching prep details:", error);
        return;
    }

    console.log("\n--- PREPARACAO DATA ---");
    console.log(JSON.stringify(data, null, 2));

    if (data.ingredientes && data.ingredientes.length > 0) {
        console.log("\n--- INGREDIENT 0 DETAILS ---");
        const ing = data.ingredientes[0];
        console.log("Alimento Name:", ing.alimento?.nome);
        console.log("Composicao found:", !!ing.alimento?.composicao);
        if (ing.alimento?.composicao) {
            console.log("Composicao Length:", ing.alimento.composicao.length);
            console.log("First Composicao Item:", JSON.stringify(ing.alimento.composicao[0], null, 2));
        }
    } else {
        console.log("No ingredients found for this preparation.");
    }
}

testGetById();
