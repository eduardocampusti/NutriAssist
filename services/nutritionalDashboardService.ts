import { supabase } from './supabase';

export interface CertifiedSchool {
    escola_nome: string;
    zona: string;
    status: string;
    data_emissao: string;
    validade_fim: string;
}

export interface EvolutionRanking {
    escola_nome: string;
    zona: string;
    pontuacao_geral: number;
    status: string;
    evolucao: number;
}

export interface ZoneHealth {
    zona_escolar: string;
    total_escolas_na_zona: number;
    escolas_adequadas: number;
    escolas_atencao: number;
    escolas_ajuste: number;
    perc_conformidade_zona: number;
    tendencia?: 'UP' | 'DOWN' | 'STABLE';
}

export interface SchoolNutritionalStats {
    escola_id: string;
    escola_nome: string;
    zona_escolar: string;
    semana_inicio: string;
    media_energia: number;
    media_proteinas: number;
    media_fibras: number;
    media_sodio: number;
    num_cardapios: number;
}

export interface PNAETargets {
    ref_energia_kcal: number;
    ref_proteinas_g: number;
    ref_fibras_g: number;
    ref_sodio_mg: number;
}

export interface ManagementAlert {
    tipo: string;
    mensagem: string;
    nivel: 'CRITICO' | 'ATENCAO' | 'INFORMATIVO';
}

export const nutritionalDashboardService = {
    async getSchoolStats(escolaId?: string): Promise<SchoolNutritionalStats[]> {
        let query = supabase.from('vw_fnde_consolidado_escola').select('*').order('semana_inicio', { ascending: false });

        if (escolaId) {
            query = query.eq('escola_id', escolaId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getPNAETargets(etapa: string = 'FUNDAMENTAL_I'): Promise<PNAETargets> {
        const { data, error } = await supabase.rpc('fn_fnde_get_pnae_targets', { p_etapa: etapa });
        if (error) throw error;
        return data[0];
    },

    async getManagementAlerts(escolaId: string): Promise<ManagementAlert[]> {
        const { data, error } = await supabase.rpc('fn_fnde_gerar_alertas_gerenciais', { p_escola_id: escolaId });
        if (error) throw error;
        return data || [];
    },

    async getZoneHealth(): Promise<ZoneHealth[]> {
        const { data, error } = await supabase.from('vw_fnde_saude_zona').select('*');
        if (error) throw error;
        return data || [];
    },

    async getExecutiveAlerts(): Promise<ManagementAlert[]> {
        const { data, error } = await supabase.rpc('fn_fnde_gerar_alertas_executivos');
        if (error) throw error;
        return data || [];
    },

    async getCertifiedSchools(): Promise<CertifiedSchool[]> {
        const { data, error } = await supabase.from('vw_fnde_escolas_certificadas_public').select('*');
        if (error) throw error;
        return data || [];
    },

    async getInternalRanking(): Promise<EvolutionRanking[]> {
        const { data, error } = await supabase.from('vw_fnde_ranking_evolucao_interna').select('*');
        if (error) throw error;
        return data || [];
    }
};
