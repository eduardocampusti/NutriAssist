
import { supabase } from './supabase';

export const auditService = {
    /**
     * Log access to sensitive data (READ operations)
     * Critical for LGPD accountability.
     */
    logAccess: async (userId: string, resource: string, resourceId: string, details: string) => {
        try {
            await supabase.from('logs_auditoria').insert({
                usuario_id: userId,
                acao: 'ACCESS',
                entidade: resource,
                entidade_id: resourceId,
                observacao: details,
                data_hora: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to log audit access:", e);
        }
    },

    /**
     * Log modification actions (WRITE operations)
     * Usually handled by DB Triggers, but frontend explicit logging adds context.
     */
    logAction: async (userId: string, action: string, resource: string, resourceId: string, diff?: any) => {
        try {
            await supabase.from('logs_auditoria').insert({
                usuario_id: userId,
                acao: action, // e.g., 'UPDATE_STUDENT_HEALTH'
                entidade: resource,
                entidade_id: resourceId,
                dados_novos: diff,
                data_hora: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to log audit action:", e);
        }
    }
};
