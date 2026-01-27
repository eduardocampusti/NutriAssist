import { supabase } from './supabase';
import { StockAudit, ReplenishmentRequest, ReplenishmentStatus, ReplenishmentPriority } from '../types';

export const replenishmentService = {
    // --- AUDITS ---

    getAuditsBySchool: async (schoolId: string): Promise<StockAudit[]> => {
        const { data, error } = await supabase
            .from('inventory_audits')
            .select('*')
            .eq('escola_id', schoolId)
            .order('data_auditoria', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getAllAudits: async (limit: number = 1000): Promise<StockAudit[]> => {
        const { data, error } = await supabase
            .from('inventory_audits')
            .select('*, escola:schools(id, nome, district)')
            .order('data_auditoria', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    createAudit: async (audit: Omit<StockAudit, 'id' | 'created_at'>): Promise<StockAudit> => {
        const { data, error } = await supabase
            .from('inventory_audits')
            .insert({
                escola_id: audit.escola_id,
                responsavel_id: audit.responsavel_id,
                data_auditoria: audit.data_auditoria,
                itens: audit.itens
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- REPLENISHMENT REQUESTS ---

    getRequests: async (filters?: { schoolId?: string; status?: ReplenishmentStatus }): Promise<ReplenishmentRequest[]> => {
        let query = supabase
            .from('replenishment_requests')
            .select('*, escola:schools(id, nome), solicitante:profiles!solicitante_id(id, nome)');

        if (filters?.schoolId) query = query.eq('escola_id', filters.schoolId);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query.order('data_pedido', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createRequest: async (request: Omit<ReplenishmentRequest, 'id' | 'created_at' | 'status'>): Promise<ReplenishmentRequest> => {
        const { data, error } = await supabase
            .from('replenishment_requests')
            .insert({
                escola_id: request.escola_id,
                solicitante_id: request.solicitante_id,
                prioridade: request.prioridade,
                itens: request.itens,
                observacao_geral: request.observacao_geral,
                data_pedido: new Date().toISOString(),
                status: 'PENDENTE'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateRequestStatus: async (
        requestId: string,
        status: ReplenishmentStatus,
        tecnicoId?: string,
        additionalData?: {
            parecer_nutricional?: string;
            data_atendimento?: string;
            observacao_geral?: string;
        }
    ): Promise<void> => {
        const updates: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (tecnicoId) updates.tecnico_id = tecnicoId;
        if (additionalData?.parecer_nutricional) updates.parecer_nutricional = additionalData.parecer_nutricional;
        if (additionalData?.data_atendimento) updates.data_atendimento = additionalData.data_atendimento;
        if (additionalData?.observacao_geral) updates.observacao_geral = additionalData.observacao_geral;

        const { error } = await supabase
            .from('replenishment_requests')
            .update(updates)
            .eq('id', requestId);

        if (error) throw error;
    }
};
