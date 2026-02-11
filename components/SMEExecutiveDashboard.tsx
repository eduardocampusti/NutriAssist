
import React, { useMemo } from 'react';
import {
    MenuPlan, MenuExecution, StudentNE, InventoryItem,
    NutritionalEvaluation, School, DocStatus,
    StockAudit, ReplenishmentRequest, OperationalOccurrence, ReplenishmentStatus, ReplenishmentPriority,
    SisvanClassification
} from '../types';
import {
    ShieldCheck,
    AlertTriangle,
    Truck,
    CheckCircle2,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Scale
} from 'lucide-react';
import AlertWidget from './AlertWidget';
import { useUsers } from '../contexts/UserContext';
import GovernanceTermViewer from './GovernanceTermViewer';
import { Card } from './UI/Card';

interface SMEExecutiveDashboardProps {
    menuPlans: MenuPlan[];
    executions: MenuExecution[];
    studentsNE: StudentNE[];
    inventory: InventoryItem[];
    evaluations: NutritionalEvaluation[];
    schools: School[];
    audits: StockAudit[];
    requests: ReplenishmentRequest[];
    occurrences: OperationalOccurrence[];
    distributionsByStatus: Record<string, number>;
    onNavigate: (view: string) => void;
}

const SMEExecutiveDashboard: React.FC<SMEExecutiveDashboardProps> = ({
    menuPlans, inventory, evaluations, schools, audits, requests, occurrences, onNavigate
}) => {
    const { activeProfile } = useUsers();
    const [isTermOpen, setIsTermOpen] = React.useState(false);
    const analytics = useMemo(() => {
        // 1. Conformidade de Cardápios (PNAE)
        const totalPlans = menuPlans.length;
        const approvedPlans = menuPlans.filter(p => p.status === DocStatus.APROVADO).length;
        const complianceRate = totalPlans > 0 ? (approvedPlans / totalPlans) * 100 : 0;

        // 1.1 Média Nutricional da Rede (Baseado nos 14 Nutrientes)
        const avgNutrition = menuPlans.reduce((acc, p) => {
            acc.energy += p.total_energia_kcal || 0;
            acc.sodium += p.total_sodio_mg || 0;
            acc.fiber += p.total_fibras_g || 0;
            acc.satFat += p.total_gordura_saturada_g || 0;
            if ((p.total_gordura_trans_mg || 0) > 0) acc.transFatAlerts++;
            return acc;
        }, { energy: 0, sodium: 0, fiber: 0, satFat: 0, transFatAlerts: 0 });

        const networkStats = {
            avgKcal: totalPlans > 0 ? (avgNutrition.energy / totalPlans) : 0,
            avgSodium: totalPlans > 0 ? (avgNutrition.sodium / totalPlans) : 0,
            transFatRisk: totalPlans > 0 ? (avgNutrition.transFatAlerts / totalPlans) * 100 : 0
        };

        // 2. Saúde Nutricional (SISVAN)
        const totalEvals = evaluations.length;
        const eutrofiaCount = evaluations.filter(e => e.classificacaoImc === SisvanClassification.EUTROFIA).length;
        const healthRate = totalEvals > 0 ? (eutrofiaCount / totalEvals) * 100 : 0;

        // 3. Eficiência Logística (SLA Real)
        const completedRequests = requests.filter(r => r.status === ReplenishmentStatus.ENTREGUE && r.data_atendimento);
        const avgSLA = completedRequests.length > 0
            ? completedRequests.reduce((acc, r) => {
                const start = new Date(r.data_pedido).getTime();
                const end = new Date(r.data_atendimento!).getTime();
                return acc + (end - start);
            }, 0) / completedRequests.length / (1000 * 60 * 60 * 24)
            : 0;

        // 4. Governança e Ocorrências
        const criticalOccurrences = occurrences.filter(o => o.status !== 'RESOLVIDO').length;

        // 5. Situação do Estoque
        const stockHealth = (inventory || []).reduce((acc, item) => {
            const saldo = item.saldoAtual || 0;
            const min = item.estoqueMinimo || 0;
            if (saldo <= min) acc.critico++;
            else acc.normal++;
            return acc;
        }, { normal: 0, critico: 0 });

        // 6. Escolas em Risco (% com estoque crítico)
        const schoolsWithAlerts = requests.filter(r => r.status !== ReplenishmentStatus.ENTREGUE && r.prioridade === ReplenishmentPriority.CRITICO).map(r => r.escola_id);
        const uniqueSchoolsInRisk = new Set(schoolsWithAlerts).size;
        const schoolRiskRate = schools.length > 0 ? (uniqueSchoolsInRisk / schools.length) * 100 : 0;

        // 7. Faltas Recorrentes (Itens mais citados em auditorias como FALTA)
        const itemShortages: Record<string, number> = {};
        audits.forEach(a => {
            a.itens.forEach(i => {
                if (i.status_visto === 'FALTA') {
                    itemShortages[i.produto_id] = (itemShortages[i.produto_id] || 0) + 1;
                }
            });
        });

        const topShortages = Object.entries(itemShortages)
            .map(([id, count]) => ({
                nome: inventory.find(inv => inv.id === id)?.nome || 'Item Desconhecido',
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        const totalStudents = schools.reduce((acc, s) => acc + (s.numAlunos || 0), 0);

        return {
            complianceRate,
            networkStats,
            healthRate,
            avgSLA: avgSLA.toFixed(1),
            criticalOccurrences,
            stockHealth,
            schoolRiskRate,
            topShortages,
            totalStudents,
            totalSchools: schools.length
        };
    }, [menuPlans, inventory, evaluations, schools, audits, requests, occurrences]);

    const KPICard = ({ title, value, subValue, icon: Icon, color, trend }: any) => {
        // ... (Rest of component remains same)
        const colorName = color.split('-')[1];

        // Soft Glass Style
        const bgClass =
            colorName === 'emerald' ? 'bg-emerald-50' :
                colorName === 'rose' ? 'bg-rose-50' :
                    colorName === 'blue' ? 'bg-blue-50' :
                        'bg-amber-50';

        const textClass =
            colorName === 'emerald' ? 'text-emerald-600' :
                colorName === 'rose' ? 'text-rose-600' :
                    colorName === 'blue' ? 'text-blue-600' :
                        'text-amber-600';

        // Gradient Background for Texture
        const gradientClass =
            colorName === 'emerald' ? 'from-white via-white to-emerald-50/50' :
                colorName === 'rose' ? 'from-white via-white to-rose-50/50' :
                    colorName === 'blue' ? 'from-white via-white to-blue-50/50' :
                        'from-white via-white to-amber-50/50';

        return (
            <div className={`bg-white rounded-xl border border-slate-100 p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] bg-gradient-to-br ${gradientClass}`}>
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center ${textClass} group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-bold text-slate-500 leading-tight mb-2 tracking-tight uppercase">{title}</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-[#111827] tracking-tight">{value}</span>
                        {subValue && <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{subValue}</span>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {/* HERO SECTION - GREEN ROOF */}
            <div className="h-[280px] w-full bg-[#064E3B] -mx-8 -mt-8 px-8 py-8 mb-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center pt-4">
                    <div className="text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Olá, {activeProfile?.nome?.split(' ')[0] || 'Gestor'}</h1>
                        <p className="text-emerald-100/80 font-medium text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                            Visão Geral da Rede • 2026/1
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Transparent Hero Filters */}
                        <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 backdrop-blur-sm transition-all flex items-center gap-2">
                            <Building2 size={14} className="text-emerald-200" /> Todas Escolas
                        </button>
                        <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 backdrop-blur-sm transition-all flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-200" /> 2026/1
                        </button>

                        <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>

                        <button
                            onClick={() => setIsTermOpen(true)}
                            className="text-emerald-100 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Scale size={16} />
                            Termo
                        </button>
                    </div>
                </div>
            </div>

            {/* TOP METRICS - OVERLAPPING LAYER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 relative z-20 px-2">
                <KPICard
                    title="Governança Técnica"
                    value={`${analytics.complianceRate.toFixed(0)}%`}
                    subValue="Aprovação PNAE"
                    icon={ShieldCheck}
                    color="bg-emerald-500"
                    trend={12}
                />
                <KPICard
                    title="Escolas em Alerta"
                    value={`${analytics.schoolRiskRate.toFixed(0)}%`}
                    subValue="Ruptura de Estoque"
                    icon={AlertTriangle}
                    color="bg-rose-500"
                    trend={-5}
                />
                <KPICard
                    title="Logística (SLA)"
                    value={analytics.avgSLA}
                    subValue="Dias para Entrega"
                    icon={Truck}
                    color="bg-blue-500"
                />
                <KPICard
                    title="Eventos Ativos"
                    value={analytics.criticalOccurrences}
                    subValue="Intercorrências"
                    icon={Building2}
                    color="bg-amber-500"
                />
            </div>

            <GovernanceTermViewer isOpen={isTermOpen} onClose={() => setIsTermOpen(false)} />

            {/* ALERT WIDGET SECTION - MOVED BELOW */}
            <div className="mt-2 mb-8">
                <AlertWidget
                    activeProfile={activeProfile!}
                    onViewAll={() => onNavigate('inventory')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* IMPACT AND REACH */}
                <Card variant="glass" padding="none" className="lg:col-span-2 bg-white text-stone-900 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden flex flex-col justify-between group h-full border-stone-200">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 opacity-[0.6] rounded-full blur-[80px] -mr-32 -mt-32"></div>

                    <div className="p-8 pb-0 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4 mb-4 border-l-4 border-emerald-500 pl-6">
                            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Impacto Social PNAE</h3>
                            <p className="text-gray-500 text-sm font-bold">Alcance estratégico da política pública.</p>
                        </div>
                        <div className="flex gap-8 mb-4">
                            <div className="text-center">
                                <p className="text-6xl font-extrabold tracking-tight text-gray-900">{analytics.totalSchools}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Escolas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-6xl font-extrabold tracking-tight text-[#16A34A]">{(analytics.totalStudents / 1000).toFixed(1)}k</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Alunos</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-stone-100 my-4 relative z-10"></div>

                    <div className="p-8 pt-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        {/* SEÇÃO DE AUDITORIA NUTRICIONAL (NOVA) */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-500" /> Auditoria Nutricional da Rede
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Energia Média</p>
                                    <p className="text-lg font-black text-slate-900">{analytics.networkStats.avgKcal.toFixed(0)} <small className="text-[10px] opacity-40">kcal</small></p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Sódio Médio</p>
                                    <p className="text-lg font-black text-slate-900">{analytics.networkStats.avgSodium.toFixed(0)} <small className="text-[10px] opacity-40">mg</small></p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Risco de Gordura Trans</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${analytics.networkStats.transFatRisk > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {analytics.networkStats.transFatRisk > 0 ? 'ALERTA' : 'SEGURO'}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full transition-all ${analytics.networkStats.transFatRisk > 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, analytics.networkStats.transFatRisk || 5)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
                            <CheckCircle2 className="text-brand-600 w-6 h-6 mb-3" />
                            <h5 className="text-sm font-bold text-slate-800 mb-1">Transparência PNAE</h5>
                            <p className="text-xs text-slate-500 leading-relaxed italic">"Dados consolidados em tempo real com os 14 nutrientes normativos do FNDE."</p>
                        </div>
                    </div>
                </Card>

                <Card variant="glass" padding="lg" className="flex flex-col justify-between h-full bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-4 py-1">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                                <Truck className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Status das Entregas</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logística na Rede</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {[
                                { label: 'Em Dia / Concluídas', count: 18, color: 'emerald' },
                                { label: 'Atrasadas / Pendentes', count: 3, color: 'rose' },
                                { label: 'Em Rota de Entrega', count: 5, color: 'blue' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:bg-white hover:shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full bg-${s.color}-500 ring-2 ring-${s.color}-100`}></div>
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:text-gray-900">{s.label}</span>
                                    </div>
                                    <span className="text-lg font-extrabold text-gray-900">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 relative overflow-hidden shadow-sm border-l-4 border-l-emerald-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 relative z-10">Volume Executado PNAE</p>
                        <div className="flex justify-between items-end mb-3 relative z-10">
                            <span className="text-4xl font-extrabold tracking-tight text-gray-900">R$ 142.5k</span>
                            <span className="text-xs font-bold text-emerald-800 uppercase bg-emerald-100 px-3 py-1 rounded-full">34% AF</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: '34%' }}></div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* RECENT STRATEGIC EVENTS */}
            <Card variant="glass" padding="lg" className="rounded-2xl border border-stone-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 border border-stone-100">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight leading-none">Ajustes e Validações</h3>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Pareceres Técnicos Recentes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.filter(r => r.parecer_nutricional).slice(0, 3).map((request, i) => (
                        <div key={i} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[9px] font-bold uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    Ajuste Autorizado
                                </span>
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(request.created_at || '').toLocaleDateString()}
                                </span>
                            </div>
                            <h5 className="text-xs font-bold text-stone-800 uppercase tracking-tight mb-2 group-hover:text-emerald-700 transition-colors">{(request as any).escola?.nome}</h5>
                            <p className="text-[11px] text-stone-500 font-medium leading-relaxed italic line-clamp-2">
                                "{request.parecer_nutricional}"
                            </p>
                        </div>
                    ))}
                    {requests.filter(r => r.parecer_nutricional).length === 0 && (
                        <div className="lg:col-span-3 py-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                            <p className="text-sm text-stone-400 font-medium">Nenhum ajuste técnico recente.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SMEExecutiveDashboard;
