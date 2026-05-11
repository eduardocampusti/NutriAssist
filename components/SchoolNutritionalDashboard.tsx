import React, { useEffect, useState, useMemo } from 'react';
import { Card } from './UI/Card';
import { PageHeader } from './UI/PageHeader';
import { Button } from './UI/Button';
import {
    Activity,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Calendar,
    Filter,
    ArrowLeft,
    School,
    Zap,
    Scale,
    Wheat,
    Droplets
} from 'lucide-react';
import { nutritionalDashboardService, SchoolNutritionalStats, PNAETargets, ManagementAlert } from '../services/nutritionalDashboardService';
import { useSchools } from '../contexts/SchoolContext';

interface SchoolNutritionalDashboardProps {
    onBack: () => void;
}

const SchoolNutritionalDashboard: React.FC<SchoolNutritionalDashboardProps> = ({ onBack }) => {
    const { schools } = useSchools();
    const [stats, setStats] = useState<SchoolNutritionalStats[]>([]);
    const [targets, setTargets] = useState<PNAETargets | null>(null);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
    const [alerts, setAlerts] = useState<ManagementAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [schoolStats, pnaeTargets] = await Promise.all([
                    nutritionalDashboardService.getSchoolStats(),
                    nutritionalDashboardService.getPNAETargets()
                ]);
                setStats(schoolStats);
                setTargets(pnaeTargets);
            } catch (err) {
                console.error("Erro ao carregar dashboard nutricional:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedSchoolId) {
            const fetchAlerts = async () => {
                try {
                    const schoolAlerts = await nutritionalDashboardService.getManagementAlerts(selectedSchoolId);
                    setAlerts(schoolAlerts);
                } catch (err) {
                    console.error("Erro ao carregar alertas nutricionais:", err);
                }
            };
            fetchAlerts();
        } else {
            setAlerts([]);
        }
    }, [selectedSchoolId]);

    const filteredStats = useMemo(() => {
        if (!selectedSchoolId) return stats;
        return stats.filter(s => s.escola_id === selectedSchoolId);
    }, [stats, selectedSchoolId]);

    const latestStat = filteredStats[0];

    const getStatus = (value: number, target: number, type: 'ENERGY' | 'PROTEIN' | 'FIBER' | 'SODIUM') => {
        const percent = (value / target) * 100;

        if (type === 'SODIUM') {
            if (percent > 110) return { label: 'Ajuste Recomendado', color: 'text-rose-600', bg: 'bg-rose-50' };
            if (percent > 90) return { label: 'Atenção', color: 'text-amber-600', bg: 'bg-amber-50' };
            return { label: 'Adequado', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        }

        if (percent < 80) return { label: 'Ajuste Recomendado', color: 'text-rose-600', bg: 'bg-rose-50' };
        if (percent < 95) return { label: 'Atenção', color: 'text-amber-600', bg: 'bg-amber-50' };
        return { label: 'Adequado', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando Indicadores FNDE...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <PageHeader
                title="Painel Nutricional Escolar"
                subtitle="Monitoramento Técnico Baseado na Base FNDE/PNAE"
                icon={Activity}
                actions={
                    <Button onClick={onBack} variant="outline" className="bg-white border-slate-200">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                }
            />

            {/* BARRA DE FILTROS */}
            <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'14px 20px',display:'flex',flexWrap:'wrap',alignItems:'center',gap:16}}>
                <div className="flex items-center gap-2 text-slate-500 border-r border-slate-200 pr-6">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
                </div>

                <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Unidade Escolar</label>
                        <select
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                        >
                            <option value="">Consolidado SME (Média Geral)</option>
                            {schools.filter(s => s.ativo).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {latestStat && targets && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* ENERGIA */}
                    <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',borderBottom:'4px solid #22c55e',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'18px 20px',transition:'all 0.2s'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';el.style.transform='translateY(0)';}}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Zap className="w-5 h-5" /></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatus(latestStat.media_energia, targets.ref_energia_kcal, 'ENERGY').bg} ${getStatus(latestStat.media_energia, targets.ref_energia_kcal, 'ENERGY').color}`}>
                                {getStatus(latestStat.media_energia, targets.ref_energia_kcal, 'ENERGY').label}
                            </span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Energia (Méd/Dia)</h4>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{Math.round(latestStat.media_energia)}</span>
                            <span className="text-sm font-bold text-slate-400 mb-1">kcal</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Ref: {targets.ref_energia_kcal} kcal</span>
                                <span>{Math.round((latestStat.media_energia / targets.ref_energia_kcal) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min((latestStat.media_energia / targets.ref_energia_kcal) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* PROTEÍNAS */}
                    <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',borderBottom:'4px solid #3b82f6',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'18px 20px',transition:'all 0.2s'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';el.style.transform='translateY(0)';}}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Scale className="w-5 h-5" /></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatus(latestStat.media_proteinas, targets.ref_proteinas_g, 'PROTEIN').bg} ${getStatus(latestStat.media_proteinas, targets.ref_proteinas_g, 'PROTEIN').color}`}>
                                {getStatus(latestStat.media_proteinas, targets.ref_proteinas_g, 'PROTEIN').label}
                            </span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proteínas (Méd/Dia)</h4>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{latestStat.media_proteinas.toFixed(1).replace('.', ',')}</span>
                            <span className="text-sm font-bold text-slate-400 mb-1">g</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Ref: {targets.ref_proteinas_g} g</span>
                                <span>{Math.round((latestStat.media_proteinas / targets.ref_proteinas_g) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min((latestStat.media_proteinas / targets.ref_proteinas_g) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* FIBRAS */}
                    <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',borderBottom:'4px solid #f59e0b',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'18px 20px',transition:'all 0.2s'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';el.style.transform='translateY(0)';}}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Wheat className="w-5 h-5" /></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatus(latestStat.media_fibras, targets.ref_fibras_g, 'FIBER').bg} ${getStatus(latestStat.media_fibras, targets.ref_fibras_g, 'FIBER').color}`}>
                                {getStatus(latestStat.media_fibras, targets.ref_fibras_g, 'FIBER').label}
                            </span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fibras (Méd/Dia)</h4>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{latestStat.media_fibras.toFixed(1).replace('.', ',')}</span>
                            <span className="text-sm font-bold text-slate-400 mb-1">g</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Ref: {targets.ref_fibras_g} g</span>
                                <span>{Math.round((latestStat.media_fibras / targets.ref_fibras_g) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${Math.min((latestStat.media_fibras / targets.ref_fibras_g) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* SÓDIO */}
                    <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',borderBottom:'4px solid #ef4444',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'18px 20px',transition:'all 0.2s'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';el.style.transform='translateY(0)';}}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><Droplets className="w-5 h-5" /></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatus(latestStat.media_sodio, targets.ref_sodio_mg, 'SODIUM').bg} ${getStatus(latestStat.media_sodio, targets.ref_sodio_mg, 'SODIUM').color}`}>
                                {getStatus(latestStat.media_sodio, targets.ref_sodio_mg, 'SODIUM').label}
                            </span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sódio (Méd/Dia)</h4>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{Math.round(latestStat.media_sodio)}</span>
                            <span className="text-sm font-bold text-slate-400 mb-1">mg</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Limite: {targets.ref_sodio_mg} mg</span>
                                <span>{Math.round((latestStat.media_sodio / targets.ref_sodio_mg) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${latestStat.media_sodio > targets.ref_sodio_mg ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((latestStat.media_sodio / targets.ref_sodio_mg) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ALERTAS GERENCIAIS */}
                <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',borderLeft:'4px solid #0f172a',borderTopLeftRadius:0,borderBottomLeftRadius:0,boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'20px 22px'}} className="lg:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-slate-800" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Análise de Tendências</h3>
                    </div>

                    <div className="space-y-4">
                        {alerts.length > 0 ? alerts.map((alert, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${alert.nivel === 'CRITICO' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-xl mt-0.5">{alert.nivel === 'CRITICO' ? '🚨' : '⚠️'}</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{alert.tipo.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-bold leading-relaxed">{alert.mensagem}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center text-center px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <span className="text-3xl mb-3">🛡️</span>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma tendência crítica identificada nesta unidade.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* HISTÓRICO SEMANAL */}
                <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'20px 22px',overflow:'hidden'}} className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-800" />
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Histórico de Conformidade</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Últimas Semanas</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{background:'linear-gradient(135deg,#0f172a,#1e293b)'}}>
                                    <th style={{padding:'12px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'left' as const}}>Semana</th>
                                    <th style={{padding:'12px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'right' as const}}>Energia</th>
                                    <th style={{padding:'12px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'right' as const}}>Proteína</th>
                                    <th style={{padding:'12px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'right' as const}}>Sódio</th>
                                    <th style={{padding:'12px 16px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'center' as const}}>Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStats.map((stat, idx) => (
                                    <tr key={idx} style={{borderBottom:'1px solid #f8fafc',transition:'background 0.15s'}} onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background='#f0fdf4';}} onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background='transparent';}}>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                                <span className="text-xs font-bold text-slate-700">{new Date(stat.semana_inicio).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-xs font-bold text-slate-600">{Math.round(stat.media_energia)} kcal</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-xs font-bold text-slate-600">{stat.media_proteinas.toFixed(1)}g</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-xs font-bold text-slate-600">{Math.round(stat.media_sodio)}mg</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="flex justify-center">
                                                <div className={`w-3 h-3 rounded-full ${stat.media_sodio > 450 ? 'bg-rose-500' : stat.media_sodio > 400 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStats.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Aguardando dados de cardápios técnicos...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolNutritionalDashboard;
