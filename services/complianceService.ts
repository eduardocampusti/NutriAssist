import { supabase } from './supabase';
import {
    ComplianceReport,
    DistributionStatus,
    OccurrenceType,
    OccurrenceStatus,
    UserRole
} from '../types';

export const complianceService = {

    /**
     * Calcula o score de conformidade de uma escola para um período específico.
     * Se já existir um histórico validado/bloqueado, retorna o histórico.
     * Caso contrário, calcula em tempo real.
     */
    calculateCompliance: async (schoolId: string, month: string): Promise<ComplianceReport> => {
        try {
            // 0. Verificar Histórico
            const { data: history } = await supabase
                .from('historico_conformidade')
                .select('*')
                .eq('escola_id', schoolId)
                .eq('mes_referencia', month)
                .maybeSingle();

            if (history && history.bloqueado) {
                return {
                    id: history.id,
                    escola_id: history.escola_id,
                    periodo: history.mes_referencia,
                    score_geral: history.score_geral,
                    indicadores: history.indicadores,
                    status: history.nivel_selo === 'VERDE' ? 'ALTA' : history.nivel_selo === 'AMARELO' ? 'ATENCAO' : 'RISCO',
                    ultima_atualizacao: history.created_at
                } as ComplianceReport;
            }

            const startDate = `${month}-01T00:00:00`;
            const endDate = `${month}-31T23:59:59`;

            // 1. Recebimentos no Prazo (PESO 25%)
            // Lógica: % de distribuições recebidas sem atraso ou recusa total
            const { data: distributions } = await supabase
                .from('distribuicoes')
                .select('*')
                .eq('escola_id', schoolId)
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            const totalDist = distributions?.length || 0;
            const onTimeDist = distributions?.filter(d =>
                d.status === DistributionStatus.ENTREGUE ||
                d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA
            ).length || 0;
            // Se não houve distribuição, assume 100% (não houve falha)
            const recebimentosScore = totalDist > 0 ? (onTimeDist / totalDist) * 100 : 100;

            // 2. Execução do Cardápio (PESO 25%)
            // Lógica: Dias com execução registrada / Dias letivos esperados (aprox 20)
            const { count: executionCount } = await supabase
                .from('execucoes_cardapio')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', schoolId)
                .gte('data', startDate)
                .lte('data', endDate);

            // Ajuste leve: Se > 20, limita a 100. Se 0, é 0.
            const execucaoScore = Math.min((executionCount || 0) / 20 * 100, 100);

            // 3. Auditoria de Estoque (PESO 20%)
            // Lógica: Fez pelo menos 1 auditoria no mês = 100%, 0 = 0%.
            const { count: auditCount } = await supabase
                .from('auditorias_estoque')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', schoolId)
                .gte('data_auditoria', startDate)
                .lte('data_auditoria', endDate);

            const auditScore = (auditCount || 0) > 0 ? 100 : 0;

            // 4. Checklist Sanitário (PESO 15%)
            // Lógica: Média dos scores dos checklists do mês. Se nenhum, assume 100 (presunção de inocência) ou 0?
            // Regra conservadora: Se não tem checklist, não penaliza sitemicamente SE não for obrigatório ter todo mês.
            // Mas para "Selo de Excelência", deve-se exigir. Vamos assumir que se não tem, é 0 (falta de dado de qualidade).
            // USUÁRIO DISSE: "Baseada exclusivamente em dados registrados". Se não tem registro, nota é 0.
            const { data: checklists } = await supabase
                .from('checklists_sanitarios')
                .select('score')
                .eq('escola_id', schoolId)
                .gte('data_aplicacao', startDate)
                .lte('data_aplicacao', endDate);

            const totalChecklist = checklists?.reduce((acc, c) => acc + c.score, 0) || 0;
            const checklistScore = checklists?.length ? (totalChecklist / checklists.length) : 0;

            // 5. Ausência de Faltas Críticas (PESO 15%)
            // Lógica: Começa com 100. Cada falta crítica (FALTA_ALIMENTO) reduz X pontos ou zera esse quesito.
            // Vamos deduzir 20 pontos por falta crítica. 5 faltas = 0.
            const { count: missingCount } = await supabase
                .from('ocorrencias_operacionais')
                .select('*', { count: 'exact', head: true })
                .eq('escola_id', schoolId)
                .eq('tipo', OccurrenceType.FALTA_ALIMENTO)
                .gte('data_registro', startDate)
                .lte('data_registro', endDate);

            const faltasScore = Math.max(100 - ((missingCount || 0) * 20), 0);

            // CÁLCULO FINAL PONDERADO
            // Pesos: Rec(25) + Exec(25) + Audit(20) + San(15) + Faltas(15) = 100
            const score_geral = Math.round(
                (recebimentosScore * 0.25) +
                (execucaoScore * 0.25) +
                (auditScore * 0.20) +
                (checklistScore * 0.15) +
                (faltasScore * 0.15)
            );

            let status: 'ALTA' | 'ATENCAO' | 'RISCO' = 'ALTA';
            // Critérios: Verde >= 85, Amarelo 60-84, Vermelho < 60
            if (score_geral < 60) status = 'RISCO';
            else if (score_geral < 85) status = 'ATENCAO';
            // else >= 85 é ALTA (VERDE)

            const report: ComplianceReport = {
                id: crypto.randomUUID(),
                escola_id: schoolId,
                periodo: month,
                score_geral,
                indicadores: {
                    recebimentos_on_time: Math.round(recebimentosScore),
                    auditorias_contagem: auditCount || 0,
                    // Mapeando para estrutura existente: 'divergencia' não é mais indicador de peso direto, mas mantemos para info visual se quiser
                    divergencia_estoque: 0,
                    faltas_itens: missingCount || 0,
                    execucao_cardapio: Math.round(execucaoScore),
                    pendencias_abertas: 0 // Simplificado
                },
                // Campos extras para usar na UI se adaptarmos o tipo
                status,
                ultima_atualizacao: new Date().toISOString()
            };

            return report;
        } catch (error) {
            console.error('Erro ao calcular conformidade:', error);
            throw error;
        }
    },

    /**
     * Valida e Bloqueia o resultado mensal (Ação da Nutricionista)
     */
    validateAndLock: async (report: ComplianceReport, validatorId: string) => {
        try {
            const nivelMap = {
                'ALTA': 'VERDE',
                'ATENCAO': 'AMARELO',
                'RISCO': 'VERMELHO'
            };

            const payload = {
                escola_id: report.escola_id,
                mes_referencia: report.periodo,
                score_geral: report.score_geral,
                indicadores: report.indicadores,
                nivel_selo: nivelMap[report.status],
                validado_por: validatorId,
                data_validacao: new Date().toISOString(),
                bloqueado: true
            };

            const { error } = await supabase
                .from('historico_conformidade')
                .upsert(payload, { onConflict: 'escola_id,mes_referencia' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao validar conformidade:', error);
            throw error;
        }
    },

    /**
     * Obtém o ranking de conformidade de todas as escolas.
     */
    getRanking: async (month: string, zonaId?: string): Promise<ComplianceReport[]> => {
        try {
            let query = supabase.from('escolas').select('id, nome, zona_id').eq('ativo', true);
            if (zonaId) query = query.eq('zona_id', zonaId);

            const { data: schools } = await query;
            if (!schools) return [];

            const reports = await Promise.all(
                schools.map(async (s) => {
                    const report = await complianceService.calculateCompliance(s.id, month);
                    return { ...report, escola: s as any };
                })
            );

            return reports.sort((a, b) => b.score_geral - a.score_geral);
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            throw error;
        }
    },

    // PUBLIC: Get Compliance Data for Transparency Panel
    getPublicData: async () => {
        try {
            // 1. Get Active Schools
            const { data: schools, error: schoolsError } = await supabase
                .from('escolas')
                .select('id, nome, zona_escolar') // Assuming 'zona_escolar' or similar exists, will check below
                .eq('ativo', true)
                .order('nome');

            if (schoolsError) throw schoolsError;
            if (!schools) return [];

            // 2. Get Latest Validated Snapshots for all schools (simplified for now 1 query per school or big join)
            // For efficiency, we can query the history table.

            const { data: history, error: historyError } = await supabase
                .from('historico_conformidade')
                .select('*')
                .eq('status_validacao', 'VALIDADO')
                .order('data_referencia', { ascending: false }); // We'll filter in JS to get latest per school

            if (historyError) throw historyError;

            // 3. Merge Data
            const publicData = schools.map(school => {
                // Find latest snapshot for this school
                const latest = history?.find((h: any) => h.escola_id === school.id);

                return {
                    id: school.id,
                    nome: school.nome,
                    zona: school.zona_escolar || 'Urbana', // Fallback
                    nivel: latest?.classificacao || 'PENDENTE',
                    validade: latest ? new Date(latest.data_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Em Análise',
                    pontuacao: latest ? Math.round(latest.pontuacao_final || 0) : 0, // Optional: show score? Rules say "Nível do selo", maybe score is too detailed? Keeping it for internal use or color coding.
                    historico: [] // Could be populated if needed
                };
            });

            return publicData;

        } catch (error) {
            console.error("Erro ao buscar dados públicos:", error);
            return [];
        }
    },

    /**
     * Obtém a evolução das escolas nos últimos meses (Ranking Evolutivo).
     */
    getSchoolEvolution: async (months: number = 6) => {
        try {
            // 1. Fetch Active Schools
            const { data: schools } = await supabase
                .from('escolas')
                .select('id, nome')
                .eq('ativo', true);

            if (!schools) return [];

            // 2. Fetch History for these schools in range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const { data: history } = await supabase
                .from('historico_conformidade')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .order('mes_referencia', { ascending: true }); // Chronological for line chart

            // 3. Process Per School
            const evolutionData = schools.map(school => {
                const schoolHistory = history?.filter((h: any) => h.escola_id === school.id) || [];

                // Sort by date just to be safe
                schoolHistory.sort((a: any, b: any) => new Date(a.mes_referencia).getTime() - new Date(b.mes_referencia).getTime());

                const currentScore = schoolHistory.length > 0 ? schoolHistory[schoolHistory.length - 1].score_geral : 0;
                const previousScore = schoolHistory.length > 1 ? schoolHistory[schoolHistory.length - 2].score_geral : currentScore;

                // Calculate Trend
                const diff = currentScore - previousScore;
                let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
                let status: 'POSITIVE' | 'STABLE' | 'ATTENTION' = 'STABLE';

                if (diff >= 5) { trend = 'UP'; status = 'POSITIVE'; }
                else if (diff <= -5) { trend = 'DOWN'; status = 'ATTENTION'; }

                // High performer maintenance bonus
                if (currentScore >= 90 && diff >= -2) {
                    status = 'POSITIVE'; // Maintaining excellence is positive
                }

                return {
                    schoolId: school.id,
                    schoolName: school.nome,
                    currentScore,
                    history: schoolHistory.map(h => ({
                        month: new Date(h.mes_referencia).toLocaleDateString('pt-BR', { month: 'short' }),
                        score: h.score_geral
                    })),
                    trend,
                    status,
                    delta: diff
                };
            });

            // Sort by "Best Evolution" (Highest Delta)
            return evolutionData.sort((a, b) => b.delta - a.delta);

        } catch (error) {
            console.error("Erro ao calcular evolução:", error);
            return [];
        }
    }
};
