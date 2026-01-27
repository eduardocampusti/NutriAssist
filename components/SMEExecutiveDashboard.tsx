
import React, { useMemo } from 'react';
import {
    MenuPlan, MenuExecution, StudentNE, InventoryItem,
    NutritionalEvaluation, School, DocStatus, UserRole,
    StockAudit, ReplenishmentRequest, OperationalOccurrence, ReplenishmentStatus, ReplenishmentPriority,
    SisvanClassification
} from '../types';
import {
    ShieldCheck,
    AlertTriangle,
    TrendingUp,
    Users,
    Scale,
    Truck,
    CheckCircle2,
    ChevronRight,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    BellRing
} from 'lucide-react';
import AlertWidget from './AlertWidget';
import { useUsers } from '../contexts/UserContext';
import GovernanceTermViewer from './GovernanceTermViewer';

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
    menuPlans, executions, studentsNE, inventory, evaluations, schools, audits, requests, occurrences, distributionsByStatus, onNavigate
}) => {
    const { activeProfile } = useUsers();
    const [isTermOpen, setIsTermOpen] = React.useState(false);
    const analytics = useMemo(() => {
        // 1. Conformidade de Cardápios (PNAE)
        const totalPlans = menuPlans.length;
        const approvedPlans = menuPlans.filter(p => p.status === DocStatus.APROVADO).length;
        const complianceRate = totalPlans > 0 ? (approvedPlans / totalPlans) * 100 : 0;

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

    const KPICard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] -mr-8 -mt-8 rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity`}></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
                    {subValue && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{subValue}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ALERT WIDGET */}
            <div className="mb-0 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
                <div className="flex-1 w-full">
                    <AlertWidget
                        activeProfile={activeProfile!}
                        onViewAll={() => onNavigate('inventory')}
                    />
                </div>
                <button
                    onClick={() => setIsTermOpen(true)}
                    className="px-6 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-lg shadow-slate-200 shrink-0"
                >
                    <Scale size={18} className="text-emerald-400" />
                    Termo de Ciência Governança
                </button>
            </div>

            <GovernanceTermViewer isOpen={isTermOpen} onClose={() => setIsTermOpen(false)} />

            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* IMPACT AND REACH */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 opacity-[0.05] rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Impacto Social PNAE</h3>
                            <p className="text-slate-400 text-sm font-medium">Alcançe estratégico da política pública de alimentação.</p>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-4xl font-black tracking-tighter">{analytics.totalSchools}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Escolas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-black tracking-tighter text-emerald-400">{(analytics.totalStudents / 1000).toFixed(1)}k</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Alunos Atendidos</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Execução do Planejamento</h4>
                                <span className="text-xl font-black text-emerald-400">92%</span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: '92%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-4 leading-relaxed italic">
                                Meta baseada no cronograma de 200 dias letivos e metas de distribuição semanal.
                            </p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-sm">
                            <CheckCircle2 className="text-emerald-400 w-8 h-8 mb-4" />
                            <h5 className="text-sm font-black uppercase mb-2">Transparência PNAE</h5>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Dados consolidados prontos para prestação de contas ao FNDE e Tribunal de Contas.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[56px] border border-slate-100 p-12 shadow-sm flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Status das Entregas</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logística na Rede</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            {[
                                { label: 'Em Dia / Concluídas', count: 18, color: 'emerald' },
                                { label: 'Atrasadas / Pendentes', count: 3, color: 'rose' },
                                { label: 'Em Rota de Entrega', count: 5, color: 'blue' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${s.color}-500`}></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{s.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-900 rounded-[32px] text-white">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Volume Executado PNAE</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-black">R$ 142.5k</span>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">34% AF</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '34%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT STRATEGIC EVENTS */}
            <div className="bg-white rounded-[56px] border border-slate-100 p-12 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Ajustes e Validações Técnicas</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Pareceres recentes da Nutricionista Responsável</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.filter(r => r.parecer_nutricional).slice(0, 3).map((request, i) => (
                        <div key={i} className="p-8 bg-slate-50 rounded-[40px] border border-transparent hover:border-emerald-200 hover:bg-white transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    Ajuste Autorizado
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(request.created_at || '').toLocaleDateString()}
                                </span>
                            </div>
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">{(request as any).escola?.nome}</h5>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic line-clamp-3">
                                "{request.parecer_nutricional}"
                            </p>
                        </div>
                    ))}
                    {requests.filter(r => r.parecer_nutricional).length === 0 && (
                        <div className="lg:col-span-3 py-20 text-center text-slate-300 italic">Nenhum ajuste técnico registrado recentemente.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SMEExecutiveDashboard;
