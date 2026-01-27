import { supabase } from './supabase';
import { StockProduct, StockMovement, InventoryItem } from '../types';

// Compatibility Wrapper for Old InventoryItem
const mapToLegacyItem = (row: any): InventoryItem => {
    // In a real app, we would join with 'alimentos_normativos' to get Kcal/Macros
    // For now, we assume 'normative_data' is fetched or we map what we have.
    // This is a partial map to keep frontend working.
    return {
        id: row.id,
        nome: row.nome_comercial,
        categoria: 'SECO', // TODO: Map from Normative
        saldoAtual: row.saldo_atual || 0,
        estoqueMinimo: row.estoque_minimo || 0,
        unidadeMedida: row.unidade_medida as any,
        costPerUnit: 0, // Need purchase history
        correctionFactor: 1,
        isUltraProcessed: false, // Need Normative
        kcal: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        ativo: row.ativo,
        created_at: new Date(row.created_at).getTime(),
        // ... other props default to 0/null
        // Type assertion to bypass strict overlap check for now, acknowledging legacy vs new schema diffs
    } as unknown as InventoryItem;

};

export const stockService = {

    // --- PRODUCTS ---

    getAllProducts: async (): Promise<InventoryItem[]> => {
        // Fetch products + (optional) normative data
        const { data, error } = await supabase
            .from('estoque_produtos')
            .select(`
        *,
        alimentos_normativos (
            nome_alimento,
            classificacao_nova,
            status_normativo
        )
      `)
            .eq('ativo', true);

        if (error) throw error;

        return data.map((row: any) => {
            const item = mapToLegacyItem(row);
            // Enrich with normative
            if (row.alimentos_normativos) {
                item.classificacaoNova = row.alimentos_normativos.classificacao_nova;
                item.statusNormativo = row.alimentos_normativos.status_normativo;
                // Map NOVA to isUltraProcessed
                if (item.classificacaoNova === 'ULTRAPROCESSADO') item.isUltraProcessed = true;
            }
            return item;
        });
    },

    getProductById: async (id: string): Promise<InventoryItem | null> => {
        const { data, error } = await supabase
            .from('estoque_produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return mapToLegacyItem(data);
    },

    // --- MOVEMENTS & BALANCE ---

    registerMovement: async (
        productId: string,
        type: 'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE',
        quantity: number,
        schoolId: string,
        userId: string,
        justificativa?: string
    ): Promise<void> => {

        // 1. Insert Movement Log
        const { error: moveError } = await supabase
            .from('estoque_movimentacoes')
            .insert({
                produto_id: productId,
                escola_id: schoolId,
                tipo: type,
                quantidade: quantity,
                responsavel_id: userId,
                justificativa: justificativa,
                data_movimento: new Date().toISOString()
            });

        if (moveError) throw moveError;

        // 2. Update Balance (Manual Transaction since no Trigger)
        let delta = 0;
        if (type === 'ENTRADA') delta = quantity;
        else if (type === 'SAIDA' || type === 'PERDA') delta = -quantity;
        else if (type === 'AJUSTE') delta = quantity; // User passes signed diff

        const { data: product } = await supabase.from('estoque_produtos').select('saldo_atual').eq('id', productId).single();
        if (!product) throw new Error("Product not found for balance update");

        const newBalance = (product.saldo_atual || 0) + delta;

        const { error: updateError } = await supabase
            .from('estoque_produtos')
            .update({ saldo_atual: newBalance })
            .eq('id', productId);

        if (updateError) throw updateError;
    },

    // --- EXECUTION MODULE (PNAE) ---

    getDailyMenu: async (schoolId: string): Promise<{ menuId: string, title: string, items: { id: string, name: string, perCapita: number, unit: string }[] } | null> => {
        // Fetch the most recent APPROVED menu for this school (or global if not found specific)
        const { data: menu, error } = await supabase
            .from('cardapios')
            .select(`
                id, 
                titulo, 
                cardapio_itens (
                    id, 
                    alimento_normativo_id,
                    quantidade,
                    alimentos_normativos (nome_alimento)
                )
            `)
            .eq('status', 'APROVADO')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !menu) {
            console.log("No approved menu found for today.");
            return null;
        }

        // Map to format
        const items = menu.cardapio_itens.map((item: any) => ({
            id: item.alimento_normativo_id, // We map Normative ID to Inventory ID for consumption (Assuming Inventory Item ID = Normative ID in simplified model, OR we need a lookup)
            // Ideally: InventoryItem should match linked Normative Food. 
            // For this SIMULATION, we assume the user has items in stock with IDs matching Normative IDs or we find them.
            // Let's assume we return NormativeID as 'id' and allow UI to match.
            name: item.alimentos_normativos?.nome_alimento || 'Item Sem Nome',
            perCapita: (item.quantidade || 0) / 1000, // g to kg
            unit: 'KG'
        }));

        return {
            menuId: menu.id,
            title: menu.titulo,
            items
        };
    },

    executeMenu: async (
        schoolId: string,
        itemIds: string[],
        quantities: number[],
        userId: string,
        studentCount: number,
        menuId?: string // Optional reference to the Planned Menu ID
    ): Promise<void> => {

        // 1. Log Execution Header (Planned vs Real tracking)
        if (menuId) {
            await supabase.from('menu_executions').insert({
                menu_plan_id: menuId,
                school_id: schoolId,
                data_execucao: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                servings_confirmed: studentCount,
                author_id: userId,
                notes: 'Execução via Terminal Merendeira'
            });
        }

        // 2. Loop and Deduct
        for (let i = 0; i < itemIds.length; i++) {
            const id = itemIds[i];
            const qty = quantities[i];

            if (qty > 0) {
                await stockService.registerMovement(
                    id,
                    'SAIDA',
                    qty,
                    schoolId,
                    userId,
                    `Execução de Cardápio para ${studentCount} alunos`
                );
            }
        }
    }
};

