import React from 'react';
import { Card } from './UI/Card';
import { OfficialLetterhead } from './OfficialLetterhead';
import { fndePreparacaoService, FNDEPreparacao, PreparacaoNutrientes } from '../services/fndePreparacaoService';
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
    const [nutrientes, setNutrientes] = React.useState<PreparacaoNutrientes | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const isCreche = preparacao.categoria_cardapio === 'CRECHE';
    const themeColor = isCreche ? 'bg-orange-600' : 'bg-emerald-600';
    const themeBg = isCreche ? 'bg-orange-50' : 'bg-emerald-50';
    const themeText = isCreche ? 'text-orange-700' : 'text-emerald-700';
    const themeBorder = isCreche ? 'border-orange-200' : 'border-emerald-200';

    React.useEffect(() => {
        const loadNutrients = async () => {
            try {
                const data = await fndePreparacaoService.getNutritionalInfo(preparacao.id);
                setNutrientes(data);
            } catch (err) {
                console.error("Erro ao carregar nutrientes para relatório:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadNutrients();
    }, [preparacao.id]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="min-h-full flex items-center justify-center p-4 print:p-0 print:block">
                <div className="bg-white w-full max-w-5xl p-8 shadow-2xl rounded-xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:p-0 overflow-hidden flex flex-col">

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
                    <div className="print:p-[1cm] space-y-6 flex-1">
                        <OfficialLetterhead
                            config={letterhead}
                            title="PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR - PNAE"
                            showDate={true}
                        />

                        {/* CLASSIFICAÇÃO HEADER */}
                        <div className={`${themeColor} text-white p-4 rounded-xl flex flex-wrap justify-between items-center gap-4 shadow-sm`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Zap size={20} className="fill-current" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Modalidade Oficial</p>
                                    <h4 className="text-sm font-black uppercase tracking-tight">
                                        FICHA TÉCNICA DE PREPARAÇÕES DO {preparacao.categoria_cardapio === 'CRECHE' ? 'CARDÁPIO - CRECHE' : `CARDÁPIO - ${preparacao.etapa_ensino}`}
                                    </h4>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-8">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 text-left">Modalidade</p>
                                    <p className="text-[11px] font-black uppercase text-left">{preparacao.modalidade_ensino || 'GERAL'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 text-left">Faixa Etária</p>
                                    <p className="text-[11px] font-black uppercase text-left">{preparacao.faixa_etaria || 'PNAE'}</p>
                                </div>
                            </div>
                        </div>

                        {/* NOME E RENDIMENTO */}
                        <div className="grid grid-cols-4 border-2 border-slate-900 rounded-xl overflow-hidden divide-x-2 divide-slate-900">
                            <div className="col-span-3 p-4 bg-slate-50">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">NOME DE PREPARAÇÃO:</label>
                                <h3 className="text-lg font-black text-slate-900 uppercase leading-none">{preparacao.nome}</h3>
                            </div>
                            <div className="p-4 bg-slate-50">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">RENDIMENTO:</label>
                                <div className="text-lg font-black text-slate-900 leading-none">
                                    {preparacao.rendimento_porcoes} {preparacao.rendimento_porcoes === 1 ? 'PORÇÃO' : 'PORÇÕES'}
                                </div>
                            </div>
                        </div>

                        {/* TABELA DE COMPOSIÇÃO - MODELO MARANHÃO */}
                        <div className="border-2 border-slate-900 rounded-xl overflow-hidden">
                            <table className="w-full text-[8px] border-collapse">
                                <thead>
                                    <tr className="bg-slate-200 text-slate-900 border-b-2 border-slate-900 font-black uppercase tracking-tight">
                                        <th className="p-2 border-r border-slate-400 text-left w-[15%]">INGREDIENTES</th>
                                        <th className="p-2 border-r border-slate-400 text-center">PB (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">PL (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">FC</th>
                                        <th className="p-2 border-r border-slate-400 text-center bg-slate-300">ENERGIA (Kcal)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">PTN (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">LPD (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Sat. (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">CHO (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Fibra (g)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Ca (mg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Mg (mg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Fe (mg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Zn (mg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Vit. A (mcg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Vit. C (mg)</th>
                                        <th className="p-2 border-r border-slate-400 text-center">Na (mg)</th>
                                        <th className="p-2 text-center">Trans (mg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-400">
                                    {preparacao.ingredientes?.map((ing, idx) => {
                                        const comp = ing.alimento?.composicao?.[0];
                                        const fc = ing.alimento?.fator_correcao || 1.0;
                                        const pb = ing.quantidade_per_capita * fc;
                                        const calc = (val: number | undefined) => (val ? (val * ing.quantidade_per_capita / 100).toFixed(2) : '0,00');

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-2 border-r border-slate-400 font-bold text-slate-900 uppercase truncate">{ing.alimento?.nome}</td>
                                                <td className="p-2 border-r border-slate-400 text-center font-bold">{pb.toFixed(2)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center font-bold">{ing.quantidade_per_capita.toFixed(2)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center text-slate-500">{fc.toFixed(2)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center font-black bg-slate-50">{calc(comp?.energia_kcal)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.proteinas_g)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.lipidios_g)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.gordura_saturada_g)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.carboidratos_g)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.fibras_g)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.calcio_mg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.magnesio_mg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.ferro_mg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.zinco_mg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.vitamina_a_mcg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.vitamina_c_mg)}</td>
                                                <td className="p-2 border-r border-slate-400 text-center">{calc(comp?.sodio_mg)}</td>
                                                <td className="p-2 text-center">{calc(comp?.gordura_trans_mg)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-200 text-slate-900 font-black border-t-2 border-slate-900">
                                        <td className="p-2 border-r border-slate-400 text-right uppercase">TOTAL</td>
                                        <td className="p-2 border-r border-slate-400"></td>
                                        <td className="p-2 border-r border-slate-400"></td>
                                        <td className="p-2 border-r border-slate-400"></td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.energia_kcal.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.proteinas_g.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.lipidios_g.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.gordura_saturada_g.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.carboidratos_g.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.fibras_g.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.calcio_mg.toFixed(1)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.magnesio_mg.toFixed(1)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.ferro_mg.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.zinco_mg.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.vitamina_a_mcg.toFixed(1)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{nutrientes?.vitamina_c_mg.toFixed(2)}</td>
                                        <td className="p-2 border-r border-slate-400 text-center">{Math.round(nutrientes?.sodio_mg || 0)}</td>
                                        <td className="p-2 text-center">{nutrientes?.gordura_trans_mg.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* MODO DE PREPARO */}
                        <div className="space-y-3 break-inside-avoid">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2">
                                MODO DE PREPARO:
                            </h4>
                            <div className="text-[10px] text-slate-800 leading-relaxed font-medium pl-2">
                                {preparacao.modo_preparo ? (
                                    <div className="space-y-1">
                                        {preparacao.modo_preparo.split('\n').map((line, i) => (
                                            <p key={i} className="flex gap-2">
                                                <span className="font-bold">{i + 1}.</span> {line.trim().replace(/^\d+\.|^\d+\)/, '')}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    "Nenhum modo de preparo detalhado registrado."
                                )}
                            </div>
                        </div>

                        {/* ASSINATURAS E RODAPÉ */}
                        <div className="mt-auto pt-10 grid grid-cols-2 gap-16 break-inside-avoid">
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 w-full pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-900">RESPONSÁVEL TÉCNICO</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">NUTRICIONISTA ESCOLAR</p>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 w-full pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-900">RECEBIMENTO / PRODUÇÃO</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SERVIÇO DE ALIMENTAÇÃO</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 text-center opacity-30">
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                DOCUMENTO INSTITUCIONAL GERADO PELO SISTEMA BROTAR • ASSISTENTE TÉCNICO DE NUTRIÇÃO
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreparacaoReport;
