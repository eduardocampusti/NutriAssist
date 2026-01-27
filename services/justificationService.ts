import { supabase } from './supabase';
import { AdministrativeJustification, JustificationType } from '../types';

export const justificationService = {

    /**
     * Salva uma nova justificativa administrativa.
     */
    saveJustification: async (justification: Omit<AdministrativeJustification, 'id' | 'created_at'>): Promise<AdministrativeJustification> => {
        const { data, error } = await supabase
            .from('justificativas')
            .insert({
                escola_id: justification.escola_id,
                usuario_id: justification.usuario_id,
                tipo_ocorrencia: justification.tipo, // Mapeando para o nome da coluna no DB
                descricao: justification.descricao,
                data_fato: justification.data_fato,
                vinculo_tipo: justification.vinculo_tipo,
                vinculo_id: justification.vinculo_id
            })
            .select('*, escola:escolas(nome), usuario:profiles(nome)')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Busca todas as justificativas vinculadas a uma escola.
     */
    getSchoolJustifications: async (schoolId: string): Promise<AdministrativeJustification[]> => {
        const { data, error } = await supabase
            .from('justificativas')
            .select('*, escola:escolas(nome), usuario:profiles(nome)')
            .eq('escola_id', schoolId)
            .order('data_fato', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
