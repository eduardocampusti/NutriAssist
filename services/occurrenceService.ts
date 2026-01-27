import { supabase } from './supabase';
import { OperationalOccurrence, OccurrenceStatus } from '../types';

export const occurrenceService = {
    async create(occurrence: Partial<OperationalOccurrence>): Promise<OperationalOccurrence> {
        const { data, error } = await supabase
            .from('operational_occurrences')
            .insert([occurrence])
            .select()
            .single();

        if (error) {
            console.error('Supabase Error (create occurrence):', error);
            // Fallback para mock local se a tabela não existir
            return {
                ...occurrence,
                id: Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            } as OperationalOccurrence;
        }

        return data;
    },

    async list(filters?: { escola_id?: string; status?: string }): Promise<OperationalOccurrence[]> {
        let query = supabase.from('operational_occurrences').select('*');

        if (filters?.escola_id) query = query.eq('escola_id', filters.escola_id);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error (list occurrences):', error);
            return [];
        }

        return data || [];
    },

    async updateStatus(id: string, status: OccurrenceStatus, technicalOpinion?: string, nutritionId?: string): Promise<void> {
        const { error } = await supabase
            .from('operational_occurrences')
            .update({
                status,
                parecer_tecnico: technicalOpinion,
                responsavel_avaliacao_id: nutritionId,
                data_avaliacao: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    }
};
