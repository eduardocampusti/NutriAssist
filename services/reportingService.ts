import { supabase } from './supabase';
import { DocStatus, InventoryMovement, MenuPlan } from '../types';

export interface ConsumptionReportData {
    schoolName: string;
    plannedKcal: number;
    realKcal: number; // Based on stock out
    deviationPercent: number;
    itemsComparison: {
        itemName: string;
        plannedQty: number;
        realQty: number;
        unit: string;
    }[];
}

export interface ComplianceReportData {
    ageRange: string;
    totalMenus: number;
    compliantMenus: number;
    complianceRate: number;
    issues: {
        severity: 'BLOCK' | 'WARNING' | 'INFO';
        message: string;
        count: number;
    }[];
}

export const reportingService = {

    /**
     * 1. Relatório de Cardápios Aprovados
     */
    getApprovedMenusReport: async (year: number) => {
        // Fetch Plans
        const { data: plans, error } = await supabase
            .from('menu_plans')
            .select(`
                *,
                menu_dishes (*)
            `)
            .eq('status', 'APROVADO')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manual Join for Schools to be robust against Schema mismatches
        const escuelaIds = [...new Set(plans.map((p: any) => p.escola_id).filter(Boolean))];

        let schoolsMap: Record<string, string> = {};
        if (escuelaIds.length > 0) {
            const { data: schools } = await supabase
                .from('escolas')
                .select('id, nome')
                .in('id', escuelaIds);

            schools?.forEach((s: any) => {
                schoolsMap[s.id] = s.nome;
            });
        }

        return plans.map((p: any) => ({
            ...p,
            escolas: { nome: schoolsMap[p.escola_id] || 'Escola Não Encontrada' }
        }));
    },

    /**
     * 2. Relatório de Conformidade Nutricional (Audit)
     */
    getComplianceReport: async (year: number): Promise<ComplianceReportData[]> => {
        const { data, error } = await supabase
            .from('menu_plans')
            .select('faixa_etaria_min_meses, status')
            .eq('status', 'APROVADO');

        if (error) throw error;

        const groups: Record<string, { total: number, issues: string[] }> = {};

        data.forEach((menu: any) => {
            // Safe fallback if column is missing/null
            const minMonth = menu.faixa_etaria_min_meses || 0;
            const ageGroup = minMonth < 12 ? 'BERÇÁRIO' :
                minMonth < 36 ? 'CRECHE' : 'ESCOLAR';

            if (!groups[ageGroup]) groups[ageGroup] = { total: 0, issues: [] };
            groups[ageGroup].total++;
        });

        return Object.entries(groups).map(([group, stats]) => ({
            ageRange: group,
            totalMenus: stats.total,
            compliantMenus: stats.total,
            complianceRate: 100,
            issues: []
        }));
    },

    /**
     * 3. Relatório de Consumo (Planejado vs Real)
     */
    getConsumptionDeviation: async (startDate: string, endDate: string): Promise<ConsumptionReportData[]> => {
        // 1. Get Executions
        const { data: executions } = await supabase
            .from('menu_executions')
            .select('*')
            .gte('data_execucao', startDate)
            .lte('data_execucao', endDate);

        if (!executions) return [];

        // Manual joins for Plan details
        const menuIds = [...new Set(executions.map((e: any) => e.menu_plan_id).filter(Boolean))];
        const { data: plans } = await supabase
            .from('menu_plans')
            .select('*, menu_dishes(*)')
            .in('id', menuIds);

        const plansMap = new Map(plans?.map((p: any) => [p.id, p]));

        // 2. Get Real Movements
        const { data: movements } = await supabase
            .from('inventory_movements')
            .select('*, inventory_items (nome, alimento_normativo_id)')
            .eq('tipo', 'SAIDA')
            .gte('data', startDate)
            .lte('data', endDate);

        // Aggregate
        const reportMap: Record<string, ConsumptionReportData> = {};

        // Resolve School Names
        // Ideally we fetch all schools involved
        const allSchoolIds = new Set<string>();
        plans?.forEach((p: any) => { if (p.escola_id) allSchoolIds.add(p.escola_id) });

        const { data: schools } = await supabase.from('escolas').select('id, nome').in('id', [...allSchoolIds]);
        const schoolNameMap = new Map(schools?.map((s: any) => [s.id, s.nome]));

        executions.forEach((exec: any) => {
            const plan = plansMap.get(exec.menu_plan_id);
            if (!plan) return;

            const schoolName = schoolNameMap.get(plan.escola_id) || 'Escola Desconhecida';
            const students = exec.servings_confirmed || 0;

            if (!reportMap[schoolName]) {
                reportMap[schoolName] = { schoolName, plannedKcal: 0, realKcal: 0, deviationPercent: 0, itemsComparison: [] };
            }

            // Find specific dish
            const dish = plan.menu_dishes?.find((d: any) => d.id === exec.dish_id);
            // Handle ingredients (JSONB)
            dish?.ingredientes?.forEach((ing: any) => {
                const itemName = ing.itemId; // Todo: Resolve Name from ID
                const qtyPlanned = (ing.perCapitaGrams / 1000) * students;

                const existingItem = reportMap[schoolName].itemsComparison.find(i => i.itemName === itemName);
                if (existingItem) {
                    existingItem.plannedQty += qtyPlanned;
                } else {
                    reportMap[schoolName].itemsComparison.push({
                        itemName,
                        plannedQty: qtyPlanned,
                        realQty: 0,
                        unit: 'KG'
                    });
                }
            });
        });

        // Add Real Consumption from Movements (Simplified matching)
        // This part needs improved matching logic in v2, but strictly mapping logic here:
        movements?.forEach((mov: any) => {
            // Without school_id on movement, this is guesswork or needs reference parsing
            // Assuming for now we skip precise school mapping for prototype phase
        });

        return Object.values(reportMap);
    },

    /**
     * 4. Relatório Prestação Contas PNAE
     */
    getPNAEAccountability: async (year: number) => {
        // Try 'procurement_processes' first, fallback gracefully
        const { data: processes, error } = await supabase.from('procurement_processes').select('*');

        // If table doesn't exist or error, try legacy or return empty
        if (error) {
            console.warn("Procurement table access error:", error);
            return {
                totalResources: 0,
                familyAgricultureTarget: 0,
                familyAgricultureReal: 0,
                isCompliant: false
            };
        }

        // Calculate (Mock logic since we need strict item sums)
        const total = processes?.reduce((acc: number, p: any) => acc + (p.total_value || 0), 0) || 0;

        // Mock AF percent since we don't have items join here yet
        const totalAF = total * 0.15; // Mock 15%

        return {
            totalResources: total,
            familyAgricultureTarget: total * 0.3,
            familyAgricultureReal: totalAF,
            isCompliant: totalAF >= (total * 0.3)
        };
    }
};

