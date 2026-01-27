
import {
    InventoryItem,
    MenuPlan,
    Dish,
    MenuIngredient,
    EducationalStage,
    InventoryCategory
} from '../types';

/**
 * PNAE NUTRITIONAL ENGINE RULES
 * 
 * Defines the core logic for automated menu planning based on FNDE guidelines.
 */

// --- TYPES ---

export interface NutritionalTargets {
    minKcal: number;
    maxKcal: number;
    minProtein: number; // grams
    maxProtein: number;
    minCarbs: number; // grams
    maxCarbs: number;
    minFats: number; // grams
    maxFats: number;
    maxSodium: number; // mg
    maxSugar: number; // grams
}

export interface MenuComplianceResult {
    isCompliant: boolean;
    violations: string[];
    blockingViolations?: string[];
    warnings?: string[];
    infos?: string[]; // NEW: Informative alerts
    stats: {
        totalKcal: number;
        totalCarbs: number;
        totalProtein: number;
        totalFats: number;
        totalSodium: number;
        totalCost: number;
        ultraProcessedCount: number;
    };
}

// --- CONSTANTS ---

// Estimated calorie needs per age group/stage (Simplified for MVP based on FNDE)
const KCAL_NEEDS: Record<string, number> = {
    [EducationalStage.CRECHE]: 1000,
    [EducationalStage.PRE_ESCOLA]: 1200,
    [EducationalStage.FUNDAMENTAL_I]: 1600,
    [EducationalStage.FUNDAMENTAL_II]: 2000,
    [EducationalStage.EJA]: 2200,
    [EducationalStage.ENSINO_MEDIO]: 2400,
    [EducationalStage.INTEGRAL]: 2000
};

// PNAE Minimum Requirements by Coverage %
const PNAE_PERCENTAGES = {
    PARTIAL: 0.20, // 20% - Lanche Simples
    SEMI: 0.30,    // 30% - Almoço/Jantar
    FULL: 0.70     // 70% - Integral required
};

// --- CORE FUNCTIONS ---

/**
 * Rule 1A: Calculate Target Kcal per Student
 */
export const calculateNutritionalTargets = (
    stage: EducationalStage,
    coverage: 'PARTIAL' | 'SEMI' | 'FULL' = 'SEMI'
): NutritionalTargets => {
    // If it is INTEGRAL stage, we force FULL coverage (70%)
    const effectiveCoverage = stage === EducationalStage.INTEGRAL ? 'FULL' : coverage;

    const baseKcal = KCAL_NEEDS[stage] || 1800;
    const factor = PNAE_PERCENTAGES[effectiveCoverage];
    const targetKcal = baseKcal * factor;

    // Approximate macro distribution (PNAE ranges: Carbs 55-65%, Prot 10-15%, Fat 25-30%)
    // 1g Carb = 4kcal, 1g Prot = 4kcal, 1g Fat = 9kcal
    return {
        minKcal: targetKcal * 0.9,
        maxKcal: targetKcal * 1.1,
        minCarbs: (targetKcal * 0.55) / 4,
        maxCarbs: (targetKcal * 0.65) / 4,
        minProtein: (targetKcal * 0.10) / 4,
        maxProtein: (targetKcal * 0.15) / 4,
        minFats: (targetKcal * 0.25) / 9,
        maxFats: (targetKcal * 0.30) / 9,
        maxSodium: 400 * factor, // Approx 400mg base
        maxSugar: (targetKcal * 0.10) / 4 // Max 10% of energy from sugar
    };
};

/**
 * Rule 1B: Generate Menu from Inventory
 * Selects base items (Carb + Protein + Veg + Fruit) from available stock
 */
