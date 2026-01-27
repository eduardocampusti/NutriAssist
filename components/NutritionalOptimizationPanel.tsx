
import React, { useMemo } from 'react';
import { MenuPlan, InventoryItem, EducationalStage } from '../types';
import { calculateNutritionalSummary, calculateNutritionalTargets, NutritionalSummary } from '../services/menuEngine';

interface NutritionalOptimizationPanelProps {
    plan: MenuPlan;
    inventory: InventoryItem[];
    className?: string;
}

export const NutritionalOptimizationPanel: React.FC<NutritionalOptimizationPanelProps> = ({ plan, inventory, className }) => {

    // 1. Calculate Real-Time Metrics
    const summary = useMemo(() => calculateNutritionalSummary(plan, inventory), [plan, inventory]);

    // 2. Get Targets
    const targets = useMemo(() => calculateNutritionalTargets(plan.etapa || 'FUNDAMENTAL_I'), [plan.etapa]);

    // 3. Helper for Status Colors
    const getStatusColor = (val: number, min: number, max: number, reverse: boolean = false) => {
        if (reverse) {
            if (val > max) return 'bg-red-500 text-white';
            if (val > min) return 'bg-yellow-400 text-slate-900';
            return 'bg-emerald-500 text-white';
        }
        if (val < min) return 'bg-red-500 text-white'; // Too low
        if (val > max) return 'bg-yellow-400 text-slate-900'; // Too high
        return 'bg-emerald-500 text-white'; // Good
    };

    const getPercentage = (val: number, target: number) => Math.min((val / target) * 100, 100);

    return (
        <div className={`flex flex-col gap-6 ${className}`}>

            {/* HEADER */}
            <div>
                <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                    <span>📊</span> Painel de Otimização Nutricional
                </h3>
                <p className="text-[10px] text-slate-400">Análise em tempo real do PNAE</p>
            </div>

            {/* 1. MACRONUTRIENTS CIRCLES */}
            <div className="grid grid-cols-2 gap-4">
                {/* KCAL */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(summary.averages.kcal, targets.minKcal, targets.maxKcal)}`}></div>
                    </div>
                    <span className="text-2xl font-black text-slate-700">{summary.averages.kcal.toFixed(0)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Kcal (Méd/Dia)</span>
                    <div className="w-full h-1 bg-slate-100 mt-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getStatusColor(summary.averages.kcal, targets.minKcal, targets.maxKcal)}`}
                            style={{ width: `${getPercentage(summary.averages.kcal, targets.minKcal)}%` }}
                        ></div>
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1">Meta: {targets.minKcal.toFixed(0)}</span>
                </div>

                {/* MACRO STACK */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <MacroBar label="Carboidratos" value={summary.averages.carbs} target={targets.minCarbs} unit="g" />
                    <MacroBar label="Proteínas" value={summary.averages.protein} target={targets.minProtein} unit="g" />
                    <MacroBar label="Lipídios" value={summary.averages.fats} target={targets.minFats} unit="g" />
                </div>
            </div>

            {/* 2. MICRONUTRIENTS GRID */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-3 gap-2">
                <MicroBox label="Ferro" value={summary.averages.iron} target={3} unit="mg" />
                <MicroBox label="Cálcio" value={summary.averages.calcium} target={300} unit="mg" />
                <MicroBox label="Vit. A" value={summary.averages.vitA} target={200} unit="ug" />
            </div>

            {/* 3. QUALITY METRICS (PNAE) */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase">Metas de Qualidade (PNAE)</h4>

                {/* Agricultura Familiar */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${summary.quality.familyAgriculturePercent >= 30 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {summary.quality.familyAgriculturePercent.toFixed(0)}%
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase text-slate-700">Agricultura Familiar</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(summary.quality.familyAgriculturePercent, 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Ultraprocessados Warning */}
                {summary.quality.ultraProcessedCount > 0 && (
                    <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-xl">🚫</span>
                        <div>
                            <p className="text-[10px] font-black uppercase text-red-600">Alerta de Ultraprocessados</p>
                            <p className="text-[9px] text-red-400">{summary.quality.ultraProcessedCount} itens proibidos detectados.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. FINANCIAL */}
            <div className="mt-auto bg-slate-800 text-white p-4 rounded-xl shadow-lg">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Custo Estimado (Por Aluno)</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-2xl font-black">R$ {summary.financial.costPerStudentDay.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400">/ dia</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">R$ {summary.financial.costPerStudentMonth.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400">/ mês (estimado)</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

// MINI COMPONENTS
const MacroBar = ({ label, value, target, unit }: any) => (
    <div className="mb-1">
        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 mb-0.5">
            <span>{label}</span>
            <span>{value.toFixed(1)}/{target.toFixed(1)}{unit}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full">
            <div className={`h-full rounded-full ${value >= target ? 'bg-emerald-500' : 'bg-orange-400'}`} style={{ width: `${Math.min((value / target) * 100, 100)}%` }}></div>
        </div>
    </div>
);

const MicroBox = ({ label, value, target, unit }: any) => (
    <div className="text-center">
        <p className={`text-sm font-black ${value >= target ? 'text-emerald-600' : 'text-orange-400'}`}>{value.toFixed(0)}<span className="text-[9px]">{unit}</span></p>
        <p className="text-[8px] font-bold uppercase text-slate-400">{label}</p>
    </div>
);
