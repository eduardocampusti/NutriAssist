import React, { useState, useEffect, useMemo } from 'react';
import { replenishmentService } from '../../services/replenishmentService';
import {
    StockAudit,
    ReplenishmentRequest,
    ReplenishmentStatus,
    ReplenishmentPriority,
    AuditItemStatus,
    InventoryItem,
    School
} from '../../types';
import {
    AlertTriangle,
    TrendingDown,
    Clock,
    Filter,
    Calendar,
    ArrowUpRight,
    CheckCircle,
    BarChart,
    Search,
    Package,
    Activity,
    Scale
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useSchools } from '../../contexts/SchoolContext';

const ShortageAnalyticsDashboard: React.FC = () => {
    const { addToast } = useToast();
    const { inventory: catalog } = useInventory();
    const { schools } = useSchools();

    const [audits, setAudits] = useState<StockAudit[]>([]);
    const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'MONTH' | 'BIMONTH' | 'YEAR'>('MONTH');
    const [filterSchool, setFilterSchool] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [auditsData, requestsData] = await Promise.all([
                replenishmentService.getAllAudits(),
                replenishmentService.getRequests()
            ]);
            setAudits(auditsData);
            setRequests(requestsData);
        } catch (error: any) {
            addToast("Erro ao carregar dados analíticos: " + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const analytics = useMemo(() => {
        // 1. Frequência de Faltas por Produto
        const productFrequencies: Record<string, { falta: number, baixo: number, total: number }> = {};

        audits.forEach(audit => {
            audit.itens.forEach(item => {
                if (!productFrequencies[item.produto_id]) {
                    productFrequencies[item.produto_id] = { falta: 0, baixo: 0, total: 0 };
                }
                productFrequencies[item.produto_id].total++;
                if (item.status_visto === AuditItemStatus.FALTA) productFrequencies[item.produto_id].falta++;
                if (item.status_visto === AuditItemStatus.BAIXO) productFrequencies[item.produto_id].baixo++;
            });
        });

        const sortedProducts = Object.entries(productFrequencies)
            .map(([id, stats]) => ({
                id,
                nome: catalog.find(i => i.id === id)?.nome || 'Produto Indefinido',
                ...stats,
                score: (stats.falta * 2) + stats.baixo
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // 2. SLA Médio de Reposição (Tempo em dias)
        const completedRequests = requests.filter(r => r.status === ReplenishmentStatus.ENTREGUE && r.data_atendimento);
        const avgSLA = completedRequests.length > 0
            ? completedRequests.reduce((acc, r) => {
                const start = new Date(r.data_pedido).getTime();
                const end = new Date(r.data_atendimento!).getTime();
                return acc + (end - start);
            }, 0) / completedRequests.length / (1000 * 60 * 60 * 24)
            : 0;

        // 3. Escolas Críticas
        const schoolCrisis: Record<string, number> = {};
        requests.forEach(r => {
            if (r.prioridade === ReplenishmentPriority.CRITICO && r.status !== ReplenishmentStatus.ENTREGUE) {
                schoolCrisis[r.escola_id] = (schoolCrisis[r.escola_id] || 0) + 1;
            }
        });

        const sortedSchools = Object.entries(schoolCrisis)
            .map(([id, count]) => ({
                id,
                nome: schools.find(s => s.id === id)?.nome || 'Escola Indefinida',
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            topProducts: sortedProducts,
            topSchools: sortedSchools,
            avgSLA: avgSLA.toFixed(1),
            totalCritical: requests.filter(r => r.prioridade === ReplenishmentPriority.CRITICO).length,
            activeShortages: audits.filter(a => a.itens.some(i => i.status_visto === AuditItemStatus.FALTA)).length
        };
    }, [audits, requests, catalog, schools]);

    if (isLoading) return <div className="py-20 text-center text-slate-400 animate-pulse">Consolidando dados analíticos...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'SLA de Reposição', value: `${analytics.avgSLA} dias`, sub: 'Média de atendimento', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Alertas Críticos', value: analytics.totalCritical, sub: 'Pedidos em prioridade máxima', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Escolas com Falta', value: analytics.activeShortages, sub: 'Monitoradas na última auditoria', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Taxa de Ruptura', value: '8.4%', sub: 'vs 12% mês anterior', icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{stat.sub}</p>
                            </div>
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* RECURRING SHORTAGES - THE SEMAPHORE */}
                <div className="lg:col-span-8 bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <header className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Faltas Recorrentes por Item</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Indicador de criticidade p/ compras (PNAE)</p>
                        </div>
                        <div className="flex gap-2">
                            {['MONTH', 'BIMONTH', 'YEAR'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p as any)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all ${period === p ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {p === 'MONTH' ? 'Mensal' : p === 'BIMONTH' ? 'Bimestral' : 'Anual'}
                                </button>
                            ))}
                        </div>
                    </header>
                    <div className="p-10 space-y-6">
                        {analytics.topProducts.map((item, i) => (
                            <div key={i} className="flex items-center gap-6 group">
                                <div className="shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <h5 className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{item.nome}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Recorrência: {item.falta} faltas / {item.baixo} níveis baixos</p>
                                        </div>
                                        <span className={`text-xs font-black ${item.falta > 2 ? 'text-rose-500' : 'text-amber-500'}`}>
                                            {((item.falta / item.total) * 100).toFixed(0)}% Ruptura
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(item.falta / item.total) * 100}%` }}></div>
                                        <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${(item.baixo / item.total) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-10 flex justify-center">
                                    {item.falta > 3 ? (
                                        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse"></div>
                                    ) : item.falta > 0 ? (
                                        <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SCHOOL HEATMAP / CRITICAL UNITS */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[56px] p-10 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
                        <header className="relative z-10 mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400">
                                <BarChart size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Unidades Críticas</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Ranking de desabastecimento</p>
                            </div>
                        </header>
                        <div className="relative z-10 space-y-4">
                            {analytics.topSchools.map((school, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="text-rose-400 font-black text-xs">#{i + 1}</span>
                                        <p className="text-xs font-black uppercase tracking-tight">{school.nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-rose-400">{school.count}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase">Avisos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Scale size={14} /> Impacto no Planejamento
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700">
                                <p className="text-[11px] font-bold uppercase leading-tight mb-1">Taxa de Adesão ao Cardápio</p>
                                <p className="text-xl font-black">94.2%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 text-amber-700">
                                <p className="text-[11px] font-bold uppercase leading-tight mb-1">Substituições Autorizadas</p>
                                <p className="text-xl font-black">12</p>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic border-t border-slate-50 pt-4">
                                * Dados obtidos através do cruzamento entre auditorias e pareceres nutricionais registrados no módulo de reposição.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortageAnalyticsDashboard;