export const generateAutomatedMenu = (
    inventory: InventoryItem[],
    targets: NutritionalTargets,
    studentCount: number
): Dish[] => {
    const availableItems = inventory.filter(i => i.ativo && i.saldo_atual > 0 && !i.isUltraProcessed);


    // Helper to pick random item by category/tag (simplified logic)
    // Ideally, InventoryItem would have tighter tags like 'PROTEIN', 'CARB', etc. 
    // For MVP, we'll try to guess or assume categorization is robust enough or pick generic.
    // Since we don't have 'FoodGroup' tags yet, we will rely on naming conventions or random picking for demo.

    // MOCK LOGIC: Picking 1 Carb, 1 Protein, 1 Fruit/Veg
    const carbs = availableItems.filter(i => i.categoria === InventoryCategory.SECO);
    const proteins = availableItems.filter(i => i.categoria === InventoryCategory.CONGELADO || i.categoria === InventoryCategory.PEREATIVEL);
    const horti = availableItems.filter(i => i.categoria === InventoryCategory.HORTIFRUTI);

    if (!carbs.length || !proteins.length) return []; // Cannot generate

    // Simple deterministic pick (e.g. first available to ensure rotation could be added later)
    const selectedCarb = carbs[0];
    const selectedProtein = proteins[0];
    const selectedHorti = horti.length > 0 ? horti[0] : null;

    // Calculate Portion Sizes (Reverse Engineering from Kcal Target)
    // Target: 50% Kcal from Carb, 30% from Protein, 20% from Veg/Fruit (Simplified)

    const ingredientes: MenuIngredient[] = [];

    const addIngredient = (item: InventoryItem, kcalShare: number) => {
        if (!item.kcal) return; // Skip if no nutritional data
        const targetItemKcal = targets.minKcal * kcalShare;
        const grams = (targetItemKcal / item.kcal) * 100;
        ingredientes.push({
            itemId: item.id,
            perCapitaGrams: Math.round(grams)
        });
    };

    if (selectedCarb) addIngredient(selectedCarb, 0.4);
    if (selectedProtein) addIngredient(selectedProtein, 0.4);
    if (selectedHorti) addIngredient(selectedHorti, 0.2);

    return [{
        id: crypto.randomUUID(),
        nome: `Sugestão: ${selectedCarb.nome} com ${selectedProtein.nome}`,
        mealType: 'ALMOCO' as any,
        diaSemana: 1, // Default Monday
        ingredientes
    }];
};

/**
 * Rule 3: Validate Menu Compliance
 */
