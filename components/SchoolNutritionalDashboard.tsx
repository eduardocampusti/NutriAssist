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
            <Card variant="governance" padding="md" className="flex flex-col lg:flex-row gap-6 items-center bg-white">
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
            </Card>

            {latestStat && targets && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* ENERGIA */}
                    <Card variant="governance" padding="lg" className="bg-white border-b-4 border-b-emerald-500">
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
                    </Card>

                    {/* PROTEÍNAS */}
                    <Card variant="governance" padding="lg" className="bg-white border-b-4 border-b-blue-500">
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
                    </Card>

                    {/* FIBRAS */}
                    <Card variant="governance" padding="lg" className="bg-white border-b-4 border-b-amber-500">
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
                    </Card>

                    {/* SÓDIO */}
                    <Card variant="governance" padding="lg" className="bg-white border-b-4 border-b-rose-500">
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
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ALERTAS GERENCIAIS */}
                <Card variant="governance" padding="lg" className="lg:col-span-1 bg-white border-l-4 border-l-slate-800">
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
                </Card>

                {/* HISTÓRICO SEMANAL */}
                <Card variant="governance" padding="lg" className="lg:col-span-2 bg-white">
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
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Semana</th>
                                    <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Energia</th>
                                    <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proteína</th>
                                    <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sódio</th>
                                    <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStats.map((stat, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
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
                </Card>
            </div>
        </div>
    );
};

export default SchoolNutritionalDashboard;
