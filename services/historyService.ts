import { supabase } from './supabase';
import { TimelineEvent, EventType, UserRole } from '../types';

export const historyService = {

    /**
     * Obtém a linha do tempo de eventos para uma escola específica.
     * Consolida dados de entregas, solicitações, alertas e checklists.
     */
    getSchoolTimeline: async (schoolId: string): Promise<TimelineEvent[]> => {
        try {
            // 1. Buscar Distribuições (Entregas)
            const { data: distData } = await supabase
                .from('distribuicoes')
                .select('*, responsavel:profiles!responsavel_logistica_id(nome)')
                .eq('escola_id', schoolId)
                .order('created_at', { ascending: false });

            // 2. Buscar Solicitações de Reposição
            const { data: reqData } = await supabase
                .from('replenishment_requests')
                .select('*, responsavel:profiles!solicitante_id(nome)')
                .eq('escola_id', schoolId)
                .order('created_at', { ascending: false });

            // 3. Buscar Alertas Inteligentes (Resolvidos e Não Resolvidos)
            const { data: alertData } = await supabase
                .from('alertas_inteligentes')
                .select('*')
                .eq('escola_id', schoolId)
                .order('created_at', { ascending: false });

            // 4. Buscar Controles Sanitários
            const { data: sanitaryData } = await supabase
                .from('controles_sanitarios')
                .select('*, responsavel:profiles!responsavel_id(nome)')
                .eq('escola_id', schoolId)
                .order('created_at', { ascending: false });

            // 5. Buscar Justificativas Administrativas
            const { data: justData } = await supabase
                .from('justificativas')
                .select('*, responsavel:profiles!usuario_id(nome)')
                .eq('escola_id', schoolId)
                .order('data_fato', { ascending: false });

            const events: TimelineEvent[] = [];

            // Mapear Entregas
            distData?.forEach(d => {
                events.push({
                    id: d.id,
                    data: d.data_envio || d.created_at,
                    tipo: EventType.ENTREGA,
                    titulo: `Carga Recebida: ${d.status}`,
                    descricao: `Entrega realizada pelo motorista ${d.motorista || 'Não identificado'}.`,
                    status: d.status,
                    responsavel: (d.responsavel as any)?.nome || 'Logística Sede',
                    metadata: { type: 'DISTRIBUTION', id: d.id }
                });
            });

            // Mapear Solicitações
            reqData?.forEach(r => {
                events.push({
                    id: r.id,
                    data: r.data_pedido || r.created_at,
                    tipo: EventType.SOLICITACAO,
                    titulo: `Solicitação de Reposição: ${r.status}`,
                    descricao: `Pedido de ${r.itens?.length || 0} itens para o estoque. Prioridade: ${r.prioridade}.`,
                    status: r.status,
                    responsavel: (r.responsavel as any)?.nome || 'Diretoria Escola',
                    metadata: { type: 'REQUEST', id: r.id }
                });
            });

            // Mapear Alertas
            alertData?.forEach(a => {
                events.push({
                    id: a.id,
                    data: a.data_geracao || a.created_at,
                    tipo: EventType.OCORRENCIA,
                    titulo: `Alerta: ${a.titulo}`,
                    descricao: a.descricao,
                    status: a.resolvido ? 'RESOLVIDO' : 'ATIVO',
                    responsavel: 'Sistema de Inteligência',
                    metadata: { type: 'ALERT', id: a.id }
                });
            });

            // Mapear Sanitário
            sanitaryData?.forEach(s => {
                events.push({
                    id: s.id,
                    data: s.data_realizacao || s.created_at,
                    tipo: EventType.SANITARIO,
                    titulo: 'Checklist Sanitário Mensal',
                    descricao: `Preenchimento de rotina para o mês ${s.mes_referencia}/${s.ano_referencia}.`,
                    status: 'CONCLUÍDO',
                    responsavel: (s.responsavel as any)?.nome || 'Diretor/Nutricionista',
                    metadata: { type: 'SANITARY', id: s.id }
                });
            });

            // Mapear Justificativas
            justData?.forEach(j => {
                events.push({
                    id: j.id,
                    data: j.data_fato || j.created_at,
                    tipo: EventType.AJUSTE,
                    titulo: `Justificativa: ${j.tipo_ocorrencia}`,
                    descricao: j.descricao,
                    status: 'FORMALIZADO',
                    responsavel: (j.responsavel as any)?.nome || 'Gestão SME',
                    metadata: { type: 'JUSTIFICATION', id: j.id }
                });
            });

            // Ordenar por data decrescente
            return events.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        } catch (err) {
            console.error('Erro ao buscar linha do tempo:', err);
            return [];
        }
    }
};