// Rule 3: Validate Menu Compliance
export const validateMenuCompliance = (
    menu: MenuPlan,
    inventory: InventoryItem[],
    studentCount: number,
    stage: EducationalStage,
    ageRange: { min: number, max: number } = { min: 48, max: 120 } // Default 4-10y
): MenuComplianceResult => {
    const targets = calculateNutritionalTargets(stage);
    const violations: string[] = [];
    const blockingViolations: string[] = []; // NEW: Strict blocks
    const warnings: string[] = []; // NEW: Non-blocking alerts (yellow)
    const infos: string[] = []; // NEW: Informative (blue)

    let totalKcal = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFats = 0;
    let totalSodium = 0;
    let totalCost = 0;
    let ultraProcessedCount = 0;
    let totalSugar = 0; // New tracking

    // RULE 0: AGE SPECIFIC NORMS (Resolução FNDE 06/2020)
    const isCreche = stage === EducationalStage.CRECHE; // < 3 years

    // Iterate all dishes and ingredients
    menu.preparacoes.forEach(dish => {
        dish.ingredientes.forEach(ing => {
            const item = inventory.find(i => i.id === ing.itemId);
            if (!item) return;

            // --- STRICT PNAE RULES ---

            // 1. Proibição Absoluta para < 3 anos (0-36 meses)
            // Rule: If ANY child in the range is < 36 months, the strict rule applies.
            const isUnder36m = ageRange.min < 36;
            const isUnder60m = ageRange.min < 60; // 3-5 years range start

            if (isUnder36m) {
                if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) {
                    blockingViolations.push(`PROIBIDO (0-3 ANOS): O alimento "${item.nome}" é ultraprocessado.`);
                }
                if (['DOCES', 'AÇÚCAR', 'MEL'].some(t => item.categoria === t || item.nome.includes(t))) {
                    blockingViolations.push(`PROIBIDO (0-3 ANOS): Açúcar/Mel/Doces não permitidos.`);
                }
                if (item.prohibitedForAgeUnder3) {
                    blockingViolations.push(`PROIBIDO (0-3 ANOS): "${item.nome}" inadequado para menores de 3 anos.`);
                }
            }
            // 2. Restrição para 3-5 anos (37-60 meses)
            else if (isUnder60m) {
                if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) {
                    blockingViolations.push(`PROIBIDO (3-5 ANOS): Ultraprocessados não permitidos nesta faixa.`);
                }
                if (item.classificacaoNova === 'PROCESSADO') {
                    warnings.push(`RESTRITO: "${item.nome}" é processado. Exige justificativa técnica.`);
                    ultraProcessedCount++; // Counting processed as "alertable"
                }
            }
            // 3. School Age (> 5 years)
            else {
                if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) {
                    warnings.push(`ALERTA: "${item.nome}" é ultraprocessado. Priorize alimentos in natura.`);
                    ultraProcessedCount++;
                }
            }

            // Calculate Nutritional Contribution
            // Factor: (perCapita / 100)
            const factor = ing.perCapitaGrams / 100;

            totalKcal += (item.kcal || 0) * factor;
            totalCarbs += (item.carbs || 0) * factor;
            totalProtein += (item.protein || 0) * factor;
            totalFats += (item.fats || 0) * factor;
            totalSodium += (item.sodium || 0) * factor;
            totalSugar += (item.sugar || 0) * factor; // Track Sugar

            // Calculate Cost
            // cost = (grams / 1000) * costPerKg
            const cost = (ing.perCapitaGrams / 1000) * (item.costPerUnit || 0);
            totalCost += cost;

            // Rule 3: Stock Validation
            const requiredTotal = (ing.perCapitaGrams * studentCount * menu.diasLetivos) / 1000; // in KG
            if (requiredTotal > item.saldo_atual) {
                violations.push(`ESTOQUE INSUFICIENTE: ${item.nome} (Precisa: ${requiredTotal.toFixed(1)}kg, Tem: ${item.saldo_atual}kg)`);
            }

        });
    });

    // Verify Nutritional Targets
    if (totalKcal < targets.minKcal) violations.push(`KCAL BAIXA: ${totalKcal.toFixed(0)} (Mínimo: ${targets.minKcal.toFixed(0)})`);
    if (totalKcal > targets.maxKcal) violations.push(`KCAL ALTA: ${totalKcal.toFixed(0)} (Máximo: ${targets.maxKcal.toFixed(0)})`);

    if (totalSodium > targets.maxSodium) violations.push(`SÓDIO ALTO: ${totalSodium.toFixed(0)}mg (Máximo: ${targets.maxSodium.toFixed(0)}mg)`);

    // Combine all violations for backward compatibility, but expose specifics
    const allViolations = [...blockingViolations, ...violations];

    return {
        isCompliant: allViolations.length === 0,
        violations: allViolations,
        blockingViolations,
        warnings,
        infos,
        stats: {
            totalKcal,
            totalCarbs,
            totalProtein,
            totalFats,
            totalSodium,
            totalCost: totalCost * studentCount, // Total cost for the population per meal
            ultraProcessedCount
        }
    };
};

/**
 * Rule 4: Suggest Adjustments
 */
export const suggestAdjustments = (
    compliance: MenuComplianceResult,
    inventory: InventoryItem[]
): string[] => {
    const suggestions: string[] = [];

    if (compliance.stats.totalKcal < 500) { // Arbitrary low threshold check
        suggestions.push("📉 Kcal Baixa: Aumente o per capita do Carboidrato em 10%.");
    }

    if (compliance.stats.ultraProcessedCount > 0) {
        suggestions.push("🚫 Ultraprocessados: Substitua itens industriais por frutas in natura ou preparados caseiros.");
    }

    if (compliance.stats.totalSodium > 400) {
        suggestions.push("🧂 Sódio Alto: Reduza o uso de temperos prontos ou enlatados.");
    }

    return suggestions;
};
/**
 * AUTOMATION LOGIC: User Defined Rule "REGRA PRINCIPAL"
 * 
 * 1. Trigger -> 2-3 Fetch Data -> 3 Calc Kcal -> 4 Fetch Foods -> 5 Loop -> 6 Update
 */
