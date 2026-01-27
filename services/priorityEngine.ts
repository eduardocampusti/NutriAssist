import { supabase } from './supabase';
import { School, AlertType, AlertCategory, DistributionStatus } from '../types';

export const priorityEngine = {
    /**
     * Calcula e atualiza a prioridade para todas as escolas ativas.
     */
    recalculateAllPriorities: async (): Promise<void> => {
        try {
            const { data: schools, error: schoolError } = await supabase
                .from('schools')
                .select('*')
                .eq('ativo', true);

            if (schoolError) throw schoolError;

            // Busca total de alunos da rede para cálculo proporcional
            const totalStudents = schools.reduce((acc, s) => acc + (s.num_alunos || 0), 0);

            for (const school of schools) {
                await priorityEngine.calculateSchoolPriority(school, totalStudents);
            }
        } catch (err) {
            console.error('Erro no processamento global de prioridades:', err);
        }
    },

    /**
     * Calcula a pontuação de uma escola específica.
     */
    calculateSchoolPriority: async (school: any, totalNetworkStudents: number): Promise<number> => {
        let score = 0;

        try {
            // 1. Alert Scoring
            const { data: alerts } = await supabase
                .from('alertas_inteligentes')
                .select('tipo_alerta, categoria')
                .eq('escola_id', school.id)
                .eq('resolvido', false);

            if (alerts) {
                alerts.forEach(alert => {
                    if (alert.tipo_alerta === AlertType.CRITICO) {
                        score += 40;
                        // Bônus se for inviabilidade de cardápio (fomre crítica)
                        if (alert.categoria === AlertCategory.CARDAPIO_INVIAVEL) score += 10;
                    } else if (alert.tipo_alerta === AlertType.ATENCAO) {
                        score += 20;
                    }
                });
            }

            // 2. Proportional Enrollment (Max 20 pts)
            if (totalNetworkStudents > 0) {
                const proportion = (school.num_alunos || school.numAlunos || 0) / totalNetworkStudents;
                score += Math.min(20, Math.round(proportion * 40)); // Se for 50% da rede, ganha 20 pontos.
            }

            // 3. Last Delivery Vacancy (> 15 days sem carga)
            const { data: lastDelivery } = await supabase
                .from('distribuicoes')
                .select('data_recebimento')
                .eq('escola_id', school.id)
                .eq('status', DistributionStatus.ENTREGUE)
                .order('data_recebimento', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (lastDelivery) {
                const lastDate = new Date(lastDelivery.data_recebimento);
                const diffDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
                if (diffDays > 15) score += 10;
            } else {
                // Sem registro de entrega = Prioridade inicial
                score += 15;
            }

            // 4. Recent Discrepancies (Divergências nos últimos 30 dias)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { count: divergenceCount } = await supabase
                .from('distribuicoes')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', school.id)
                .eq('status', DistributionStatus.ENTREGUE_COM_DIVERGENCIA)
                .gte('data_recebimento', thirtyDaysAgo.toISOString());

            if (divergenceCount && divergenceCount > 0) {
                score += 20;
            }

            // Determinar Nível
            let level: 'ALTA' | 'MÉDIA' | 'BAIXA' = 'BAIXA';
            if (score >= 80) level = 'ALTA';
            else if (score >= 40) level = 'MÉDIA';

            // Salvar no Banco
            await supabase
                .from('schools')
                .update({
                    prioridade_score: score,
                    prioridade_nivel: level,
                    ultima_priorizacao_data: new Date().toISOString()
                })
                .eq('id', school.id);

            return score;

        } catch (err) {
            console.error(`Erro ao calcular prioridade para escola ${school.id}:`, err);
            return 0;
        }
    }
};
