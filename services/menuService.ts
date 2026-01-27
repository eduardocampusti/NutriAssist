import { supabase } from './supabase';
import { MenuPlan, DocStatus } from '../types';

export const menuService = {

    // --- FETCHING ---

    getAllMenus: async (): Promise<MenuPlan[]> => {
        const { data, error } = await supabase
            .from('cardapios')
            .select(`
             *,
             cardapio_itens (
                 id,
                 alimento_normativo_id,
                 tipo_refeicao,
                 dia_semana,
                 per_capita_g,
                 status_validacao,
                 justificativa_restricao
             )
          `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to legacy Structure
        return data.map((row: any) => ({
            id: row.id,
            titulo: row.titulo,
            escolaId: row.escola_id,
            etapa: row.modalidade as any,
            numAlunos: 100, // Mock or fetch school
            diasLetivos: 200, // Mock
            status: row.status as DocStatus,
            nutricionista_id: row.nutricionista_id,
            created_at: new Date(row.created_at).getTime(),
            authorId: row.nutricionista_id,

            // Reconstruct Preparations from Flat Items
            preparacoes: [], // Detailed reconstruction needed for editing.
            // For list view, we might not need deep hydration.

            faixaEtariaMinMeses: row.faixa_etaria_min_meses,
            faixaEtariaMaxMeses: row.faixa_etaria_max_meses,
            periodo: row.periodo,
            justificativaTecnica: '' // field missing in my basic table? check schema
        }));
    },

    // --- SAVING (Atomic-ish) ---

    saveMenu: async (plan: MenuPlan, userId: string): Promise<string> => {
        // 1. Upsert Header
        const headerData = {
            titulo: plan.titulo,
            escola_id: plan.escolaId || null,
            modalidade: plan.etapa,
            faixa_etaria_min_meses: plan.faixaEtariaMinMeses || 0,
            faixa_etaria_max_meses: plan.faixaEtariaMaxMeses || 999,
            periodo: plan.periodo || 'SEMANAL',
            status: plan.status,
            nutricionista_id: userId
        };

        // If ID exists, Update. Else Insert.
        // Upsert needs ID.
        let menuId = plan.id;

        const { data: savedMenu, error: headerError } = await supabase
            .from('cardapios')
            .upsert(plan.id ? { id: plan.id, ...headerData } : headerData)
            .select()
            .single();

        if (headerError) throw headerError;
        menuId = savedMenu.id;

        // 2. Handle Items (Full Replace Strategy: Delete All for Menu, Insert New)
        // Safest for MVP to avoid diffing logic complexity

        if (plan.id) { // Only delete if editing existing
            await supabase.from('cardapio_itens').delete().eq('cardapio_id', menuId);
        }

        // 3. Prepare Items
        // We need to flatten plan.preparacoes -> cardapio_itens rows
        const rowsToInsert: any[] = [];

        plan.preparacoes.forEach(dish => {
            dish.ingredientes.forEach(ing => {
                rowsToInsert.push({
                    cardapio_id: menuId,
                    alimento_normativo_id: ing.itemId, // Assuming ItemID is now normative ID
                    tipo_refeicao: dish.mealType.toString(), // Fix Enum to String
                    dia_semana: dish.diaSemana,
                    per_capita_g: ing.perCapitaGrams,
                    status_validacao: 'PERMITIDO' // We should pass this from Plan validation logic
                });
            });
        });

        if (rowsToInsert.length > 0) {
            const { error: itemsError } = await supabase
                .from('cardapio_itens')
                .insert(rowsToInsert);

            if (itemsError) throw itemsError;
        }

        return menuId;
    }
};
