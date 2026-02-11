
import React from 'react';
import { MenuPlan, School, Dish, InventoryItem, EducationalStage } from '../types';

interface MenuReportProps {
    plan: MenuPlan;
    school?: School;
    inventory: InventoryItem[];
    onClose: () => void;
}

import { calculateNutritionalSummary, calculateNutritionalTargets } from '../services/menuEngine';
import { usePNAE } from '../contexts/PNAEContext';
import { OfficialLetterhead } from './OfficialLetterhead';

// ... (Interface remains same)

const MenuReport: React.FC<MenuReportProps> = ({ plan, school, inventory, onClose }) => {
    const { letterhead } = usePNAE();

    const handlePrint = () => {
        window.print();
    };

    const dias = [1, 2, 3, 4, 5];
    const nomesDias = ["SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA"];

    // CALCULATE REAL STATS
    const summary = calculateNutritionalSummary(plan, inventory);
    const targets = calculateNutritionalTargets(plan.etapa as EducationalStage || EducationalStage.FUNDAMENTAL_I);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="min-h-full flex items-center justify-center p-4 print:p-0 print:block">
                <div className="bg-white w-full max-w-5xl min-h-[297mm] p-12 shadow-2xl rounded-xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:min-h-[29.7cm] print:p-0 overflow-hidden flex flex-col">

                    {/* WATERMARK FOR DRAFT/UNAPPROVED */}
                    {plan.status !== 'APROVADO' && (
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none overflow-hidden">
                            <div className="transform -rotate-45 text-slate-900 text-[120px] font-black uppercase whitespace-nowrap border-8 border-slate-900 p-12 rounded-3xl">
                                RASCUNHO <br /> SEM VALOR
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-between mb-8 print:hidden sticky top-0 bg-white/90 backdrop-blur pt-4 pb-4 z-10 border-b border-slate-100">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">
                            ← Voltar
                        </button>
                        <button onClick={handlePrint} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black shadow-lg flex items-center gap-2">
                            🖨️ Imprimir / Salvar PDF
                        </button>
                    </div>

                    {/* REPORT CONTENT */}
                    <div className="space-y-6 print:flex-1 print:flex print:flex-col print:p-[1.5cm] print:space-y-8">
                        <div className="print:flex-1">
                            {/* OFFICIAL HEADER (LETTERHEAD) */}
                            <OfficialLetterhead
                                config={letterhead}
                                title="Cardápio de Alimentação Escolar"
                                className="mb-8"
                                showDate={false}
                            />

                            <div className="flex justify-center gap-8 mt-6 text-[10px] font-bold uppercase text-slate-600 bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
                                <span>📅 Ciclo: {plan.titulo}</span>
                                <span>🎓 Etapa: {plan.etapa?.replace(/_/g, ' ')}</span>
                                <span>🏫 Unidade: {school?.nome || 'REDE GERAL MUNICIPAL'}</span>
                                <span>👥 Alunos: {plan.numAlunos}</span>
                            </div>

                            {/* MENU GRID */}
                            <div className="grid grid-cols-5 gap-0 border border-slate-300 divide-x divide-slate-300 break-inside-avoid mt-8">
                                {/* ... rest of grid ... */}
                                {nomesDias.map(d => (
                                    <div key={d} className="bg-slate-100 p-3 text-center text-xs font-black uppercase text-slate-700 border-b border-slate-300">
                                        {d}
                                    </div>
                                ))}

                                {dias.map(dayNum => {
                                    const dishes = plan.preparacoes.filter(p => p.diaSemana === dayNum);
                                    return (
                                        <div key={dayNum} className="p-4 min-h-[150px] space-y-4">
                                            {dishes.length === 0 ? (
                                                <div className="text-center text-slate-300 italic text-[10px] mt-4">Sem planejamento</div>
                                            ) : (
                                                dishes.map(dish => (
                                                    <div key={dish.id} className="text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{dish.mealType}</p>
                                                        <p className="text-sm font-black text-slate-800 uppercase leading-tight mb-2">{dish.nome}</p>
                                                        <div className="text-[9px] text-slate-500 leading-snug mt-2 flex flex-col gap-1">
                                                            {dish.ingredientes.map((ing, i) => {
                                                                const item = inventory.find(inv => inv.id === ing.itemId);
                                                                return (
                                                                    <div key={i} className="flex items-center justify-center gap-1 border-b border-dotted border-slate-200 last:border-0 pb-1">
                                                                        <span>{item?.nome}</span>
                                                                        <span className="font-bold text-slate-600 bg-slate-50 px-1 rounded">
                                                                            {ing.perCapitaGrams}g
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* TECHNICAL ANALYSIS TABLE */}
                            <div className="mt-8 break-inside-avoid">
                                <h4 className="text-sm font-black uppercase text-slate-800 border-b border-slate-200 pb-2 mb-4">Ficha Técnica Nutricional</h4>
                                <table className="w-full text-[10px] border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 uppercase font-black">
                                            <th className="border p-2 text-left">Preparação</th>
                                            <th className="border p-2 text-center">PB (g)</th>
                                            <th className="border p-2 text-center">PL (g)</th>
                                            <th className="border p-2 text-center">FC</th>
                                            <th className="border p-2 text-center bg-slate-200">Kcal</th>
                                            <th className="border p-2 text-center">PTN (g)</th>
                                            <th className="border p-2 text-center">LPD (g)</th>
                                            <th className="border p-2 text-center">Sat. (g)</th>
                                            <th className="border p-2 text-center">CHO (g)</th>
                                            <th className="border p-2 text-center">Fibra (g)</th>
                                            <th className="border p-2 text-center">Ca (mg)</th>
                                            <th className="border p-2 text-center">Mg (mg)</th>
                                            <th className="border p-2 text-center">Fe (mg)</th>
                                            <th className="border p-2 text-center">Zn (mg)</th>
                                            <th className="border p-2 text-center text-[8px]">Vit. A (mcg)</th>
                                            <th className="border p-2 text-center text-[8px]">Vit. C (mg)</th>
                                            <th className="border p-2 text-center">Na (mg)</th>
                                            <th className="border p-2 text-center">Trans (mg)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.preparacoes.map(dish => {
                                            let dKcal = 0, dPtn = 0, dCho = 0, dLip = 0, dFib = 0, dSod = 0, dCa = 0, dFe = 0;
                                            let dSat = 0, dMg = 0, dZn = 0, dVa = 0, dVc = 0, dTrans = 0;
                                            let totalPB = 0, totalPL = 0;

                                            dish.ingredientes.forEach(ing => {
                                                let item = inventory.find(i => i.id === ing.itemId);
                                                const f = ing.perCapitaGrams / 100;
                                                const fc = item?.correctionFactor || 1.0;

                                                totalPL += ing.perCapitaGrams;
                                                totalPB += ing.perCapitaGrams * fc;

                                                dKcal += (item?.kcal || 0) * f;
                                                dPtn += (item?.protein || 0) * f;
                                                dCho += (item?.carbs || 0) * f;
                                                dLip += (item?.fats || 0) * f;
                                                dFib += (item?.fiber || 0) * f;
                                                dSod += (item?.sodium || 0) * f;
                                                dCa += (item?.calcium || 0) * f;
                                                dFe += (item?.iron || 0) * f;
                                                // @ts-ignore
                                                dSat += (item?.gordura_saturada_g || 0) * f;
                                                // @ts-ignore
                                                dMg += (item?.magnesio_mg || 0) * f;
                                                // @ts-ignore
                                                dZn += (item?.zinco_mg || 0) * f;
                                                // @ts-ignore
                                                dVa += (item?.vitamina_a_mcg || 0) * f;
                                                // @ts-ignore
                                                dVc += (item?.vitamina_c_mg || 0) * f;
                                                // @ts-ignore
                                                dTrans += (item?.gordura_trans_mg || 0) * f;
                                            });

                                            return (
                                                <tr key={dish.id} className="text-center font-mono">
                                                    <td className="border p-2 font-bold text-left font-sans">{dish.nome}</td>
                                                    <td className="border p-1">{totalPB.toFixed(1)}</td>
                                                    <td className="border p-1">{totalPL.toFixed(1)}</td>
                                                    <td className="border p-1 text-[8px]">{(totalPB / (totalPL || 1)).toFixed(2)}</td>
                                                    <td className="border p-1 font-black bg-slate-50">{dKcal.toFixed(0)}</td>
                                                    <td className="border p-1">{dPtn.toFixed(1)}</td>
                                                    <td className="border p-1">{dLip.toFixed(1)}</td>
                                                    <td className="border p-1">{dSat.toFixed(1)}</td>
                                                    <td className="border p-1">{dCho.toFixed(1)}</td>
                                                    <td className="border p-1">{dFib.toFixed(1)}</td>
                                                    <td className="border p-1">{dCa.toFixed(1)}</td>
                                                    <td className="border p-1">{dMg.toFixed(1)}</td>
                                                    <td className="border p-1">{dFe.toFixed(2)}</td>
                                                    <td className="border p-1">{dZn.toFixed(2)}</td>
                                                    <td className="border p-1">{dVa.toFixed(1)}</td>
                                                    <td className="border p-1">{dVc.toFixed(1)}</td>
                                                    <td className="border p-1">{Math.round(dSod)}</td>
                                                    <td className="border p-1">{dTrans.toFixed(1)}</td>
                                                </tr>
                                            )
                                        })}
                                        <tr className="bg-slate-800 text-white font-bold uppercase text-[9px]">
                                            <td className="border p-2 text-right" colSpan={4}>Média Diária Planejada</td>
                                            <td className="border p-2 text-center bg-slate-700">{summary.averages.kcal.toFixed(0)}</td>
                                            <td className="border p-2 text-center">{summary.averages.protein.toFixed(1)}g</td>
                                            <td className="border p-2 text-center">{summary.averages.fats.toFixed(1)}g</td>
                                            <td className="border p-2 text-center">--</td>
                                            <td className="border p-2 text-center">{summary.averages.carbs.toFixed(1)}g</td>
                                            <td className="border p-2 text-center">{summary.averages.fiber.toFixed(1)}g</td>
                                            <td className="border p-2 text-center">{summary.averages.calcium.toFixed(1)}mg</td>
                                            <td className="border p-2 text-center">--</td>
                                            <td className="border p-2 text-center">{summary.averages.iron.toFixed(2)}mg</td>
                                            <td className="border p-2 text-center">--</td>
                                            <td className="border p-2 text-center">{summary.averages.vitA.toFixed(1)}mcg</td>
                                            <td className="border p-2 text-center">--</td>
                                            <td className="border p-2 text-center">{Math.round(summary.averages.sodium)}mg</td>
                                            <td className="border p-2 text-center">--</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* COMPLIANCE SECTION */}
                            <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200 break-inside-avoid">
                                <h4 className="text-sm font-black uppercase text-slate-800 border-b border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                    <span>⚖️</span> Parecer Técnico de Conformidade (PNAE/FNDE)
                                </h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status Normativo</p>
                                        <div className="flex gap-2 mb-4">
                                            {summary.quality.ultraProcessedCount === 0 ? <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase">✅ 100% Conforme</span> : <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase">⚠️ Com Restrições</span>}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Indicadores de Qualidade</p>
                                        <ul className="text-[10px] text-slate-700 space-y-1">
                                            <li>• Ultraprocessados: <strong>{summary.quality.ultraProcessedCount}</strong> (Limite: 2)</li>
                                            <li>• Agricultura Familiar (Est.): <strong>{summary.quality.familyAgriculturePercent.toFixed(0)}%</strong> (Meta: 30%)</li>
                                        </ul>
                                    </div>
                                    <div className="border-l border-slate-200 pl-8">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Justificativa Técnica</p>
                                        <div className="text-[10px] text-slate-700 italic bg-white p-3 rounded border border-slate-100">
                                            {plan.justificativaTecnica || "Nenhuma observação técnica registrada."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIGNATURES & FOOTER - Fixed at bottom for Print */}
                        <div className="mt-auto pt-8 print:fixed print:bottom-0 print:left-0 print:w-full print:px-12 print:pb-8 bg-white">
                            <div className="grid grid-cols-3 gap-8 pt-4 border-t border-dotted border-slate-300 break-inside-avoid">
                                <div className="text-center font-bold">
                                    <div className="border-t border-slate-900 w-full mb-2"></div>
                                    <p className="text-[10px] uppercase">Nutricionista RT</p>
                                    <p className="text-[8px] text-slate-400 uppercase">Validação Técnica</p>
                                </div>
                                <div className="text-center font-black">
                                    <div className="border-t border-slate-900 w-full mb-2"></div>
                                    <p className="text-[10px] uppercase">Secretária de Educação</p>
                                    <p className="text-[8px] text-slate-400 uppercase">Homologação SME</p>
                                </div>
                                <div className="text-center font-bold">
                                    <div className="border-t border-slate-900 w-full mb-2"></div>
                                    <p className="text-[10px] uppercase">Direção Escolar</p>
                                    <p className="text-[8px] text-slate-400 uppercase">Visto / Unidade</p>
                                </div>
                            </div>
                            <OfficialLetterhead
                                config={letterhead}
                                type="footer"
                                className="mt-8 opacity-80"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MenuReport;