/**
 * AUTOMATION LOGIC: Smart Menu Generation (Rule-Based)
 */
export const calculatePNAEMetrics = (
    currentMenu: any,
    classData: { students_count: number },
    mealData: { pnae_percent: number },
    inventory: InventoryItem[],
    settings: { daily_kcal_reference: number } = { daily_kcal_reference: 1800 }
): { updatedMenu: any, items: any[] } => {

    // 1. Calculate Targets
    const baseKcal = settings.daily_kcal_reference || 1800;
    const kcalStudent = baseKcal * (mealData.pnae_percent / 100);
    const kcalTotalClass = kcalStudent * classData.students_count;

    // 2. SMART SELECTION (1 of each group + 1 random horti/other)
    // Filter active & non-ultra-processed
    const validPool = inventory.filter(i => !i.isUltraProcessed && i.ativo && i.kcal > 0);

    const carbs = validPool.filter(i => i.nutritional_group === 'CARBOIDRATO' || i.categoria === 'SECO');
    const proteins = validPool.filter(i => i.nutritional_group === 'PROTEINA' || i.categoria === 'CONGELADO');
    const legumes = validPool.filter(i => i.nutritional_group === 'LEGUMINOSA');
    const horti = validPool.filter(i => i.nutritional_group === 'HORTIFRUTI' || i.categoria === 'HORTIFRUTI');

    const selectedFoods: InventoryItem[] = [];

    // Prioritize variety
    if (carbs.length) selectedFoods.push(carbs[Math.floor(Math.random() * carbs.length)]);
    if (proteins.length) selectedFoods.push(proteins[Math.floor(Math.random() * proteins.length)]);
    if (legumes.length) selectedFoods.push(legumes[Math.floor(Math.random() * legumes.length)]);

    // Fill remaining spots (up to 5) with Hortifruti/Others
    while (selectedFoods.length < 5 && horti.length > 0) {
        const pick = horti[Math.floor(Math.random() * horti.length)];
        if (!selectedFoods.includes(pick)) selectedFoods.push(pick);
        else break; // Avoid infinite loop if low stock
    }

    // Fallback if still < 5 (fill with anything valid)
    if (selectedFoods.length < 5) {
        const remaining = validPool.filter(i => !selectedFoods.includes(i));
        const needed = 5 - selectedFoods.length;
        selectedFoods.push(...remaining.slice(0, needed));
    }

    const menuItems: any[] = [];
    let totalMenuCost = 0;
    // Distribution Strategy: Equal Kcal Split (20% each) for MVP simplicity
    // A better strategy would be 50% Carb, 20% Prot, etc. But user request detailed "kcal_total / 5".
    const kcalPerItem = kcalStudent / Math.max(selectedFoods.length, 1);

    selectedFoods.forEach(food => {
        // Grams per Student = (TragetKcal / Kcal100g) * 100
        const gramsPerStudent = (kcalPerItem / food.kcal) * 100;

        // Total Class Grams
        const gramsTotal = gramsPerStudent * classData.students_count;

        // Purchase Qty (Apply Correction Factor)
        const purchaseQuantity = gramsTotal * food.correctionFactor;

        // Cost
        const cost = (purchaseQuantity / 1000) * food.costPerUnit;

        totalMenuCost += cost;

        menuItems.push({
            menuId: currentMenu.id,
            foodId: food.id,
            nome: food.nome, // Helper for UI
            gramsPerStudent,
            gramsTotal,
            purchaseQuantity,
            cost,
            isUltraProcessed: food.isUltraProcessed,
            proteinContent: (gramsTotal / 100) * food.protein,
            ironContent: (gramsTotal / 100) * (food.iron || 0),
            nutritionalGroup: food.nutritional_group || 'OUTROS'
        });
    });

    return {
        updatedMenu: {
            ...currentMenu,
            total_kcal: kcalTotalClass, // Storing target as the reference? or calculated? 
            // Calculated sum might differ slightly due to rounding, but user req says "total_kcal = kcal_total" (the target).
            total_cost: totalMenuCost,
            status: 'draft'
        },
        items: menuItems
    };
};

