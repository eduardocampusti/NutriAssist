import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from './UI/Card';
import { OfficialLetterhead } from './OfficialLetterhead';
import { FNDEPreparacao } from '../services/fndePreparacaoService';
import { usePNAE } from '../contexts/PNAEContext';
import {
    Zap,
    Scale,
    Droplets,
    Wheat,
    Info,
    Printer,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';

interface PreparacaoReportProps {
    preparacao: FNDEPreparacao;
    onClose: () => void;
}

const PreparacaoReport: React.FC<PreparacaoReportProps> = ({ preparacao, onClose }) => {
    const { letterhead } = usePNAE();
    const isCreche = preparacao.categoria_cardapio === 'CRECHE';
    const themeColor = isCreche ? 'bg-orange-600' : 'bg-emerald-600';
    const themeBg = isCreche ? 'bg-orange-50' : 'bg-emerald-50';
    const themeText = isCreche ? 'text-orange-700' : 'text-emerald-700';
    const themeBorder = isCreche ? 'border-orange-200' : 'border-emerald-200';
    const formatDecimal = (value: number) => value.toFixed(2).replace('.', ',');
    const formatNutrient = (value: number) => Number(value || 0).toFixed(2).replace('.', ',');
    const getNutrientCellClass = (value: number, isTotal = false) => {
        const numericValue = Number(value || 0);

        if (numericValue === 0) {
            return isTotal ? "text-slate-400 font-medium" : "text-slate-300 font-normal";
        }

        return isTotal ? "text-slate-950 font-black" : "text-slate-900 font-bold";
    };

    const nutrientCellClass = (value: number, isTotal = false, isPrimary = false) => [
        "p-1 border-r text-center tabular-nums",
        isTotal ? "border-slate-500" : "border-slate-300",
        isPrimary ? (isTotal ? "bg-slate-300/90" : "bg-slate-100/70") : "",
        getNutrientCellClass(value, isTotal)
    ].filter(Boolean).join(" ");

    const nutrientRows = React.useMemo(() => {
        return (preparacao.ingredientes || []).map((ing) => {
            const comp = (ing.alimento as any)?.composicao?.[0] || (ing.alimento as any)?.fnde_composicao_nutricional?.[0];
            const calculate = (val: any) => {
                const num = parseFloat(val);
                if (isNaN(num)) return 0;
                return (num * ing.quantidade_per_capita) / 100;
            };

            return {
                ingrediente: ing,
                energia_kcal: calculate(comp?.energia_kcal),
                proteinas_g: calculate(comp?.proteinas_g),
                lipidios_g: calculate(comp?.lipidios_g),
                gordura_saturada_g: calculate(comp?.gordura_saturada_g),
                carboidratos_g: calculate(comp?.carboidratos_g),
                fibras_g: calculate(comp?.fibras_g),
                calcio_mg: calculate(comp?.calcio_mg),
                magnesio_mg: calculate(comp?.magnesio_mg),
                ferro_mg: calculate(comp?.ferro_mg),
                zinco_mg: calculate(comp?.zinco_mg),
                vitamina_a_mcg: calculate(comp?.vitamina_a_mcg),
                vitamina_c_mg: calculate(comp?.vitamina_c_mg),
                sodio_mg: calculate(comp?.sodio_mg),
                gordura_trans_mg: calculate(comp?.gordura_trans_mg),
            };
        });
    }, [preparacao.ingredientes]);

    const totalNutrients = React.useMemo(() => {
        return nutrientRows.reduce((acc, row) => ({
            energia_kcal: acc.energia_kcal + row.energia_kcal,
            proteinas_g: acc.proteinas_g + row.proteinas_g,
            lipidios_g: acc.lipidios_g + row.lipidios_g,
            gordura_saturada_g: acc.gordura_saturada_g + row.gordura_saturada_g,
            carboidratos_g: acc.carboidratos_g + row.carboidratos_g,
            fibras_g: acc.fibras_g + row.fibras_g,
            calcio_mg: acc.calcio_mg + row.calcio_mg,
            magnesio_mg: acc.magnesio_mg + row.magnesio_mg,
            ferro_mg: acc.ferro_mg + row.ferro_mg,
            zinco_mg: acc.zinco_mg + row.zinco_mg,
            vitamina_a_mcg: acc.vitamina_a_mcg + row.vitamina_a_mcg,
            vitamina_c_mg: acc.vitamina_c_mg + row.vitamina_c_mg,
            sodio_mg: acc.sodio_mg + row.sodio_mg,
            gordura_trans_mg: acc.gordura_trans_mg + row.gordura_trans_mg,
        }), {
            energia_kcal: 0,
            proteinas_g: 0,
            lipidios_g: 0,
            gordura_saturada_g: 0,
            carboidratos_g: 0,
            fibras_g: 0,
            calcio_mg: 0,
            magnesio_mg: 0,
            ferro_mg: 0,
            zinco_mg: 0,
            vitamina_a_mcg: 0,
            vitamina_c_mg: 0,
            sodio_mg: 0,
            gordura_trans_mg: 0,
        });
    }, [nutrientRows]);

    const handlePrint = () => {
        window.print();
    };

    // PORTAL STRATEGY: Render directly to body to escape parent stacking contexts
    return ReactDOM.createPortal(
        <div id="preparacao-report-root" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99999] overflow-y-auto print:p-0 print:overflow-visible">

            <style>{`
                @media print {
                    @page { margin: 0.5cm; size: A4 portrait; }
                    
                    /* Hide everything in the body by default */
                    body > * { display: none !important; }
                    
                    /* EXCEPTION: Make the portal root visible */
                    body > #preparacao-report-root { 
                        display: block !important; 
                        position: absolute !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100% !important; 
                        height: 100% !important; 
                        background: white !important;
                        z-index: 99999 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Ensure content is visible and SCALED to fit */
                    #preparacao-report-content {
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        /* SCALE DOWN to fit on one page */
                        zoom: 0.70 !important; 
                    }

                    /* HARDCORE PRINT LAYOUT ENFORCEMENT */
                    #report-grid-container {
                        display: grid !important;
                        grid-template-columns: 7fr 5fr !important;
                        gap: 2rem !important;
                        align-items: start !important;
                        margin-top: 1rem !important;
                    }
                    
                    #report-text-column {
                        width: 100% !important;
                    }
                    
                    #report-image-column {
                        width: 100% !important;
                        margin-top: 0 !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

            <div className="min-h-full flex items-center justify-center p-4 print:p-0 print:block">
                <div id="preparacao-report-content" className="bg-white w-full max-w-5xl p-8 shadow-2xl rounded-xl relative overflow-hidden flex flex-col print:rounded-none">

                    {/* ACTIONS */}
                    <div className="flex justify-between mb-8 print:hidden sticky top-0 bg-white/90 backdrop-blur pt-4 pb-4 z-10 border-b border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>
                        <button
                            onClick={handlePrint}
                            className={`px-6 py-2 ${themeColor} text-white font-bold rounded-lg hover:brightness-90 shadow-lg flex items-center gap-2 transition-all`}
                        >
                            <Printer size={18} /> Gerar Relatório PNAE
                        </button>
                    </div>

                    {/* REPORT CONTENT */}
                    <div className="print:p-0 space-y-6 flex-1 print:overflow-visible">
                        <OfficialLetterhead
                            config={letterhead}
                            title="PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR - PNAE"
                            showDate={true}
                        />

                        {/* CLASSIFICAÇÃO HEADER */}
                        <div className={`${themeColor} text-white p-4 rounded-xl flex flex-wrap justify-between items-center gap-4 shadow-sm print:border print:border-slate-300 print:text-black print:bg-white`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg print:hidden">
                                    <Zap size={20} className="fill-current" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 print:text-slate-600">Modalidade Oficial</p>
                                    <h4 className="text-sm font-black uppercase tracking-tight print:text-black">
                                        FICHA TÉCNICA DE PREPARAÇÕES DO {preparacao.categoria_cardapio === 'CRECHE' ? 'CARDÁPIO - CRECHE' : `CARDÁPIO - ${preparacao.etapa_ensino}`}
                                    </h4>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-8">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 text-left print:text-slate-600">Modalidade</p>
                                    <p className="text-[11px] font-black uppercase text-left">{preparacao.modalidade_ensino || 'GERAL'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 text-left print:text-slate-600">Faixa Etária</p>
                                    <p className="text-[11px] font-black uppercase text-left">{preparacao.faixa_etaria || 'PNAE'}</p>
                                </div>
                            </div>
                        </div>

                        {/* NOME E RENDIMENTO */}
                        <div className="grid grid-cols-4 border-2 border-slate-900 rounded-xl overflow-hidden divide-x-2 divide-slate-900">
                            <div className="col-span-3 p-4 bg-slate-50 print:bg-white">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">NOME DE PREPARAÇÃO:</label>
                                <h3 className="text-lg font-black text-slate-900 uppercase leading-none">{preparacao.nome}</h3>
                            </div>
                            <div className="p-4 bg-slate-50 print:bg-white">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">RENDIMENTO:</label>
                                <div className="text-lg font-black text-slate-900 leading-none">
                                    {preparacao.rendimento_porcoes} {preparacao.rendimento_porcoes === 1 ? 'PORÇÃO' : 'PORÇÕES'}
                                </div>
                            </div>
                        </div>

                        {/* TABELA DE COMPOSIÇÃO - MODELO MARANHÃO REFINADO */}
                        <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-[7.5px] border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-200/90 text-slate-900 border-b-2 border-slate-600 font-black uppercase tracking-tight">
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
                                    {nutrientRows.map((row, idx) => {
                                        const { ingrediente: ing } = row;
                                        const fc = 1.0; // Fator de correção padrão (coluna não existe na base fnde_alimentos)
                                        const pb = ing.quantidade_per_capita * fc;

                                        return (
                                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} transition-colors`}>
                                                <td className="p-1.5 border-r border-slate-300 font-bold text-slate-800 uppercase truncate">{ing.alimento?.nome}</td>
                                                <td className="p-1 border-r border-slate-300 text-center font-medium text-slate-600">{formatDecimal(pb)}</td>
                                                <td className="p-1 border-r border-slate-300 text-center font-bold text-slate-900">{formatDecimal(ing.quantidade_per_capita)}</td>
                                                <td className="p-1 border-r border-slate-300 text-center text-slate-400 italic">{formatDecimal(fc)}</td>
                                                <td className={nutrientCellClass(row.energia_kcal, false, true)}>{formatNutrient(row.energia_kcal)}</td>
                                                <td className={nutrientCellClass(row.proteinas_g, false, true)}>{formatNutrient(row.proteinas_g)}</td>
                                                <td className={nutrientCellClass(row.lipidios_g, false, true)}>{formatNutrient(row.lipidios_g)}</td>
                                                <td className={nutrientCellClass(row.gordura_saturada_g)}>{formatNutrient(row.gordura_saturada_g)}</td>
                                                <td className={nutrientCellClass(row.carboidratos_g, false, true)}>{formatNutrient(row.carboidratos_g)}</td>
                                                <td className={nutrientCellClass(row.fibras_g)}>{formatNutrient(row.fibras_g)}</td>
                                                <td className={nutrientCellClass(row.calcio_mg)}>{formatNutrient(row.calcio_mg)}</td>
                                                <td className={nutrientCellClass(row.magnesio_mg)}>{formatNutrient(row.magnesio_mg)}</td>
                                                <td className={nutrientCellClass(row.ferro_mg)}>{formatNutrient(row.ferro_mg)}</td>
                                                <td className={nutrientCellClass(row.zinco_mg)}>{formatNutrient(row.zinco_mg)}</td>
                                                <td className={nutrientCellClass(row.vitamina_a_mcg)}>{formatNutrient(row.vitamina_a_mcg)}</td>
                                                <td className={nutrientCellClass(row.vitamina_c_mg)}>{formatNutrient(row.vitamina_c_mg)}</td>
                                                <td className={nutrientCellClass(row.sodio_mg)}>{formatNutrient(row.sodio_mg)}</td>
                                                <td className={`p-1 text-center tabular-nums ${getNutrientCellClass(row.gordura_trans_mg)}`}>{formatNutrient(row.gordura_trans_mg)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-300/90 text-slate-900 font-extrabold border-t-[3px] border-slate-900">
                                        <td className="p-2 border-r border-slate-500 text-right uppercase text-[9px]">TOTAL ACUMULADO</td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className="p-1 border-r border-slate-400"></td>
                                        <td className={nutrientCellClass(totalNutrients.energia_kcal, true, true)}>{formatNutrient(totalNutrients.energia_kcal)}</td>
                                        <td className={nutrientCellClass(totalNutrients.proteinas_g, true, true)}>{formatNutrient(totalNutrients.proteinas_g)}</td>
                                        <td className={nutrientCellClass(totalNutrients.lipidios_g, true, true)}>{formatNutrient(totalNutrients.lipidios_g)}</td>
                                        <td className={nutrientCellClass(totalNutrients.gordura_saturada_g, true)}>{formatNutrient(totalNutrients.gordura_saturada_g)}</td>
                                        <td className={nutrientCellClass(totalNutrients.carboidratos_g, true, true)}>{formatNutrient(totalNutrients.carboidratos_g)}</td>
                                        <td className={nutrientCellClass(totalNutrients.fibras_g, true)}>{formatNutrient(totalNutrients.fibras_g)}</td>
                                        <td className={nutrientCellClass(totalNutrients.calcio_mg, true)}>{formatNutrient(totalNutrients.calcio_mg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.magnesio_mg, true)}>{formatNutrient(totalNutrients.magnesio_mg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.ferro_mg, true)}>{formatNutrient(totalNutrients.ferro_mg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.zinco_mg, true)}>{formatNutrient(totalNutrients.zinco_mg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.vitamina_a_mcg, true)}>{formatNutrient(totalNutrients.vitamina_a_mcg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.vitamina_c_mg, true)}>{formatNutrient(totalNutrients.vitamina_c_mg)}</td>
                                        <td className={nutrientCellClass(totalNutrients.sodio_mg, true)}>{formatNutrient(totalNutrients.sodio_mg)}</td>
                                        <td className={`p-1 text-center tabular-nums ${getNutrientCellClass(totalNutrients.gordura_trans_mg, true)}`}>{formatNutrient(totalNutrients.gordura_trans_mg)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* MODO DE PREPARO E IMAGEM - NANA BANANA PREMIUM STYLE */}
                        {/* Print: Enforced by ID styles above to match exact screen layout */}
                        <div id="report-grid-container" className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start pt-4">
                            <div id="report-text-column" className="md:col-span-7 space-y-4">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-8 h-px bg-slate-900"></span> MODO DE PREPARO TÉCNICO
                                </h4>
                                <div className="text-[10px] text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-slate-300 print:rounded-none print:break-inside-auto">
                                    {preparacao.modo_preparo ? (
                                        <div className="space-y-3">
                                            {preparacao.modo_preparo.split('\n').filter(l => l.trim()).map((line, i) => (
                                                <p key={i} className="flex gap-4 print:break-inside-avoid">
                                                    <span className="font-black text-slate-400 shrink-0 w-4 italic">{String(i + 1).padStart(2, '0')}</span>
                                                    <span className="border-l border-slate-200 pl-4 print:border-slate-300">
                                                        {/* Limpa markdown basico (**texto**) para impressao mais limpa */}
                                                        {line.trim()
                                                            .replace(/^\d+\.|^\d+\)/, '')
                                                            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove negrito markdown
                                                            .replace(/\*/g, '') // Remove asteriscos soltos
                                                        }
                                                    </span>
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="italic text-slate-400">Procedimento operacional não detalhado.</p>
                                    )}
                                </div>
                            </div>

                            <div id="report-image-column" className="md:col-span-5 space-y-4">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 justify-end print:justify-start">
                                    ILUSTRAÇÃO DA RECEITA <span className="w-8 h-px bg-slate-900"></span>
                                </h4>
                                <div className="relative group">
                                    <div className="rounded-[40px] overflow-hidden border-[6px] border-white shadow-2xl shadow-slate-200/50 aspect-square bg-slate-100 flex items-center justify-center transform rotate-1 print:transform-none print:shadow-none print:border-2 print:border-slate-200 print:rounded-lg print:aspect-auto print:h-64 print:w-auto print:overflow-visible">
                                        {preparacao.imagem_url ? (
                                            <img
                                                src={preparacao.imagem_url}
                                                alt={preparacao.nome}
                                                className="w-full h-full object-cover print:object-contain print:h-full print:w-full"
                                            />
                                        ) : (
                                            <div className="text-center p-8 opacity-20">
                                                <p className="text-[9px] font-black uppercase tracking-widest mt-2">Sem Imagem</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Subtítulo Estilizado */}
                                    <div className="mt-4 text-right print:text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic pr-4">
                                            * Imagem ilustrativa gerada via IA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ASSINATURAS E RODAPÉ - ESTILO INSTITUCIONAL MODERNO */}
                        <div className="mt-auto pt-16 border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-16 break-inside-avoid">
                                <div className="text-center">
                                    <div className="w-full h-px bg-slate-900 mb-2"></div>
                                    <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Responsável Técnico</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">RT / NUTRICIONISTA</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-full h-px bg-slate-900 mb-2"></div>
                                    <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Coordenador de Unidade</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">PNAE / SEDUC</p>
                                </div>
                            </div>

                            <div className="mt-12 text-center">
                                <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">
                                    SISTEMA BROTAR • ASSISTÊNCIA TÉCNICA À ALIMENTAÇÃO ESCOLAR
                                </p>
                                <p className="text-[6px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                                    PROTOCOLO DE SEGURANÇA ALIMENTAR E NUTRICIONAL • BROTAS DE MACAÚBAS/BA
                                </p>
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
