import React, { useEffect, useState } from 'react';
import { MenuPlan, InventoryItem } from '../../types';
import { validateMenuCompliance } from '../../services/menuEngine';

interface Step3Props {
    plan: MenuPlan;
    inventory: InventoryItem[];
    onChange: (updates: Partial<MenuPlan>) => void;
    onValidationChange: (isValid: boolean) => void;
}

export const Step3_Review: React.FC<Step3Props> = ({ plan, inventory, onChange, onValidationChange }) => {

    const [compliance, setCompliance] = useState<any>(null);

    useEffect(() => {
        // Run Validation
        const result = validateMenuCompliance(plan, inventory, plan.numAlunos, plan.etapa);
        setCompliance(result);

        // Gatekeeper Logic
        const hasBlocks = result.blockingViolations && result.blockingViolations.length > 0;
        const hasWarnings = result.warnings && result.warnings.length > 0;
        const missingJustification = hasWarnings && !plan.justificativaTecnica;

        const isValid = !hasBlocks && !missingJustification;
        onValidationChange(isValid);

    }, [plan, inventory, onValidationChange]);

    if (!compliance) return <div className="p-8 text-center text-slate-400">Validando cardápio...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

            {/* HEADER SUMMARY */}
            <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-lg flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-black uppercase">Revisão Técnica</h3>
                    <p className="text-xs text-slate-400">Resumo de Conformidade PNAE</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black">{compliance.stats.totalKcal.toFixed(0)} <span className="text-sm font-normal text-slate-400">kcal/dia</span></p>
                    <p className="text-xs text-emerald-400 font-bold">Custo: R$ {compliance.stats.totalCost.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ALERTS PANEL */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-[300px]">
                    <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
                        <span>🛡️</span> Auditoria Automática
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {compliance.blockingViolations?.map((v: string, i: number) => (
                            <div key={`b-${i}`} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3">
                                <span className="text-lg">⛔</span>
                                <div>
                                    <h4 className="text-[10px] font-black text-rose-800 uppercase tracking-wide">Bloqueio Normativo</h4>
                                    <p className="text-xs font-bold text-rose-700 leading-snug">{v}</p>
                                </div>
                            </div>
                        ))}
                        {compliance.warnings?.map((w: string, i: number) => (
                            <div key={`w-${i}`} className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wide">Restrição Identificada</h4>
                                    <p className="text-xs font-bold text-amber-700 leading-snug">{w}</p>
                                </div>
                            </div>
                        ))}
                        {(!compliance.blockingViolations?.length && !compliance.warnings?.length) && (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100 p-6 animate-in zoom-in duration-300">
                                <span className="text-4xl mb-2">✅</span>
                                <p className="text-sm font-black uppercase">Cardápio Conforme!</p>
                                <p className="text-[10px]">Nenhuma violação detectada.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* JUSTIFICATION FIELD */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-[300px]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-black text-slate-800 uppercase">Justificativa Técnica</h3>
                        {(!compliance.warnings?.length) ?
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-full uppercase">Opcional</span> :
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase">Obrigatório</span>
                        }
                    </div>
                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                        Utilize este espaço para justificar o uso de alimentos restritos, substituições sazonais ou particularidades do atendimento, conforme Art. 14 da Resolução 06/2020.
                    </p>
                    <textarea
                        value={plan.justificativaTecnica || ''}
                        onChange={e => onChange({ justificativaTecnica: e.target.value })}
                        className={`flex-1 w-full bg-slate-50 border rounded-2xl p-4 text-xs font-medium focus:ring-2 outline-none resize-none transition-all ${(compliance.warnings?.length && !plan.justificativaTecnica)
                            ? 'border-amber-300 focus:ring-amber-200 bg-amber-50/30'
                            : 'border-slate-200 focus:ring-indigo-100'
                            }`}
                        placeholder="Descreva aqui as razões técnicas..."
                    />
                    {(compliance.warnings?.length > 0 && !plan.justificativaTecnica) && (
                        <p className="text-[10px] text-amber-600 font-bold mt-2 text-right">Preenchimento obrigatório para avançar.</p>
                    )}
                </div>

            </div>
        </div>
    );
};