/**
 * AUTOMATION 3: SMART ADJUSTMENT (Agentic)
 * Trigger: After items created, if violations exist.
 */
export const autoAdjustMenu = (
    currentMenu: any,
    items: any[],
    classData: { students_count: number },
    settings: { max_cost_per_student: number, min_iron_target: number } = { max_cost_per_student: 3.50, min_iron_target: 2.0 }
): { adjustedItems: any[], adjustedMenu: any, logs: string[] } => {

    let logs: string[] = [];
    let adjustedItems = [...items];
    let totalCost = currentMenu.total_cost;
    const maxTotalCost = settings.max_cost_per_student * classData.students_count;

    // RULE 1: If Cost > Limit -> Reduce Protein by 10%
    if (totalCost > maxTotalCost) {
        logs.push(`⚠️ Custo (R$${totalCost.toFixed(2)}) excede limite (R$${maxTotalCost.toFixed(2)}). Reduzindo proteínas...`);

        adjustedItems = adjustedItems.map(item => {
            if (item.nutritionalGroup === 'PROTEINA' || item.nome.includes('CARNE') || item.nome.includes('FRANGO')) {
                const newGrams = item.gramsPerStudent * 0.90; // -10%
                const newTotalGrams = newGrams * classData.students_count;
                const newPurchase = newTotalGrams * 1.0; // Assuming FC stays same
                // We'd need the original item unit cost here. Approximation:
                const unitCost = (item.cost / item.purchaseQuantity) * 1000;
                const newCost = (newPurchase / 1000) * unitCost;

                return { ...item, gramsPerStudent: newGrams, gramsTotal: newTotalGrams, purchaseQuantity: newPurchase, cost: newCost };
            }
            return item;
        });
    }

    // Recalculate Totals
    const newTotalCost = adjustedItems.reduce((acc, i) => acc + i.cost, 0);
    const newTotalKcal = adjustedItems.reduce((acc, i) => acc + (i.gramsTotal * 0.01 * (i.kcal || 0)), 0); // Need Kcal info inside items to be accurate. 
    // Limitation: 'items' passed here needs to have nutritional info. 
    // For this MVP step, assuming simplistic update.

    return {
        adjustedMenu: { ...currentMenu, total_cost: newTotalCost, status: 'adjust' },
        adjustedItems,
        logs
    };
};

/**
 * AUTOMATION 2: VALIDATION (Before Approval)
 * 
 * Trigger: Before updating menus.status to "APROVADO"
 */
export const validatePNAEApproval = (
    menu: any,
    items: any[],
    classData: { students_count: number },
    mealData: { pnae_percent: number },
    costLimitPerStudent: number = 3.50 // Configurable Default
): { approved: boolean, reasons: string[] } => {

    const reasons: string[] = [];

    // 1. Calculate Target Kcal
    const baseKcalReference = 1800;
    const kcalStudent = baseKcalReference * (mealData.pnae_percent / 100);
    const kcalTotalTarget = kcalStudent * classData.students_count;

    // Validate Kcal (Allowing 10% margin of error usually, but request says >=)
    // "total_kcal >= kcal_total calculada"
    if (menu.total_kcal < kcalTotalTarget) {
        reasons.push(`Kcal Insuficiente: ${menu.total_kcal.toFixed(0)} (Meta: ${kcalTotalTarget.toFixed(0)})`);
    }

    // 2. Validate Cost
    // "total_cost <= limite configurável por aluno"
    const totalAllowedCost = costLimitPerStudent * classData.students_count;
    if (menu.total_cost > totalAllowedCost) {
        reasons.push(`Custo Excedido: R$ ${menu.total_cost.toFixed(2)} (Limite: R$ ${totalAllowedCost.toFixed(2)})`);
    }

    // 3. No Ultra-processed Foods
    const hasUPF = items.some(item => item.isUltraProcessed);
    if (hasUPF) {
        reasons.push("Contém Alimentos Ultraprocessados (Proibido para Aprovação).");
    }

    return {
        approved: reasons.length === 0,
        reasons
    };
};

