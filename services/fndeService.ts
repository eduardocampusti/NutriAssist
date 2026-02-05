import { supabase } from './supabase';

export interface FNDEAlimento {
    codigo_fnde: string;
    descricao: string;
    grupo_alimentar: string;
    observacoes?: string;
}

export interface FNDEComposicao {
    energia_kcal: number;
    proteinas_g: number;
    carboidratos_g: number;
    lipidios_g: number;
    fibras_g: number;
    sodio_mg: number;
    calcio_mg: number;
    ferro_mg: number;
}

export interface FNDEFonte {
    versao_planilha: string;
    data_publicacao: string;
    url_fonte: string;
    observacoes?: string;
}

export const fndeService = {
    async checkVersionExists(versao: string) {
        const { data, error } = await supabase
            .from('fnde_fonte_oficial')
            .select('id')
            .eq('versao_planilha', versao)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async importFNDEData(alimentos: (FNDEAlimento & FNDEComposicao)[], fonte: FNDEFonte) {
        // 1. Register Fonte
        const { data: fonteData, error: fonteError } = await supabase
            .from('fnde_fonte_oficial')
            .insert(fonte)
            .select('id')
            .single();

        if (fonteError) throw fonteError;
        const fonteId = fonteData.id;

        const results = {
            imported: 0,
            skipped: 0,
            errors: [] as string[]
        };

        // 2. Process Alimentos & Composicao
        // Note: We use sequential inserts here to ensure audit triggers and simplicity, 
        // but we could use a batch approach if performance is critical for 1000s of rows.
        for (const item of alimentos) {
            try {
                // Check duplicate by description in this import or DB
                // For simplicity and per requirement, we focus on the table state
                const { data: existing } = await supabase
                    .from('fnde_alimentos')
                    .select('id')
                    .eq('descricao', item.descricao)
                    .maybeSingle();

                if (existing) {
                    results.skipped++;
                    continue;
                }

                // Insert Alimento
                const { data: aliData, error: aliError } = await supabase
                    .from('fnde_alimentos')
                    .insert({
                        codigo_fnde: item.codigo_fnde,
                        descricao: item.descricao,
                        grupo_alimentar: item.grupo_alimentar,
                        observacoes: `Importado na versão ${fonte.versao_planilha}`
                    })
                    .select('id')
                    .single();

                if (aliError) throw aliError;

                // Insert Composicao
                const { error: compError } = await supabase
                    .from('fnde_composicao_nutricional')
                    .insert({
                        alimento_id: aliData.id,
                        energia_kcal: item.energia_kcal,
                        proteinas_g: item.proteinas_g,
                        carboidratos_g: item.carboidratos_g,
                        lipidios_g: item.lipidios_g,
                        fibras_g: item.fibras_g,
                        sodio_mg: item.sodio_mg,
                        calcio_mg: item.calcio_mg,
                        ferro_mg: item.ferro_mg
                    });

                if (compError) throw compError;

                results.imported++;
            } catch (err: any) {
                results.errors.push(`${item.descricao}: ${err.message}`);
            }
        }

        return results;
    },

    async getLatestFonte() {
        const { data, error } = await supabase
            .from('fnde_fonte_oficial')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
};
