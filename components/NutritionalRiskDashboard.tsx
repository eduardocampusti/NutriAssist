import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Map,
    ChevronRight,
    Info,
    ShieldAlert,
    Zap,
    Activity,
    ArrowRight,
    Filter,
    RefreshCw,
    Calendar
} from 'lucide-react';
import { riskIndicatorService, ZoneRiskData, ZoneRiskHistory } from '../services/riskIndicatorService';

const NutritionalRiskDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [zoneRisks, setZoneRisks] = useState<ZoneRiskData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<ZoneRiskData | null>(null);
    const [history, setHistory] = useState<ZoneRiskHistory[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const risks = await riskIndicatorService.getZoneRiskIndicators();
            setZoneRisks(risks);
            if (risks.length > 0) {
                handleSelectZone(risks[0]);
            }
        } catch (err) {
            console.error("Erro ao carregar indicadores de risco:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectZone = async (zone: ZoneRiskData) => {
        setSelectedZone(zone);
        const hist = await riskIndicatorService.getHistoryByZone(zone.zoneName);
        setHistory(hist);
    };

    const getRiskStyles = (level: string) => {
        switch (level) {
            case 'ALTO': return 'text-red-500 bg-red-50 border-red-100 shadow-red-100';
            case 'MODERADO': return 'text-amber-500 bg-amber-50 border-amber-100 shadow-amber-100';
            default: return 'text-emerald-500 bg-emerald-50 border-emerald-100 shadow-emerald-100';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculando Índices de Risco...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* CABEÇALHO EXECUTIVO */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-3xl shadow-xl">📊</div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Ranking de Risco Zona</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Monitoramento Estratégico de Conformidade</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Voltar ao Cockpit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* RANKING DE ZONAS */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Zonas por Criticidade</h3>
                            <Filter className="w-4 h-4 text-slate-300" />
                        </div>

                        <div className="space-y-4">
                            {zoneRisks.map((zone, idx) => (
                                <div
                                    key={zone.zoneName}
                                    onClick={() => handleSelectZone(zone)}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex items-center justify-between ${selectedZone?.zoneName === zone.zoneName
                                            ? 'border-slate-900 bg-slate-50'
                                            : 'border-slate-50 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${getRiskStyles(zone.riskLevel)}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{zone.zoneName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{zone.schoolCount} Escolas</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <div className="flex items-center gap-1">
                                                    {zone.trend === 'SUBINDO' ? <TrendingUp className="w-3 h-3 text-red-400" /> : <Activity className="w-3 h-3 text-emerald-400" />}
                                                    <span className={`text-[9px] font-black uppercase ${zone.trend === 'SUBINDO' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {zone.trend}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-900 leading-none">{zone.riskScore}</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">PTS SCORE</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MATRIZ DE CALCULOS (INFO) */}
                    <div className="bg-indigo-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-300" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Critérios de Cálculo PNAE</h4>
                            </div>
                            <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                                O score é ponderado por criticidade. Alertas de ruptura de estoque (Peso 15) e irregularidades sanitárias (Peso 12) elevam a classificação da zona imediatamente.
                            </p>
                            <button className="text-[9px] font-black uppercase tracking-tighter text-amber-300 flex items-center gap-1 hover:translate-x-1 transition-transform">
                                Ver Regras do Algoritmo <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                    </div>
                </div>

                {/* DETALHAMENTO DA ZONA SELECIONADA */}
                <div className="lg:col-span-7 space-y-6">
                    {selectedZone && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* CARDS DE FATOR */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm col-span-2">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Fatores de Risco: {selectedZone.zoneName}</h3>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Decomposição Técnica das Ocorrências</p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getRiskStyles(selectedZone.riskLevel)}`}>
                                            Nível {selectedZone.riskLevel}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Alertas Estoque', value: selectedZone.factors.criticalAlerts, color: 'text-red-500' },
                                            { label: 'Faltas Registro', value: selectedZone.factors.ruptureJustifications, color: 'text-amber-500' },
                                            { label: 'Irreg. Sanitária', value: selectedZone.factors.sanitaryIssues, color: 'text-indigo-500' },
                                            { label: 'Atraso Entrega', value: selectedZone.factors.deliveryDelays, color: 'text-emerald-500' }
                                        ].map(f => (
                                            <div key={f.label} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                                <div className={`text-2xl font-black ${f.color} group-hover:scale-110 transition-transform origin-left`}>{f.value}</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-tight mt-1">{f.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* GRÁFICO DE EVOLUÇÃO (MOCK) */}
                                <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl col-span-2">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                                            Evolução Histórica
                                        </h3>
                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase">
                                            <Calendar className="w-3 h-3" />
                                            Últimos 6 Meses
                                        </div>
                                    </div>

                                    <div className="h-40 flex items-end justify-between gap-4 px-2">
                                        {history.map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                <div className="relative w-full flex justify-center items-end h-full">
                                                    <div
                                                        className="w-full max-w-[40px] bg-slate-800 rounded-t-xl hover:bg-emerald-500 transition-all cursor-pointer relative"
                                                        style={{ height: `${(h.avgScore / 150) * 100}%` }}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {Math.round(h.avgScore)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">{h.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionalRiskDashboard;