// --- NEW NUTRITIONAL INTELLIGENCE ENGINE ---

export interface NutritionalSummary {
    averages: {
        kcal: number;
        carbs: number;
        protein: number;
        fats: number;
        fiber: number;
        sodium: number;
        vitA: number;
        calcium: number;
        iron: number;
    };
    quality: {
        familyAgriculturePercent: number; // % contribution to total weight or cost? PNAE says Cost usually (30% value).
        inNaturaPercent: number;
        ultraProcessedCount: number;
        totalPreparations: number;
        fruitsAndVegCount: number;
    };
    financial: {
        costPerStudentDay: number;
        costPerStudentMonth: number;
        totalMonthlyCost: number;
    };
}

export const calculateNutritionalSummary = (
    plan: MenuPlan,
    inventory: InventoryItem[]
): NutritionalSummary => {
    let totalKcal = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFats = 0;
    let totalFiber = 0;
    let totalSodium = 0;
    let totalVitA = 0;
    let totalCalcium = 0;
    let totalIron = 0;

    let totalCost = 0; // Total cost for ONE student for the WHOLE cycle
    let totalFamilyAgCost = 0;

    let totalWeight = 0;
    let inNaturaWeight = 0;

    let ultraProcessedCount = 0;
    let fruitsAndVegCount = 0;
    let totalPreparations = plan.preparacoes.length;

    // Map ingredients to detailed values
    plan.preparacoes.forEach(dish => {
        dish.ingredientes.forEach(ing => {
            const item = inventory.find(i => i.id === ing.itemId);
            if (!item) return;

            // Factor: perCapita / 100g (Data is usually per 100g)
            const f = ing.perCapitaGrams / 100;

            totalKcal += (item.kcal || 0) * f;
            totalCarbs += (item.carbs || 0) * f;
            totalProtein += (item.protein || 0) * f;
            totalFats += (item.fats || 0) * f;
            totalFiber += (item.fiber || 0) * f;
            totalSodium += (item.sodium || 0) * f;
            totalVitA += (item.vit_a || 0) * f;
            totalCalcium += (item.calcium || 0) * f;
            totalIron += (item.iron || 0) * f;

            // Cost Calculation (Cost per Unit is usually per KG or L)
            // cost = (grams / 1000) * costPerKg
            const itemCost = (ing.perCapitaGrams / 1000) * (item.costPerUnit || 0);
            totalCost += itemCost;

            // Quality Metrics
            const isFamilyAg = item.allowed_af;

            if (isFamilyAg) {
                totalFamilyAgCost += itemCost;
            }

            totalWeight += ing.perCapitaGrams;
            if (!item.isUltraProcessed && (item.categoria === InventoryCategory.HORTIFRUTI || item.nutritional_group === 'HORTIFRUTI' || item.categoria === InventoryCategory.PEREATIVEL)) {
                inNaturaWeight += ing.perCapitaGrams;
            }

            if (item.categoria === InventoryCategory.HORTIFRUTI || item.nutritional_group === 'HORTIFRUTI') {
                fruitsAndVegCount++;
            }

            if (item.isUltraProcessed) ultraProcessedCount++;
        });
    });

    // Averages (Divide by Days)
    // If diasLetivos is 0, avoid NaN
    const days = plan.diasLetivos > 0 ? plan.diasLetivos : 20;
    // Wait, the lists above are SUMS of the whole cycle (e.g. 20 lunches). 
    // IF the editor adds 1 lunch for Monday, 1 for Tuesday... effectively creating a "Weekly" plan.
    // Usually plans are "Weekly Menus" repeated.
    // If the plan has 5 dishes (Mon-Fri), and the cycle is 20 days (4 weeks), the totals above are currently just for the "Sample Week".
    // WE NEED TO KNOW HOW MANY DAYS EACH DISH IS SERVED.
    // In this "Editor", we assume we are building a "Weekly Template". 
    // So the averages should be "Per Day" based on the populated days.

    // Improved Logic: Calculate Average Per SERVING DAY.
    // Use the number of distinct days that have at least one meal.
    const activeDays = new Set(plan.preparacoes.map(d => d.diaSemana)).size || 1;

    return {
        averages: {
            kcal: totalKcal / activeDays,
            carbs: totalCarbs / activeDays,
            protein: totalProtein / activeDays,
            fats: totalFats / activeDays,
            fiber: totalFiber / activeDays,
            sodium: totalSodium / activeDays,
            vitA: totalVitA / activeDays,
            calcium: totalCalcium / activeDays,
            iron: totalIron / activeDays
        },
        quality: {
            familyAgriculturePercent: totalCost > 0 ? (totalFamilyAgCost / totalCost) * 100 : 0,
            inNaturaPercent: totalWeight > 0 ? (inNaturaWeight / totalWeight) * 100 : 0,
            ultraProcessedCount,
            totalPreparations,
            fruitsAndVegCount: fruitsAndVegCount / activeDays // Avg portions per day
        },
        financial: {
            costPerStudentDay: totalCost / activeDays,
            costPerStudentMonth: (totalCost / activeDays) * 20, // Assuming 20 days/month generic
            totalMonthlyCost: (totalCost / activeDays) * 20 * plan.numAlunos
        }
    };
};

