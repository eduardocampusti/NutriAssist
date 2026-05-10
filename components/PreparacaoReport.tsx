import React from 'react';
import ReactDOM from 'react-dom';
import { OfficialLetterhead } from './OfficialLetterhead';
import { FNDEPreparacao } from '../services/fndePreparacaoService';
import { usePNAE } from '../contexts/PNAEContext';
import { Zap, ArrowLeft, Printer } from 'lucide-react';

interface PreparacaoReportProps {
    preparacao: FNDEPreparacao;
    onClose: () => void;
}

// Returns the best value: FNDE field if non-zero, otherwise TACO fallback.
function resolveComp(ing: any) {
    const fnde = ing?.alimento?.composicao?.[0] ?? ing?.alimento?.fnde_composicao_nutricional?.[0] ?? null;
    const taco = ing?.alimento?.taco_composicao?.[0] ?? null;
    if (!fnde && !taco) return null;

    const f = fnde || {};
    const t = taco || {};

    // Pick FNDE value when non-zero, fall back to TACO
    const pick = (fndeVal: any, tacoVal: any): number => {
        const v = parseFloat(fndeVal ?? 0);
        return v !== 0 ? v : parseFloat(tacoVal ?? 0);
    };

    return {
        energia_kcal:       pick(f.energia_kcal   ?? f.energia,        t.energia_kcal),
        proteinas_g:        pick(f.proteinas_g    ?? f.proteina_g ?? f.proteina,  t.proteinas_g),
        lipidios_g:         pick(f.lipidios_g     ?? f.lipideos_g ?? f.lipideos, t.lipidios_g),
        carboidratos_g:     pick(f.carboidratos_g ?? f.carboidrato_g ?? f.carboidratos, t.carboidratos_g),
        calcio_mg:          pick(f.calcio_mg      ?? f.calcio,         t.calcio_mg),
        ferro_mg:           pick(f.ferro_mg       ?? f.ferro,          t.ferro_mg),
        vitamina_a_mcg:     pick(f.vitamina_a_mcg ?? f.retinol_mcg ?? f.retinol, t.vitamina_a_mcg),
        vitamina_c_mg:      pick(f.vitamina_c_mg  ?? f.vitamina_c,     t.vitamina_c_mg),
        sodio_mg:           pick(f.sodio_mg       ?? f.sodio,          t.sodio_mg),
        fibras_g:           pick(f.fibras_g       ?? f.fibra_g ?? f.fibra, t.fibras_g),
        magnesio_mg:        pick(f.magnesio_mg    ?? f.magnesio,       t.magnesio_mg),
        zinco_mg:           pick(f.zinco_mg       ?? f.zinco,          t.zinco_mg),
        gordura_saturada_g: pick(f.gordura_saturada_g ?? f.lipideos_saturados_g, t.gordura_saturada_g),
        gordura_trans_mg:   pick(f.gordura_trans_mg   ?? f.gordura_trans,        t.gordura_trans_g),
    };
}

function calcRow(ing: any) {
    const comp = resolveComp(ing);
    const pl = Number(ing.per_capita_liquido || ing.quantidade_per_capita) || 0;
    const pb = Number(ing.per_capita_bruto) || pl;
    const fc = Number(ing.fator_correcao) || 1.0;
    const calc = (val: number) => isNaN(val) ? 0 : (val * pl) / 100;
    if (!comp) return { pl, fc, pb, energia_kcal: 0, proteinas_g: 0, lipidios_g: 0, carboidratos_g: 0, calcio_mg: 0, ferro_mg: 0, vitamina_a_mcg: 0, vitamina_c_mg: 0, sodio_mg: 0, fibras_g: 0, magnesio_mg: 0, zinco_mg: 0, gordura_saturada_g: 0, gordura_trans_mg: 0 };
    return { pl, fc, pb, energia_kcal: calc(comp.energia_kcal), proteinas_g: calc(comp.proteinas_g), lipidios_g: calc(comp.lipidios_g), carboidratos_g: calc(comp.carboidratos_g), calcio_mg: calc(comp.calcio_mg), ferro_mg: calc(comp.ferro_mg), vitamina_a_mcg: calc(comp.vitamina_a_mcg), vitamina_c_mg: calc(comp.vitamina_c_mg), sodio_mg: calc(comp.sodio_mg), fibras_g: calc(comp.fibras_g), magnesio_mg: calc(comp.magnesio_mg), zinco_mg: calc(comp.zinco_mg), gordura_saturada_g: calc(comp.gordura_saturada_g), gordura_trans_mg: calc(comp.gordura_trans_mg) };
}

