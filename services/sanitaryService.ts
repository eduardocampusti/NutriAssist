import { supabase } from './supabase';
import { SanitaryChecklist, SanitaryAnswer } from '../types';

export const sanitaryService = {

    /**
     * Salva um novo checklist sanitário.
     */
    saveChecklist: async (checklist: Omit<SanitaryChecklist, 'id' | 'created_at'>): Promise<SanitaryChecklist> => {
        const { data, error } = await supabase
            .from('controles_sanitarios')
            .insert(checklist)
            .select('*, escola:escolas(nome), responsavel:profiles(nome)')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Obtém o histórico de checklists, opcionalmente filtrado por escola.
     */
    getHistory: async (schoolId?: string): Promise<SanitaryChecklist[]> => {
        let query = supabase
            .from('controles_sanitarios')
            .select('*, escola:escolas(nome), responsavel:profiles(nome)')
            .order('data_realizacao', { ascending: false });

        if (schoolId) query = query.eq('escola_id', schoolId);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    /**
     * Calcula a taxa de conformidade de um checklist.
     * (Sim / (Sim + Não)) * 100
     */
    calculateCompliance: (checklist: SanitaryChecklist): number => {
        const totalAnswered = checklist.respostas.filter(r => r.resposta !== SanitaryAnswer.NA);
        if (totalAnswered.length === 0) return 0;

        const positive = totalAnswered.filter(r => r.resposta === SanitaryAnswer.SIM).length;
        return (positive / totalAnswered.length) * 100;
    }
};
