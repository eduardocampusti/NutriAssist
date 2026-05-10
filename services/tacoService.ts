import { supabase } from './supabase';
import type { FNDEPreparacaoIngrediente } from './fndePreparacaoService';

export interface TACOComposicao {
    id?: string;
    codigo_taco: string;
    descricao: string;
    grupo_alimentar: string;
    energia_kcal: number;
    proteinas_g: number;
    lipidios_g: number;
    carboidratos_g: number;
    fibras_g: number;
    calcio_mg: number;
    ferro_mg: number;
    sodio_mg: number;
    magnesio_mg: number;
    zinco_mg: number;
    vitamina_a_mcg: number;
    vitamina_c_mg: number;
    gordura_saturada_g: number;
    gordura_trans_g: number;
    fator_coccao: number;
    created_at?: string;
}

export interface TACOFonte {
    versao: string;
    data_publicacao: string;
    url_fonte: string;
    observacoes?: string;
}

// Função de normalização solicitada: remove acentos e converte para minúsculas
const normalizar = (s: string) => 
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Returns the first meaningful word of a name, preserving original casing and accents.
const firstWord = (name: string): string =>
    name.split(',')[0].trim().split(/\s+/)[0];

export const tacoService = {
    async checkVersionExists(versao: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('taco_fonte_oficial')
            .select('id')
            .eq('versao', versao)
            .maybeSingle();
        if (error) throw error;
        return !!data;
    },

    async importTACOData(items: TACOComposicao[], fonte: TACOFonte) {
        const { error: fonteError } = await supabase
            .from('taco_fonte_oficial')
            .upsert(fonte, { onConflict: 'versao' });
        if (fonteError) throw fonteError;

        const results = { imported: 0, skipped: 0, errors: [] as string[] };

        for (const item of items) {
            try {
                const { data: existing } = await supabase
                    .from('taco_composicao')
                    .select('id')
                    .eq('codigo_taco', item.codigo_taco)
                    .maybeSingle();

                if (existing) {
                    const { id: _id, created_at: _ca, ...fields } = item as any;
                    const { error } = await supabase
                        .from('taco_composicao')
                        .update(fields)
                        .eq('id', existing.id);
                    if (error) throw error;
                    results.skipped++;
                    continue;
                }

                const { id: _id, created_at: _ca, ...insertFields } = item as any;
                const { error } = await supabase
                    .from('taco_composicao')
                    .insert(insertFields);
                if (error) throw error;
                results.imported++;
            } catch (err: any) {
                results.errors.push(`${item.descricao}: ${err.message}`);
            }
        }

        return results;
    },

    // Enriches preparation ingredients with complementary TACO data.
    async enrichIngredientes(ingredientes: FNDEPreparacaoIngrediente[]): Promise<FNDEPreparacaoIngrediente[]> {
        if (!ingredientes || ingredientes.length === 0) return ingredientes;

        const names = ingredientes.map(i => i.alimento?.nome).filter(Boolean) as string[];
        if (names.length === 0) return ingredientes;

        // PROBLEMA 2: Melhorar o match de nomes com normalização.
        // Buscamos prefixos de 3 letras (original e normalizado) para capturar candidatos
        // mesmo com divergências de acentuação no banco de dados.
        const searchPrefixes = [...new Set([
            ...names.map(n => firstWord(n).substring(0, 3)),
            ...names.map(n => normalizar(firstWord(n)).substring(0, 3))
        ].filter(w => w.length >= 3))];

        if (searchPrefixes.length === 0) return ingredientes;

        // Filtramos candidatos pelo prefixo (ilike é case-insensitive)
        const orConditions = searchPrefixes.map(w => `descricao.ilike.${w}%`).join(',');

        const { data: tacoRows, error } = await supabase
            .from('taco_composicao')
            .select('*')
            .or(orConditions);

        if (error || !tacoRows || tacoRows.length === 0) return ingredientes;

        // Build lookup: normalizedDescription → TACOComposicao
        const tacoByNorm = new Map<string, TACOComposicao>();
        for (const t of tacoRows) {
            tacoByNorm.set(normalizar(t.descricao), t);
        }

        return ingredientes.map(ing => {
            const nome = ing.alimento?.nome;
            if (!nome) return ing;

            const key = normalizar(nome);
            
            // 1. Exact normalized match
            let taco: TACOComposicao | undefined = tacoByNorm.get(key);

            // 2. Prefix match (ex: "Carne moída" matches "Carne moída, bovina")
            if (!taco) {
                taco = [...tacoByNorm.values()].find(t => {
                    const normTaco = normalizar(t.descricao);
                    return normTaco.startsWith(key) || key.startsWith(normTaco);
                });
            }

            // 3. First-word match fallback
            if (!taco) {
                const firstToken = key.split(/\s+/)[0];
                if (firstToken.length >= 3) {
                    taco = [...tacoByNorm.values()].find(t =>
                        normalizar(t.descricao).startsWith(firstToken)
                    );
                }
            }

            if (!taco) return ing;

            const currentFc = ing.alimento?.fator_correcao || 1.0;
            const newFc = currentFc === 1.0 && taco.fator_coccao !== 1.0
                ? taco.fator_coccao
                : currentFc;

            return {
                ...ing,
                alimento: {
                    ...ing.alimento!,
                    fator_correcao: newFc,
                    taco_composicao: [taco],
                },
            };
        });
    },

    async listAlimentos(): Promise<TACOComposicao[]> {
        const { data, error } = await supabase
            .from('taco_composicao')
            .select('*')
            .order('descricao');
        if (error) throw error;
        return data || [];
    },
};
