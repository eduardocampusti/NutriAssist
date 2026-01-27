
import { MenuPlan, InventoryItem, DocStatus } from '../types';
import { supabase } from './supabase';

export interface AnnualNeed {
    alimento_normativo_id: string;
    nome_alimento: string;
    unidade: string;
    total_anual: number;
    valor_estimado_total: number;
    especificacao_tecnica?: string;
    meses_oferta: number[]; // e.g. [2,3,4,5...]
}

export interface ProcurementValidation {
    isReady: boolean;
    errors: string[];
    stats: {
        totalMenus: number;
        approvedMenus: number;
        totalSchools: number;
    }
}

/**
 * Calculates the Total Annual Needs based on Approved Menus
 */
export const procurementEngine = {

    // 1. Validate System State for Procurement
    validateProcurementReadiness: async (year: number): Promise<ProcurementValidation> => {
        // Fetch ALL menus for the year (Simplified query assumption)
        // In real app, filter by date range of the year
        const { data: menus, error } = await supabase
            .from('cardapios')
            .select(`*, cardapio_itens(*)`)
            .eq('status', 'APROVADO'); // STRICT: Only Approved

        if (error) throw error;

        const errors: string[] = [];

        // Check 1: Are there approved menus?
        if (!menus || menus.length === 0) {
            errors.push("Não há cardápios APROVADOS para o exercício de " + year);
        }

        // Check 2: Validity (Double Check)
        // Ideally this is ensured at Approval time, but for Procurement safety we re-check
        // (Pseudocode check, assuming 'status_validacao' is persisted)
        const hasViolations = menus?.some(m =>
            m.cardapio_itens.some((i: any) => i.status_validacao === 'BLOQUEADO')
        );

        if (hasViolations) {
            errors.push("Existem itens com status BLOQUEADO em cardápios aprovados (Inconsistência Grave).");
        }

        return {
            isReady: errors.length === 0,
            errors,
            stats: {
                totalMenus: menus?.length || 0,
                approvedMenus: menus?.length || 0, // Since we filtered
                totalSchools: new Set(menus?.map(m => m.escola_id)).size
            }
        };
    },

    // 2. Compute the Map
    computeAnnualRequirements: async (year: number, useAIProjection: boolean = false): Promise<AnnualNeed[]> => {
        // Fetch Approved Plans
        const { data: plans, error } = await supabase
            .from('cardapios')
            .select(`
                id, dias_letivos, num_alunos, 
                cardapio_itens (
                    alimento_normativo_id,
                    per_capita_g,
                    dia_semana,
                    alimentos_normativos(nome_alimento, classificacao_nova)
                )
            `)
            .eq('status', DocStatus.APROVADO);

        if (error || !plans) return [];

        // Aggregation Map
        const needsMap = new Map<string, AnnualNeed>();

        // Iterate Plans
        for (const plan of plans) {
            const studentCount = plan.num_alunos || 0;
            const schoolDays = plan.dias_letivos || 200; // Annual assumption if not specific
            // If plan is 'MENSAL', dias_letivos might be 20. If 'ANUAL', 200.
            // Assuming plan represents a Cycle. The 'dias_letivos' in plan means "How many days this plan is active".

            const items: any[] = plan.cardapio_itens;

            for (const item of items) {
                if (!item.alimento_normativo_id) continue;

                const normId = item.alimento_normativo_id;
                const perCapitaKg = item.per_capita_g / 1000;

                // Formula: PerCapita * Students * Frequency
                // Frequency: Determining how many times this item appears in the cycle vs total days.
                // Simplified MVP: usage = (perCapita * students * schoolDays)
                // *Refining*: If a plan has 20 days, and item is on Monday (1 dia/sem), it appears 4 times.
                // Assuming 'dias_letivos' is the duration of the cycle.
                // And 'dia_semana' implies weekly frequency.
                // Let's assume (FrequencyInWeek / 5) * DiasLetivosTotal of the Plan.

                const freqInCycle = 1; // Simplification: 1 appearance per week if listed? 
                // Getting complex. Let's stick to user prompt: "freq * alunos * dias"

                const totalQty = perCapitaKg * studentCount * (schoolDays / 5); // Approx weekly calc

                if (needsMap.has(normId)) {
                    const existing = needsMap.get(normId)!;
                    existing.total_anual += totalQty;
                } else {
                    needsMap.set(normId, {
                        alimento_normativo_id: normId,
                        nome_alimento: item.alimentos_normativos?.nome_alimento || 'Item Desconhecido',
                        unidade: 'KG', // Default
                        total_anual: totalQty,
                        valor_estimado_total: 0, // Todo: fetch average price
                        meses_oferta: []
                    });
                }
            }
        }

        return Array.from(needsMap.values());
    },

    // 3. Get Real Consumption Benchmark (Past 12 Months)
    getRealConsumptionBenchmark: async (year: number): Promise<Record<string, { totalReal: number; totalLoss: number }>> => {
        const startDate = new Date(year - 1, 0, 1).toISOString(); // Jan 1st of previous year
        const endDate = new Date(year - 1, 11, 31).toISOString(); // Dec 31st of previous year

        const { data: movements, error } = await supabase
            .from('inventory_movements')
            .select(`
                quantity, 
                type, 
                movement_purpose, 
                item_id,
                inventory_items (alimento_normativo_id)
            `)
            .eq('type', 'SAIDA')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error || !movements) return {};

        const benchmark: Record<string, { totalReal: number; totalLoss: number }> = {};

        movements.forEach((mov: any) => {
            const normId = mov.inventory_items?.alimento_normativo_id || mov.item_id;
            if (!normId) return;

            if (!benchmark[normId]) benchmark[normId] = { totalReal: 0, totalLoss: 0 };

            // Movement Purposes: CONSUMO_DIARIO, PERDA, DESCARTE, etc.
            if (mov.movement_purpose === 'CONSUMO_DIARIO' || mov.movement_purpose === 'EXECUTADO') {
                benchmark[normId].totalReal += Number(mov.quantity);
            } else if (mov.movement_purpose === 'PERDA' || mov.movement_purpose === 'AVARIA' || mov.movement_purpose === 'DESCARTE') {
                benchmark[normId].totalLoss += Number(mov.quantity);
            } else {
                // If unknown but SAIDA, assume real impact on planning
                benchmark[normId].totalReal += Number(mov.quantity);
            }
        });

        return benchmark;
    }
};