const fmt = (v: number, d = 2) => Number(v || 0).toFixed(d).replace('.', ',');

const PreparacaoReport: React.FC<PreparacaoReportProps> = ({ preparacao, onClose }) => {
    const { letterhead } = usePNAE();
    const isCreche = preparacao.categoria_cardapio === 'CRECHE';
    const themeColor = isCreche ? 'bg-orange-600' : 'bg-emerald-600';

    const nutrientRows = React.useMemo(() =>
        (preparacao.ingredientes || []).map(ing => ({ ing, ...calcRow(ing) })),
        [preparacao.ingredientes]
    );

    const totais = React.useMemo(() =>
        nutrientRows.reduce((acc, r) => ({
            energia_kcal: acc.energia_kcal + r.energia_kcal,
            proteinas_g: acc.proteinas_g + r.proteinas_g,
            lipidios_g: acc.lipidios_g + r.lipidios_g,
            carboidratos_g: acc.carboidratos_g + r.carboidratos_g,
            calcio_mg: acc.calcio_mg + r.calcio_mg,
            ferro_mg: acc.ferro_mg + r.ferro_mg,
            vitamina_a_mcg: acc.vitamina_a_mcg + r.vitamina_a_mcg,
            vitamina_c_mg: acc.vitamina_c_mg + r.vitamina_c_mg,
            sodio_mg: acc.sodio_mg + r.sodio_mg,
            fibras_g: acc.fibras_g + r.fibras_g,
            magnesio_mg: acc.magnesio_mg + r.magnesio_mg,
            zinco_mg: acc.zinco_mg + r.zinco_mg,
            gordura_saturada_g: acc.gordura_saturada_g + r.gordura_saturada_g,
            gordura_trans_mg: acc.gordura_trans_mg + r.gordura_trans_mg,
        }), { energia_kcal: 0, proteinas_g: 0, lipidios_g: 0, carboidratos_g: 0, calcio_mg: 0, ferro_mg: 0, vitamina_a_mcg: 0, vitamina_c_mg: 0, sodio_mg: 0, fibras_g: 0, magnesio_mg: 0, zinco_mg: 0, gordura_saturada_g: 0, gordura_trans_mg: 0 }),
        [nutrientRows]
    );

    const cellCls = (v: number, isTotal = false) => [
        'p-1 border-r border-slate-300 text-center tabular-nums',
        isTotal ? 'border-slate-500 font-black text-slate-950' : '',
        (v || 0) === 0 ? 'text-slate-300' : 'text-slate-900 font-bold',
    ].join(' ');

    return ReactDOM.createPortal(
        <div id="preparacao-report-root" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99999] overflow-y-auto print:p-0 print:overflow-visible">
            <style>{`
                @media print {
                    @page { margin: 0.5cm; size: A4 portrait; }
                    body > * { display: none !important; }
                    body > #preparacao-report-root { display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: white !important; z-index: 99999 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #preparacao-report-content { width: 100% !important; max-width: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; border-radius: 0 !important; zoom: 0.70 !important; }
                }
            `}</style>
            <div className="min-h-full flex items-center justify-center p-4 print:p-0 print:block">
                <div id="preparacao-report-content" className="bg-white w-full max-w-5xl p-8 shadow-2xl rounded-xl relative overflow-hidden flex flex-col print:rounded-none">
                    <div className="flex justify-between mb-8 print:hidden sticky top-0 bg-white/90 backdrop-blur pt-4 pb-4 z-10 border-b border-slate-100">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2">
                            <ArrowLeft size={18} /> Voltar
                        </button>
                        <button onClick={() => window.print()} className={`px-6 py-2 ${themeColor} text-white font-bold rounded-lg hover:brightness-90 shadow-lg flex items-center gap-2`}>
                            <Printer size={18} /> Gerar Relatório PNAE
                        </button>
                    </div>
                    <div className="space-y-6 flex-1">
                        <OfficialLetterhead config={letterhead} title="PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR - PNAE" showDate={true} />
                        <div className={`${themeColor} text-white p-4 rounded-xl flex flex-wrap justify-between items-center gap-4 shadow-sm`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg print:hidden"><Zap size={20} className="fill-current" /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Modalidade Oficial</p>
                                    <h4 className="text-sm font-black uppercase tracking-tight">FICHA TÉCNICA DE PREPARAÇÕES DO {preparacao.categoria_cardapio === 'CRECHE' ? 'CARDÁPIO - CRECHE' : `CARDÁPIO - ${preparacao.etapa_ensino || 'ENSINO'}`}</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div><p className="text-[9px] font-black uppercase tracking-widest opacity-80">Modalidade</p><p className="text-[11px] font-black uppercase">{preparacao.modalidade_ensino || 'GERAL'}</p></div>
                                <div><p className="text-[9px] font-black uppercase tracking-widest opacity-80">Faixa Etária</p><p className="text-[11px] font-black uppercase">{preparacao.faixa_etaria || 'DA ETAPA DE ENSINO CORRESPONDENTE'}</p></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 border-2 border-slate-900 rounded-xl overflow-hidden divide-x-2 divide-slate-900">
                            <div className="col-span-3 p-4 bg-slate-50"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">NOME DE PREPARAÇÃO:</label><h3 className="text-lg font-black text-slate-900 uppercase leading-none">{preparacao.nome}</h3></div>
                            <div className="p-4 bg-slate-50"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">RENDIMENTO:</label><div className="text-lg font-black text-slate-900 leading-none">{preparacao.rendimento_porcoes} {preparacao.rendimento_porcoes === 1 ? 'PORÇÃO' : 'PORÇÕES'}</div></div>
                        </div>
                        <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-[7.5px] border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-200/90 text-slate-900 border-b-2 border-slate-600 font-black uppercase">
                                        <th className="p-2 border-r border-slate-400 text-left w-[18%] bg-slate-300/80">INGREDIENTES</th>
                                        <th className="p-1 border-r border-slate-400 text-center">PB (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">PL (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">FC</th>
                                        <th className="p-1 border-r border-slate-400 text-center bg-slate-300/80">ENERGIA (Kcal)</th>
                                        <th className="p-1 border-r border-slate-400 text-center bg-slate-300/60">PTN (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center bg-slate-300/60">LPD (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Sat. (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center bg-slate-300/60">CHO (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Fibra (g)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Ca (mg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Mg (mg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Fe (mg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Zn (mg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Vit. A (mcg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Vit. C (mg)</th>
                                        <th className="p-1 border-r border-slate-400 text-center">Na (mg)</th>
                                        <th className="p-1 text-center">Trans (mg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300">
                                    {nutrientRows.map(({ ing, pl, fc, pb, ...r }, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                            <td className="p-1.5 border-r border-slate-300 font-bold text-slate-800 uppercase truncate">{ing.alimento?.nome}</td>
                                            <td className="p-1 border-r border-slate-300 text-center font-medium text-slate-600">{fmt(pb)}</td>
                                            <td className="p-1 border-r border-slate-300 text-center font-bold text-slate-900">{fmt(pl)}</td>
                                            <td className={`p-1 border-r border-slate-300 text-center tabular-nums ${fc === 1 ? 'text-slate-300' : 'text-slate-900 font-bold'}`}>{fmt(fc)}</td>
                                            <td className={cellCls(r.energia_kcal)}>{fmt(r.energia_kcal)}</td>
                                            <td className={cellCls(r.proteinas_g)}>{fmt(r.proteinas_g)}</td>
                                            <td className={cellCls(r.lipidios_g)}>{fmt(r.lipidios_g)}</td>
                                            <td className={cellCls(r.gordura_saturada_g)}>{fmt(r.gordura_saturada_g)}</td>
                                            <td className={cellCls(r.carboidratos_g)}>{fmt(r.carboidratos_g)}</td>
                                            <td className={cellCls(r.fibras_g)}>{fmt(r.fibras_g)}</td>
                                            <td className={cellCls(r.calcio_mg)}>{fmt(r.calcio_mg)}</td>
                                            <td className={cellCls(r.magnesio_mg)}>{fmt(r.magnesio_mg)}</td>
                                            <td className={cellCls(r.ferro_mg)}>{fmt(r.ferro_mg)}</td>
                                            <td className={cellCls(r.zinco_mg)}>{fmt(r.zinco_mg)}</td>
                                            <td className={cellCls(r.vitamina_a_mcg)}>{fmt(r.vitamina_a_mcg, 1)}</td>
                                            <td className={cellCls(r.vitamina_c_mg)}>{fmt(r.vitamina_c_mg, 1)}</td>
                                            <td className={cellCls(r.sodio_mg)}>{fmt(r.sodio_mg)}</td>
                                            <td className={`p-1 text-center tabular-nums ${(r.gordura_trans_mg || 0) === 0 ? 'text-slate-300' : 'text-slate-900 font-bold'}`}>{fmt(r.gordura_trans_mg)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-300/90 text-slate-900 font-extrabold border-t-[3px] border-slate-900">
                                        <td className="p-2 border-r border-slate-500 text-right uppercase text-[9px]">TOTAL ACUMULADO</td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className={cellCls(totais.energia_kcal, true)}>{fmt(totais.energia_kcal)}</td>
                                        <td className={cellCls(totais.proteinas_g, true)}>{fmt(totais.proteinas_g)}</td>
                                        <td className={cellCls(totais.lipidios_g, true)}>{fmt(totais.lipidios_g)}</td>
                                        <td className={cellCls(totais.gordura_saturada_g, true)}>{fmt(totais.gordura_saturada_g)}</td>
                                        <td className={cellCls(totais.carboidratos_g, true)}>{fmt(totais.carboidratos_g)}</td>
                                        <td className={cellCls(totais.fibras_g, true)}>{fmt(totais.fibras_g)}</td>
                                        <td className={cellCls(totais.calcio_mg, true)}>{fmt(totais.calcio_mg)}</td>
                                        <td className={cellCls(totais.magnesio_mg, true)}>{fmt(totais.magnesio_mg)}</td>
                                        <td className={cellCls(totais.ferro_mg, true)}>{fmt(totais.ferro_mg)}</td>
                                        <td className={cellCls(totais.zinco_mg, true)}>{fmt(totais.zinco_mg)}</td>
                                        <td className={cellCls(totais.vitamina_a_mcg, true)}>{fmt(totais.vitamina_a_mcg, 1)}</td>
                                        <td className={cellCls(totais.vitamina_c_mg, true)}>{fmt(totais.vitamina_c_mg, 1)}</td>
                                        <td className={cellCls(totais.sodio_mg, true)}>{fmt(totais.sodio_mg)}</td>
                                        <td className="p-1 text-center tabular-nums font-black text-slate-950">{fmt(totais.gordura_trans_mg)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-4">
                            <div className="md:col-span-7 space-y-4">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3"><span className="w-8 h-px bg-slate-900"></span> MODO DE PREPARO TÉCNICO</h4>
                                <div className="text-[10px] text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    {preparacao.modo_preparo ? (
                                        <div className="space-y-3">
                                            {preparacao.modo_preparo.split('\n').filter(l => l.trim()).map((line, i) => (
                                                <p key={i} className="flex gap-4">
                                                    <span className="font-black text-slate-400 shrink-0 w-4 italic">{String(i + 1).padStart(2, '0')}</span>
                                                    <span className="border-l border-slate-200 pl-4">{line.trim().replace(/^\d+\.|^\d+\)/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '')}</span>
                                                </p>
                                            ))}
                                        </div>
                                    ) : <p className="italic text-slate-400">Procedimento operacional não detalhado.</p>}
                                </div>
                            </div>
                            <div className="md:col-span-5 space-y-4">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 justify-end">ILUSTRAÇÃO DA RECEITA <span className="w-8 h-px bg-slate-900"></span></h4>
                                <div className="rounded-[40px] overflow-hidden border-[6px] border-white shadow-2xl aspect-square bg-slate-100 flex items-center justify-center transform rotate-1 print:transform-none print:rounded-lg">
                                    {preparacao.imagem_url ? <img src={preparacao.imagem_url} alt={preparacao.nome} className="w-full h-full object-cover" /> : <div className="text-center p-8 opacity-20"><p className="text-[9px] font-black uppercase tracking-widest mt-2">Sem Imagem</p></div>}
                                </div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic text-right pr-4">* Imagem ilustrativa</p>
                            </div>
                        </div>
                        <div className="mt-auto pt-16 border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-16">
                                <div className="text-center"><div className="w-full h-px bg-slate-900 mb-2"></div><p className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Responsável Técnico</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">RT / NUTRICIONISTA</p></div>
                                <div className="text-center"><div className="w-full h-px bg-slate-900 mb-2"></div><p className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Coordenador de Unidade</p><p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">PNAE / SEDUC</p></div>
                            </div>
                            <div className="mt-12 text-center">
                                <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">SISTEMA BROTAR • ASSISTÊNCIA TÉCNICA À ALIMENTAÇÃO ESCOLAR</p>
                                <p className="text-[6px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">PROTOCOLO DE SEGURANÇA ALIMENTAR E NUTRICIONAL • BROTAS DE MACAÚBAS/BA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PreparacaoReport;
