import { supabase } from './supabase';

export interface FNDEPreparacao {
    id: string;
    nome: string;
    descricao?: string;
    modo_preparo?: string;
    rendimento_porcoes: number;
    categoria_cardapio?: 'CRECHE' | 'ENSINO';
    etapa_ensino?: string;
    modalidade_ensino?: string;
    faixa_etaria?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    ingredientes?: FNDEPreparacaoIngrediente[];
}

export interface FNDEPreparacaoIngrediente {
    id: string;
    preparacao_id: string;
    alimento_id: string;
    quantidade_per_capita: number;
    alimento?: {
        nome: string;
        grupo_alimentar: string;
        fator_correcao?: number;
        composicao?: {
            energia_kcal: number;
            proteinas_g: number;
            carboidratos_g: number;
            lipidios_g: number;
            fibras_g: number;
            sodio_mg: number;
            calcio_mg: number;
            ferro_mg: number;
            gordura_saturada_g: number;
            magnesio_mg: number;
            zinco_mg: number;
            vitamina_a_mcg: number;
            vitamina_c_mg: number;
            gordura_trans_mg: number;
        }[];
    };
}

export interface PreparacaoNutrientes {
    energia_kcal: number;
    proteinas_g: number;
    carboidratos_g: number;
    lipidios_g: number;
    fibras_g: number;
    sodio_mg: number;
    calcio_mg: number;
    ferro_mg: number;
    gordura_saturada_g: number;
    magnesio_mg: number;
    zinco_mg: number;
    vitamina_a_mcg: number;
    vitamina_c_mg: number;
    gordura_trans_mg: number;
}

export const fndePreparacaoService = {
    async list(): Promise<FNDEPreparacao[]> {
        const { data, error } = await supabase
            .from('fnde_preparacoes')
            .select('*')
            .order('nome');

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<FNDEPreparacao> {
        const { data, error } = await supabase
            .from('fnde_preparacoes')
            .select(`
                *,
                ingredientes:fnde_preparacao_ingredientes(
                    *,
                    alimento:fnde_alimentos(
                        nome:descricao, 
                        grupo_alimentar,
                        fator_correcao,
                        composicao:fnde_composicao_nutricional(*)
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async save(preparacao: Partial<FNDEPreparacao>, ingredientes: Partial<FNDEPreparacaoIngrediente>[]) {
        const isUpdate = !!preparacao.id;

        // 1. Save Preparation Header
        const { data: prepData, error: prepError } = await supabase
            .from('fnde_preparacoes')
            .upsert({
                ...preparacao,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (prepError) throw prepError;

        const prepId = prepData.id;

        // 2. Clear existing ingredients if update
        if (isUpdate) {
            const { error: delError } = await supabase
                .from('fnde_preparacao_ingredientes')
                .delete()
                .eq('preparacao_id', prepId);
            if (delError) throw delError;
        }

        // 3. Save New Ingredients
        if (ingredientes.length > 0) {
            const { error: ingError } = await supabase
                .from('fnde_preparacao_ingredientes')
                .insert(ingredientes.map(ing => ({
                    ...ing,
                    preparacao_id: prepId
                })));
            if (ingError) throw ingError;
        }

        return prepData;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('fnde_preparacoes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async getNutritionalInfo(prepId: string): Promise<PreparacaoNutrientes> {
        const { data, error } = await supabase
            .rpc('fnde_get_preparacao_nutrientes', { p_preparacao_id: prepId });

        if (error) throw error;
        return data[0] || {} as PreparacaoNutrientes;
    },

    async calculatePreview(ingredientes: { alimento_id: string, quantidade_g: number }[]): Promise<PreparacaoNutrientes> {
        const { data, error } = await supabase
            .rpc('fnde_somar_nutrientes_cardapio', { p_lista_alimentos: ingredientes });

        if (error) throw error;

        const result = data[0];
        return {
            energia_kcal: result.total_energia_kcal,
            proteinas_g: result.total_proteinas_g,
            carboidratos_g: result.total_carboidratos_g,
            lipidios_g: result.total_lipidios_g,
            fibras_g: result.total_fibras_g,
            sodio_mg: result.total_sodio_mg,
            calcio_mg: result.total_calcio_mg,
            ferro_mg: result.total_ferro_mg,
            gordura_saturada_g: result.total_gordura_saturada_g,
            magnesio_mg: result.total_magnesio_mg,
            zinco_mg: result.total_zinco_mg,
            vitamina_a_mcg: result.total_vitamina_a_mcg,
            vitamina_c_mg: result.total_vitamina_c_mg,
            gordura_trans_mg: result.total_gordura_trans_mg
        };
    }
};
