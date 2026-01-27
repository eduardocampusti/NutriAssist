import React, { useState, useEffect } from 'react';
import { riskIndicatorService, ZoneRiskData } from '../services/riskIndicatorService';
import { AlertTriangle, Map, Users, TrendingUp, AlertOctagon, PackageX, Truck, CheckSquare, Zap, ArrowRight, Activity } from 'lucide-react';
import { useUsers } from '../contexts/UserContext';
import { UserRole } from '../types';

interface SimulationResult {
    affectedCount: number;
    totalSchools: number;
    criticalSchools: string[];
    impactLevel: string;
}

const ZoneRiskPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeProfile } = useUsers();
    const [zones, setZones] = useState<ZoneRiskData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<ZoneRiskData | null>(null);
    const [simItem, setSimItem] = useState('');
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await riskIndicatorService.getZoneRiskIndicators();
        setZones(data);
        setLoading(false);
    };

    const handleSimulate = async () => {
        if (!selectedZone || !simItem) return;
        setSimLoading(true);
        const result = await riskIndicatorService.simulateSupplyImpact(simItem, selectedZone.zoneName); // Wait, simulate expects ID, using name for now
        // Note: In service we used zoneName as ID effectively for the mock
        setSimResult(result as any);
        setSimLoading(false);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'ALTO': return 'bg-red-500 text-white';
            case 'MODERADO': return 'bg-amber-500 text-white';
            default: return 'bg-emerald-500 text-white';
        }
    };

    const getRiskBg = (level: string) => {
        switch (level) {
            case 'ALTO': return 'bg-red-50 border-red-100';
            case 'MODERADO': return 'bg-amber-50 border-amber-100';
            default: return 'bg-emerald-50 border-emerald-100';
        }
    };

    if (loading) {
        return <div className="p-20 text-center text-slate-400">Carregando análise de risco...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Map className="w-8 h-8 text-indigo-600" />
                        Painel de Risco Antecipado - Zonas
                    </h1>
                    <p className="text-slate-500 max-w-2xl mt-2 text-sm">
                        Visão estratégica consolidada para prevenção de riscos logísticos e nutricionais.
                    </p>
                </div>
                <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
                    Voltar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LISTA DE ZONAS (HEATMAP CARDS) */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Zonas Monitoradas</h3>
                    {zones.map(zone => (
                        <div
                            key={zone.zoneName}
                            onClick={() => { setSelectedZone(zone); setSimResult(null); setSimItem(''); }}
                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedZone?.zoneName === zone.zoneName ? 'border-indigo-600 shadow-md transform scale-[1.02]' : 'border-white bg-white hover:border-indigo-200'}`}
                        >
                            <div className="flex justify-between items-start z-10 relative">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{zone.zoneName}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{zone.schoolCount} Unidades Escolares</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${getRiskColor(zone.riskLevel)}`}>
                                    Risco {zone.riskLevel}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2 rounded-lg">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Score</span>
                                    <span className={`text-xl font-black ${zone.riskScore > 100 ? 'text-red-600' : 'text-slate-700'}`}>{zone.riskScore}</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Alertas</span>
                                    <span className="text-xl font-black text-slate-700">{zone.factors.criticalAlerts}</span>
                                </div>
                            </div>

                            {/* Background Indicator */}
                            {zone.riskLevel === 'ALTO' && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* DETALHE DA ZONA */}
                <div className="lg:col-span-8">
                    {selectedZone ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* ZONE OVERVIEW */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${getRiskColor(selectedZone.riskLevel)} shadow-lg`}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-none">Diagnóstico: {selectedZone.zoneName}</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase mt-1">Fatores de Risco Ativos</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertOctagon className="w-5 h-5" /></div>
                                        <div>
                                            <span className="block text-2xl font-black text-slate-800">{selectedZone.factors.criticalAlerts}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Alertas Críticos</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Truck className="w-5 h-5" /></div>
                                        <div>
                                            <span className="block text-2xl font-black text-slate-800">{selectedZone.factors.deliveryDelays}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Atrasos Logísticos</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><CheckSquare className="w-5 h-5" /></div>
                                        <div>
                                            <span className="block text-2xl font-black text-slate-800">{selectedZone.factors.generalJustifications}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Justificativas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SIMULADOR */}
                            <div className="bg-indigo-900 p-8 rounded-[32px] text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Zap className="w-6 h-6 text-yellow-400" />
                                        <h3 className="text-lg font-black uppercase tracking-wide">Simulador de Impacto Logístico</h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="text-[10px] font-bold text-indigo-300 uppercase block mb-2">Selecionar Item Crítico (Ex: Arroz, Feijão)</label>
                                            <input
                                                type="text"
                                                value={simItem}
                                                onChange={e => setSimItem(e.target.value)}
                                                placeholder="Digite o nome do item..."
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:bg-white/20 transition-all font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSimulate}
                                            disabled={!simItem}
                                            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2"
                                        >
                                            {simLoading ? 'Calculando...' : 'Simular Impacto'} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {simResult && (
                                        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
                                            <h4 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-4">Resultado da Simulação</h4>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="text-4xl font-black">{simResult.affectedCount} <span className="text-lg text-indigo-300 font-bold">/ {simResult.totalSchools}</span></div>
                                                <div className="text-xs font-medium text-indigo-200 max-w-xs leading-relaxed">
                                                    Escolas da zona ficariam sem merenda em até 15 dias se houver ruptura deste item.
                                                </div>
                                            </div>

                                            {simResult.criticalSchools.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Unidades mais afetadas:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {simResult.criticalSchools.map((school, i) => (
                                                            <span key={i} className="px-2 py-1 bg-red-500/20 text-red-200 rounded text-[10px] font-bold uppercase">{school}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-16 -mb-16"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200">
                            <Map className="w-16 h-16 text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Selecione uma zona para análise detalhada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZoneRiskPanel;
