import React, { useEffect, useState } from 'react';
import { Card } from './UI/Card';
import { TrendingUp, Award, Zap, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { nutritionalDashboardService, EvolutionRanking } from '../services/nutritionalDashboardService';

const InternalEvolutionRanking: React.FC = () => {
    const [ranking, setRanking] = useState<EvolutionRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRanking = async () => {
            setIsLoading(true);
            try {
                const data = await nutritionalDashboardService.getInternalRanking();
                setRanking(data);
            } catch (err) {
                console.error("Erro ao carregar ranking de evolução:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadRanking();
    }, []);

    if (isLoading) {
        return <div className="p-12 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Apurando Índices de Evolução...</div>;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Ranking de Evolução Contínua</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Seleção Positiva • Monitoramento de Alta Performance</p>
                </div>
                <div className="hidden md:flex items-center gap-3 text-slate-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Atualizado Mensalmente</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DESTAQUES DA EVOLUÇÃO (TOP 3) */}
                <div className="lg:col-span-2 space-y-4">
                    {ranking.slice(0, 10).map((item, idx) => (
                        <Card key={idx} variant="elevated" padding="none" className="bg-white border border-slate-100 hover:border-emerald-200 transition-all overflow-hidden group">
                            <div className="flex items-center">
                                <div className={`w-16 h-20 flex flex-col items-center justify-center font-black text-lg ${idx === 0 ? 'bg-amber-400 text-white' :
                                    idx === 1 ? 'bg-slate-300 text-white' :
                                        idx === 2 ? 'bg-orange-300 text-white' :
                                            'bg-slate-50 text-slate-400'
                                    }`}>
                                    {idx + 1}º
                                </div>
                                <div className="flex-1 px-6 py-4 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-800 uppercase tracking-tight">{item.escola_nome}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.zona} • <span className="text-emerald-500">{item.status}</span></p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-300 uppercase mb-1 tracking-widest">Score Atual</p>
                                            <p className="text-sm font-black text-slate-900">{item.pontuacao_geral}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] ${Math.abs(item.evolucao) < 1 ? 'bg-slate-50 text-slate-400' :
                                            item.evolucao > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {item.evolucao > 0 ? <ChevronUp className="w-4 h-4" /> :
                                                item.evolucao < 0 ? <ChevronDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            {Math.abs(item.evolucao || 0).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* PAINEL LATERAL ESTRATÉGICO */}
                <div className="space-y-6">
                    <Card variant="governance" padding="lg" className="bg-slate-900 text-white overflow-hidden relative">
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-emerald-500 w-fit rounded-2xl shadow-lg shadow-emerald-500/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black uppercase tracking-tight">Incentivo à Qualidade</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                                    Este ranking reflete o esforço de melhoria operacional.
                                    O score base é calculado sobre 5 pilares: nutrição,
                                    estoque, logística, higiene e conformidade legal.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Melhoria Média Municipal</span>
                                    <span className="text-emerald-400 font-black">+4.2%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[72%]"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mb-12 -mr-12"></div>
                    </Card>

                    <Card variant="outlined" padding="lg" className="bg-white border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Metodologia Normativa</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">
                            Embasado nas resoluções CD/FNDE nº 06/2020 e nº 20/2020, que estabelecem o monitoramento
                            e cumprimento das metas físicas e financeiras do PNAE.
                        </p>
                        <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                            Ver Documentação Completa
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InternalEvolutionRanking;