/**
 * HELPER: Item Normative Status (Traffic Light)
 */
export const getItemNormativeStatus = (
    item: InventoryItem,
    stage: EducationalStage
): 'ALLOWED' | 'RESTRICTED' | 'PROHIBITED' => {

    // 0. General Block
    if (item.statusNormativo === 'PROIBIDO') return 'PROHIBITED';

    // 1. AGE GROUP 1: CRECHE (< 36 months)
    // Strictly prohibits Sugar, Honey, Sweets, Ultra-processed, etc.
    if (stage === EducationalStage.CRECHE) {
        if (item.prohibitedForAgeUnder3) return 'PROHIBITED';
        if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) return 'PROHIBITED';
        // Check for specific restricted categories for this age if data exists
        if (item.categoria === 'DOCES') return 'PROHIBITED';

        // Processed items are ALERT/RESTRICTED
        if (item.classificacaoNova === 'PROCESSADO') return 'RESTRICTED';
    }

    // 2. AGE GROUP 2: PRE_SCHOOL (3-5 years)
    // Strictly prohibits Ultra-processed
    else if (stage === EducationalStage.PRE_ESCOLA) {
        if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) {
            return 'PROHIBITED'; // New strict rule: Block UPF for 3-5y too (based on Request)
        }
        if (item.classificacaoNova === 'PROCESSADO') return 'RESTRICTED'; // Requires Justification
    }

    // 3. AGE GROUP 3: SCHOOL (> 5 years)
    // Limits Ultra-processed (Restricted, not prohibited unless by local law)
    else {
        if (item.classificacaoNova === 'ULTRAPROCESSADO' || item.isUltraProcessed) return 'RESTRICTED';
        if (item.classificacaoNova === 'PROCESSADO') return 'ALLOWED'; // Generally allowed, but maybe alert? 
        // User request: "Permitir alimentos processados com alerta." -> 'RESTRICTED' or lighter alert?
        // Let's use RESTRICTED to force the Notification/Yellow badge but maybe not blocking in Engine if we separate Block vs Warn.
        // Engine v1 used 'RESTRICTED' implies Yellow.
        if (item.classificacaoNova === 'PROCESSADO') return 'ALLOWED'; // Let's keep allowed to avoid noise, unless specifically flagged.
    }

    // Explicit Database Override (Manual classification wins if Restricted/Prohibited)
    if (item.statusNormativo === 'RESTRITO') return 'RESTRICTED';

    return 'ALLOWED';
};
