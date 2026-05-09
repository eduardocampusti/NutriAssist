import { supabase } from './supabase';
import { tacoService } from './tacoService';

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
    imagem_url?: string;
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
        taco_composicao?: {
            energia_kcal: number; proteinas_g: number; lipidios_g: number;
            carboidratos_g: number; fibras_g: number; calcio_mg: number;
            ferro_mg: number; sodio_mg: number; magnesio_mg: number;
            zinco_mg: number; vitamina_a_mcg: number; vitamina_c_mg: number;
            gordura_saturada_g: number; gordura_trans_g: number; fator_coccao: number;
        }[];
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

        if (error) {
            console.error('Error listing FNDE preparacoes:', error);
            throw error;
        }
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
                        composicao:fnde_composicao_nutricional(*)
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching preparation by id:', error);
            throw error;
        }

        // Enrich with TACO complementary data (graceful — fails silently if table absent)
        if (data?.ingredientes?.length) {
            try {
                data.ingredientes = await tacoService.enrichIngredientes(data.ingredientes);
            } catch {
                // TACO not imported yet — proceed with FNDE-only data
            }
        }

        return data as any;
    },

    async save(preparacao: Partial<FNDEPreparacao>, ingredientes: Partial<FNDEPreparacaoIngrediente>[]) {
        const isUpdate = !!preparacao.id;

        // 1. Save Preparation Header with Fallback for missing columns
        let prepData;
        let prepError;

        const { data: d, error: e } = await supabase
            .from('fnde_preparacoes')
            .upsert({
                ...preparacao,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        prepData = d;
        prepError = e;

        // Fallback: If migration was not applied, retry without the new columns
        if (prepError && prepError.message.includes('column') && prepError.message.includes('does not exist')) {
            console.warn('⚠️ Fallback: Colunas PNAE não encontradas no banco. Salvando apenas campos básicos.');
            const basicPrep = { ...preparacao };
            delete (basicPrep as any).categoria_cardapio;
            delete (basicPrep as any).etapa_ensino;
            delete (basicPrep as any).modalidade_ensino;
            delete (basicPrep as any).faixa_etaria;

            const { data: d2, error: e2 } = await supabase
                .from('fnde_preparacoes')
                .upsert({
                    ...basicPrep,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            prepData = d2;
            prepError = e2;
        }

        if (prepError) {
            console.error('❌ Erro Supabase (Header):', prepError);
            throw prepError;
        }

        const prepId = prepData.id;

        // 2. Clear existing ingredients if update
        if (isUpdate) {
            const { error: delError } = await supabase
                .from('fnde_preparacao_ingredientes')
                .delete()
                .eq('preparacao_id', prepId);
            if (delError) {
                console.error('❌ Erro Supabase (Delete Ings):', delError);
                throw delError;
            }
        }

        // 3. Save New Ingredients
        if (ingredientes.length > 0) {
            const { error: ingError } = await supabase
                .from('fnde_preparacao_ingredientes')
                .insert(ingredientes.map(ing => ({
                    ...ing,
                    preparacao_id: prepId
                })));
            if (ingError) {
                console.error('❌ Erro Supabase (Insert Ings):', ingError);
                throw ingError;
            }
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

        const result = data[0] || {};
        return {
            energia_kcal: result.total_energia_kcal || 0,
            proteinas_g: result.total_proteinas_g || 0,
            carboidratos_g: result.total_carboidratos_g || 0,
            lipidios_g: result.total_lipidios_g || 0,
            fibras_g: result.total_fibras_g || 0,
            sodio_mg: result.total_sodio_mg || 0,
            calcio_mg: result.total_calcio_mg || 0,
            ferro_mg: result.total_ferro_mg || 0,
            gordura_saturada_g: result.total_gordura_saturada_g || 0,
            magnesio_mg: result.total_magnesio_mg || 0,
            zinco_mg: result.total_zinco_mg || 0,
            vitamina_a_mcg: result.total_vitamina_a_mcg || 0,
            vitamina_c_mg: result.total_vitamina_c_mg || 0,
            gordura_trans_mg: result.total_gordura_trans_mg || 0
        };
    }
};
