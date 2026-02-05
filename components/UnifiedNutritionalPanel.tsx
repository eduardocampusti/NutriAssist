import React, { useState, useEffect, useMemo } from 'react';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { supabase } from '../services/supabase';
import {
    AlertTriangle,
    CheckCircle,
    Truck,
    ShieldAlert,
    FileCheck,
    Clock,
    Filter,
    Search,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    Zap,
    Download,
    BarChart3,
    Activity
} from 'lucide-react';
import {
    School,
    IntelligentAlert,
    AlertType,
    SanitaryChecklist,
    Distribution,
    AdministrativeJustification,
    UserRole
} from '../types';

const UnifiedNutritionalPanel: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    const { schools } = useSchools();
    const { activeProfile } = useUsers();

    const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
    const [sanitaryHistory, setSanitaryHistory] = useState<SanitaryChecklist[]>([]);
    const [latestDistributions, setLatestDistributions] = useState<Distribution[]>([]);
    const [justifications, setJustifications] = useState<AdministrativeJustification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterZone, setFilterZone] = useState<string>('TODAS');
    const [filterPriority, setFilterPriority] = useState<string>('TODAS');

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [
                    { data: alertsData },
                    { data: sanitaryData },
                    { data: distData },
                    { data: justData }
                ] = await Promise.all([
                    supabase.from('alertas_inteligentes').select('*').eq('resolvido', false),
                    supabase.from('controles_sanitarios').select('*').order('data_realizacao', { ascending: false }),
                    supabase.from('distribuicoes').select('*').order('data_recebimento', { ascending: false }),
                    supabase.from('justificativas').select('*').order('data_fato', { ascending: false }).limit(100)
                ]);

                setAlerts(alertsData || []);
                setSanitaryHistory(sanitaryData || []);
                setLatestDistributions(distData || []);
                setJustifications(justData || []);
            } catch (err) {
                console.error("Erro ao carregar dados do painel:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const aggregatedData = useMemo(() => {
        return schools.map(school => {
            const schoolAlerts = alerts.filter(a => a.escola_id === school.id);
            const criticalAlerts = schoolAlerts.filter(a => a.tipo_alerta === AlertType.CRITICO);

            const lastSanitary = sanitaryHistory.find(s => s.escola_id === school.id);
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const hasCurrentSanitary = lastSanitary &&
                lastSanitary.mes_referencia === currentMonth &&
                lastSanitary.ano_referencia === currentYear;

            const lastDist = latestDistributions.find(d => d.escola_id === school.id);
            const schoolJustifications = justifications.filter(j => j.escola_id === school.id);

            return {
                ...school,
                alertCount: schoolAlerts.length,
                hasCritical: criticalAlerts.length > 0,
                sanitaryStatus: hasCurrentSanitary ? 'EM_DIA' : 'PENDENTE',
                lastSanitaryDate: lastSanitary?.data_realizacao,
                lastDeliveryDate: lastDist?.data_recebimento || lastDist?.data_envio,
                lastDeliveryStatus: lastDist?.status,
                hasJustifications: schoolJustifications.length > 0
            };
        });
    }, [schools, alerts, sanitaryHistory, latestDistributions, justifications]);

    const filteredSchools = useMemo(() => {
        return aggregatedData.filter(s => {
            const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesZone = filterZone === 'TODAS' || s.zona === filterZone;
            const matchesPriority = filterPriority === 'TODAS' || s.prioridade_nivel === filterPriority;
            return matchesSearch && matchesZone && matchesPriority;
        }).sort((a, b) => {
            const priorityMap: Record<string, number> = { 'ALTA': 3, 'MÉDIA': 2, 'BAIXA': 1 };
            const pA = priorityMap[a.prioridade_nivel || 'BAIXA'] || 0;
            const pB = priorityMap[b.prioridade_nivel || 'BAIXA'] || 0;
            if (pA !== pB) return pB - pA;
            return a.nome.localeCompare(b.nome);
        });
    }, [aggregatedData, searchTerm, filterZone, filterPriority]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Indicadores Nutricionais...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* CABEÇALHO ESTRATÉGICO */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-3xl shadow-xl">🧿</div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Cockpit Nutricional</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Visão 360º de Conformidade PNAE</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white rounded-xl transition-all group" onClick={() => onNavigate('simulador-nutricional')}>
                        <Zap className="w-4 h-4 text-emerald-500 fill-current group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Simulador</span>
                    </div>
                    <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white rounded-xl transition-all group border-l border-slate-200" onClick={() => onNavigate('painel-fnde')}>
                        <Activity className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Painel FNDE</span>
                    </div>
                    <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-white rounded-xl transition-all group border-l border-slate-200" onClick={() => onNavigate('risco-nutricional')}>
                        <BarChart3 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Risco Zona</span>
                    </div>
                    <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2 border-l border-slate-200">
                        <span className="text-xs font-black text-slate-500 uppercase">Alertas:</span>
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-black">{alerts.length}</span>
                    </div>
                </div>
            </div>

            {/* FILTROS E BUSCA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="md:col-span-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar unidade..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>

                <select
                    value={filterZone}
                    onChange={e => setFilterZone(e.target.value)}
                    className="bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                    <option value="TODAS">Todas as Zonas</option>
                    <option value="SEDE">Sede (Urbana)</option>
                    <option value="RURAL">Zona Rural</option>
                    <option value="COCAL">Cocal</option>
                </select>

                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                    <option value="TODAS">Todas as Prioridades</option>
                    <option value="ALTA">🚨 Prioridade Alta</option>
                    <option value="MÉDIA">⚠️ Prioridade Média</option>
                    <option value="BAIXA">✅ Prioridade Baixa</option>
                </select>

                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilterZone('TODAS');
                        setFilterPriority('TODAS');
                    }}
                    className="bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Limpar Filtros
                </button>
            </div>

            {/* LISTA DE CONFORMIDADE */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-6">Unidade Escolar</th>
                                <th className="px-6 py-6 text-center">Prioridade</th>
                                <th className="px-6 py-6 text-center">Alertas Ativos</th>
                                <th className="px-6 py-6 text-center">Checklist Sanitário</th>
                                <th className="px-6 py-6 text-center">Última Entrega</th>
                                <th className="px-6 py-6 text-center">Gestão</th>
                                <th className="px-8 py-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSchools.map(school => (
                                <tr key={school.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{school.nome}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{school.zona} • {school.numAlunos} Alunos</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${school.prioridade_nivel === 'ALTA' ? 'bg-red-500 text-white animate-pulse' :
                                                school.prioridade_nivel === 'MÉDIA' ? 'bg-amber-400 text-white' :
                                                    'bg-slate-100 text-slate-400'
                                                }`}>
                                                {school.prioridade_nivel || 'BAIXA'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            {school.alertCount > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className={`w-4 h-4 ${school.hasCritical ? 'text-red-500' : 'text-amber-500'}`} />
                                                    <span className={`text-xs font-black ${school.hasCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                                        {school.alertCount} {school.alertCount === 1 ? 'Alerta' : 'Alertas'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-500">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase">Normal</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center">
                                            {school.sanitaryStatus === 'EM_DIA' ? (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                    <FileCheck className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">EM DIA</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">PENDENTE</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Truck className="w-4 h-4 opacity-50" />
                                                <span className="text-xs font-bold font-mono">
                                                    {school.lastDeliveryDate ? new Date(school.lastDeliveryDate).toLocaleDateString() : '---'}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                                {school.lastDeliveryStatus?.replace(/_/g, ' ') || 'S/ DADOS'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            {school.hasJustifications ? (
                                                <div title="Possui Justificativas Administrativas" className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                                    <ShieldAlert className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center">
                                                    <ShieldAlert className="w-4 h-4 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => onNavigate('inventory')}
                                            className="p-3 bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Ver Detalhes"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredSchools.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                            <div className="text-4xl">🔎</div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nenhuma unidade encontrada para os filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* LEGENDA E FOOTER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Legenda de Indicadores</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Prioridade Crítica</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FileCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Compliance Sanitário</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Alerta de Ruptura</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Ato Justificado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center gap-2 group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">IA Predictive Monitoring</p>
                        <h3 className="text-2xl font-black tracking-tighter mt-1 leading-none">Gestão de Riscos</h3>
                        <p className="text-slate-400 text-xs font-medium mt-3 leading-relaxed">
                            A prioridade alta é acionada automaticamente quando há ruptura de estoque iminente ou inviabilidade de cardápio aprovado.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500 opacity-[0.05] rounded-full blur-[60px] group-hover:opacity-[0.1] transition-opacity"></div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedNutritionalPanel;
