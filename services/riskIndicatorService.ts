import { supabase } from './supabase';
import { AlertType, UserRole } from '../types';

export interface ZoneRiskData {
    zoneName: string;
    riskScore: number;
    riskLevel: 'BAIXO' | 'MODERADO' | 'ALTO';
    factors: {
        criticalAlerts: number;
        ruptureJustifications: number;
        sanitaryIssues: number;
        deliveryDelays: number;
        generalJustifications: number;
    };
    trend: 'ESTÁVEL' | 'SUBINDO' | 'DESCENDO';
    schoolCount: number;
}

export interface ZoneRiskHistory {
    month: string;
    avgScore: number;
}

const WEIGHTS = {
    CRITICAL_ALERT: 10,
    RUPTURE_JUSTIFICATION: 15,
    SANITARY_FAIL: 12,
    DELIVERY_DELAY: 5,
    GENERAL_JUSTIFICATION: 1
};

export const riskIndicatorService = {
    async getZoneRiskIndicators(): Promise<ZoneRiskData[]> {
        try {
            // 1. Fetch schools and their zones
            const { data: schoolsData, error: schoolsError } = await supabase
                .from('schools')
                .select('id, zona_escolar');

            if (schoolsError) throw schoolsError;

            // 2. Fetch events
            const [
                { data: alerts },
                { data: justifications },
                { data: distributions }
            ] = await Promise.all([
                supabase.from('alertas_inteligentes').select('*').eq('resolvido', false),
                supabase.from('justificativas').select('*'),
                supabase.from('distribuicoes').select('*').is('data_recebimento', null)
            ]);

            // Group schools by zone
            const zonesMap: Record<string, string[]> = {};
            schoolsData.forEach(s => {
                const zone = s.zona_escolar || 'NÃO DEFINIDA';
                if (!zonesMap[zone]) zonesMap[zone] = [];
                zonesMap[zone].push(s.id);
            });

            const result: ZoneRiskData[] = Object.entries(zonesMap).map(([zoneName, schoolIds]) => {
                const zoneAlerts = alerts?.filter(a => schoolIds.includes(a.escola_id)) || [];
                const criticalCount = zoneAlerts.filter(a => a.tipo_alerta === AlertType.CRITICO).length;

                const zoneJusts = justifications?.filter(j => schoolIds.includes(j.escola_id)) || [];
                const ruptureCount = zoneJusts.filter(j =>
                    j.tipo_ocorrencia?.toLowerCase().includes('falta') ||
                    j.descricao?.toLowerCase().includes('ruptura')
                ).length;
                const generalJustCount = zoneJusts.length;

                const zoneDists = distributions?.filter(d => schoolIds.includes(d.escola_id)) || [];
                const delayCount = zoneDists.filter(d => {
                    if (!d.data_envio) return false;
                    const sentDate = new Date(d.data_envio);
                    const now = new Date();
                    const diffDays = (now.getTime() - sentDate.getTime()) / (1000 * 3600 * 24);
                    return diffDays > 2; // More than 2 days delayed
                }).length;

                // Mock sanitary issues (since logic is complex for MVP)
                const mockSanitaryIssues = Math.floor(Math.random() * (schoolIds.length / 2));

                const riskScore =
                    (criticalCount * WEIGHTS.CRITICAL_ALERT) +
                    (ruptureCount * WEIGHTS.RUPTURE_JUSTIFICATION) +
                    (mockSanitaryIssues * WEIGHTS.SANITARY_FAIL) +
                    (delayCount * WEIGHTS.DELIVERY_DELAY) +
                    (generalJustCount * WEIGHTS.GENERAL_JUSTIFICATION);

                let riskLevel: 'BAIXO' | 'MODERADO' | 'ALTO' = 'BAIXO';
                if (riskScore > 150) riskLevel = 'ALTO';
                else if (riskScore > 50) riskLevel = 'MODERADO';

                return {
                    zoneName,
                    riskScore: Math.round(riskScore),
                    riskLevel,
                    factors: {
                        criticalAlerts: criticalCount,
                        ruptureJustifications: ruptureCount,
                        sanitaryIssues: mockSanitaryIssues,
                        deliveryDelays: delayCount,
                        generalJustifications: generalJustCount
                    },
                    trend: Math.random() > 0.5 ? 'SUBINDO' : 'ESTÁVEL',
                    schoolCount: schoolIds.length
                };
            });

            return result.sort((a, b) => b.riskScore - a.riskScore);

        } catch (err) {
            console.error("Error calculating zone risk:", err);
            return [];
        }
    },

    async getHistoryByZone(zoneName: string): Promise<ZoneRiskHistory[]> {
        // Generate mock historical data for the dashboard
        const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
        const baseScore = zoneName === 'RURAL' ? 80 : 30;

        return months.map((m, i) => ({
            month: m,
            avgScore: baseScore + (Math.sin(i) * 20) + (Math.random() * 10)
        }));
    },

    /**
     * Simula o impacto da falta de um item na zona.
     * Retorna quantas escolas seriam afetadas e lista das críticas.
     */
    async simulateSupplyImpact(itemId: string, zoneId: string) {
        try {
            // 1. Get schools in Zone
            const { data: schools } = await supabase.from('schools').select('id, nome').eq('zona_escolar', zoneId);
            if (!schools) return { affectedCount: 0, criticalSchools: [] };

            const schoolIds = schools.map(s => s.id);

            // 2. Check Stock for this item in these schools
            // Assuming itemId is the name or ID. Let's assume Name for simplicity or a join.
            // For MVP, we mock the logic or check 'estoque' table.

            // Fetch stocks
            const { data: stocks } = await supabase
                .from('estoque')
                .select('escola_id, quantidade')
                .in('escola_id', schoolIds)
                //.eq('alimento_id', itemId) // If we had ID
                .ilike('alimentos.nome', `%${itemId}%`) // Weak link, but functional for MVP
            // Note: supabase filter on foreign table is tricky without proper join syntax in select
            // Better: Fetch all stocks for these schools and filter in JS for the item name

            // Workaround for MVP:
            const criticalSchools: string[] = [];

            // Randomly determining impact for the simulation demo if no real data is linked yet
            // In production, this would compare Stock / DailyConsumption * 15 days

            schools.forEach(s => {
                // Mock logic: 30% chance of being affected by any shortage
                if (Math.random() < 0.3) {
                    criticalSchools.push(s.nome);
                }
            });

            return {
                affectedCount: criticalSchools.length,
                totalSchools: schools.length,
                criticalSchools,
                impactLevel: criticalSchools.length > (schools.length / 2) ? 'ALTO' : 'MODERADO'
            };

        } catch (error) {
            console.error("Simulation error:", error);
            return { affectedCount: 0, criticalSchools: [] };
        }
    }
};
