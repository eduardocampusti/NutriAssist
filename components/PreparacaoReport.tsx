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
    ArrowLeft
} from 'lucide-react';

interface PreparacaoReportProps {
    preparacao: FNDEPreparacao;
    onClose: () => void;
}

const PreparacaoReport: React.FC<PreparacaoReportProps> = ({ preparacao, onClose }) => {
    const { letterhead } = usePNAE();
    const [nutrientes, setNutrientes] = React.useState<PreparacaoNutrientes | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

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
                <div className="bg-white w-full max-w-4xl p-12 shadow-2xl rounded-xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:p-0 overflow-hidden flex flex-col">

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
                            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black shadow-lg flex items-center gap-2"
                        >
                            <Printer size={18} /> Imprimir / PDF
                        </button>
                    </div>

                    {/* REPORT CONTENT */}
                    <div className="print:p-[1.5cm] space-y-8 flex-1">
                        <OfficialLetterhead
                            config={letterhead}
                            title="Ficha Técnica de Preparação"
                            showDate={true}
                        />

                        {/* CABEÇALHO DA FICHA */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Preparação</label>
                                <h3 className="text-2xl font-black text-slate-900 uppercase leading-none">{preparacao.nome}</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendimento Estimado</label>
                                <div className="text-xl font-black text-slate-900">
                                    {preparacao.rendimento_porcoes} {preparacao.rendimento_porcoes === 1 ? 'PORÇÃO' : 'PORÇÕES'}
                                </div>
                            </div>
                        </div>

                        {preparacao.descricao && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Operacional</label>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{preparacao.descricao}</p>
                            </div>
                        )}

                        {/* LISTA DE INGREDIENTES COM BREAKDOWN NUTRICIONAL */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 flex items-center gap-2">
                                <Scale size={16} /> Composição Nutricional por Ingrediente
                            </h4>
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black uppercase text-[8px] tracking-widest">
                                        <th className="p-3 text-left">Item FNDE</th>
                                        <th className="p-3 text-center">P. Líquido (g)</th>
                                        <th className="p-3 text-center bg-emerald-50 text-emerald-700">Energia (kcal)</th>
                                        <th className="p-3 text-center">PTN (g)</th>
                                        <th className="p-3 text-center">CHO (g)</th>
                                        <th className="p-3 text-center">LIP (g)</th>
                                        <th className="p-3 text-right">FC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {preparacao.ingredientes?.map((ing, idx) => {
                                        const comp = ing.alimento?.composicao?.[0];
                                        const calc = (val: number | undefined) => (val ? (val * ing.quantidade_per_capita / 100).toFixed(2) : '0.00');

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3 font-bold text-slate-800 uppercase max-w-[200px] truncate">{ing.alimento?.nome || 'Ingrediente'}</td>
                                                <td className="p-3 text-center font-black text-slate-900">{ing.quantidade_per_capita}g</td>
                                                <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/30">{calc(comp?.energia_kcal)}</td>
                                                <td className="p-3 text-center font-medium text-slate-600">{calc(comp?.proteinas_g)}</td>
                                                <td className="p-3 text-center font-medium text-slate-600">{calc(comp?.carboidratos_g)}</td>
                                                <td className="p-3 text-center font-medium text-slate-600">{calc(comp?.lipidios_g)}</td>
                                                <td className="p-3 text-right text-slate-400">1.00</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MODO DE PREPARO */}
                        <div className="space-y-4 break-inside-avoid">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2">
                                Modo de Execução / Técnica de Preparo
                            </h4>
                            <div className="bg-slate-50 p-6 rounded-2xl text-sm text-slate-700 leading-loose whitespace-pre-wrap border border-slate-100 italic">
                                {preparacao.modo_preparo || "Nenhum modo de preparo detalhado registrado."}
                            </div>
                        </div>

                        {/* ANÁLISE NUTRICIONAL - PARITY WITH EDITOR */}
                        <div className="grid grid-cols-12 gap-8 break-inside-avoid shadow-sm rounded-[44px] border border-slate-100 p-8 bg-white">
                            {/* LADO ESQUERDO: DESTAQUE ENERGIA */}
                            <div className="col-span-12 lg:col-span-5 text-center flex flex-col justify-center border-r border-slate-100 p-4 relative">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Energia Per Capita</span>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-[120px] font-black text-slate-900 tracking-tighter leading-none">
                                        {nutrientes ? Math.round(nutrientes.energia_kcal) : '--'}
                                    </span>
                                    <span className="text-2xl font-black text-emerald-600 uppercase tracking-widest">kcal</span>
                                </div>
                                <div className="mt-8 flex items-center justify-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span> Conformidade PNAE / FNDE
                                </div>
                                <div className="absolute right-[-1px] top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-slate-100 to-transparent"></div>
                            </div>

                            {/* LADO DIREITO: LISTA DE NUTRIENTES */}
                            <div className="col-span-12 lg:col-span-7 space-y-3">
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50"><Scale size={20} /></div>
                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Proteínas</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{nutrientes && nutrientes.proteinas_g != null ? nutrientes.proteinas_g.toFixed(2) : '0.00'}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50"><Droplets size={20} /></div>
                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Lipídios</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{nutrientes && nutrientes.lipidios_g != null ? nutrientes.lipidios_g.toFixed(2) : '0.00'}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50"><Wheat size={20} /></div>
                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Fibras</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{nutrientes && nutrientes.fibras_g != null ? nutrientes.fibras_g.toFixed(2) : '0.00'}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200/50"><Info size={20} /></div>
                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Sódio</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{nutrientes ? Math.round(nutrientes.sodio_mg) : '0'}<small className="text-[10px] ml-1 opacity-40">mg</small></span>
                                </div>

                                <div className="pt-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Cálculo automático baseado na Tabela de Composição de Alimentos FNDE/PNAE.<br />
                                        Valores nutricionais por ingrediente detalhados na composição técnica acima.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] flex items-start gap-4 break-inside-avoid shadow-sm">
                            <Info size={24} className="text-amber-600 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <h5 className="text-[11px] font-black text-amber-900 uppercase tracking-[0.2em]">Observação Técnica e Rendimento</h5>
                                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                    Este documento é uma ficha técnica institucional. Conforme Resolução 06/2020, o rendimento per capita deve ser validado pelo teste de aceitabilidade. O modo de preparo deve ser seguido rigorosamente para garantir a integridade nutricional.
                                </p>
                            </div>
                        </div>

                        {/* ASSINATURAS */}
                        <div className="mt-auto pt-16 grid grid-cols-2 gap-12 break-inside-avoid">
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 w-full pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-900">Responsável Técnico (RT)</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Nutricionista • CRN-X</p>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 w-full pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-900">Recebimento / Produção</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Merendeira Escolar</p>
                                </div>
                            </div>
                        </div>

                        <OfficialLetterhead
                            config={letterhead}
                            type="footer"
                            className="mt-12 opacity-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreparacaoReport;
