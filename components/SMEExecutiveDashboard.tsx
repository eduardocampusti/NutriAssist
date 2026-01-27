
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
        <Card variant="glass" padding="md" className="group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.05] -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-xl text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform duration-300 shadow-sm ring-1 ring-inset ring-black/5`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-slate-900 tracking-tight">{value}</span>
                    {subValue && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subValue}</span>}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {/* ALERT WIDGET */}
            <div className="mb-0 flex flex-col md:flex-row gap-6 justify-between items-start md:items-stretch">
                <div className="flex-1 w-full">
                    <AlertWidget
                        activeProfile={activeProfile!}
                        onViewAll={() => onNavigate('inventory')}
                    />
                </div>
                <button
                    onClick={() => setIsTermOpen(true)}
                    className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-3 shadow-lg shadow-slate-900/10 shrink-0 transform hover:-translate-y-0.5"
                >
                    <Scale size={18} className="text-emerald-400" />
                    Termo de Ciência
                </button>
            </div>

            <GovernanceTermViewer isOpen={isTermOpen} onClose={() => setIsTermOpen(false)} />

            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* IMPACT AND REACH */}
                <Card variant="gradient" padding="none" className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group h-full">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500 opacity-[0.05] rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500 opacity-[0.05] rounded-full blur-[60px] -ml-20 -mb-20"></div>

                    <div className="p-8 pb-0 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5">
                        <div className="space-y-1 mb-8">
                            <h3 className="text-2xl font-display font-bold tracking-tight text-white mb-1">Impacto Social PNAE</h3>
                            <p className="text-slate-400 text-sm font-medium">Alcance estratégico da política pública.</p>
                        </div>
                        <div className="flex gap-8 mb-8">
                            <div className="text-center">
                                <p className="text-4xl font-display font-bold tracking-tight text-white">{analytics.totalSchools}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Escolas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-display font-bold tracking-tight text-brand-400">{(analytics.totalStudents / 1000).toFixed(1)}k</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Alunos</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Execução do Planejamento</h4>
                                <span className="text-lg font-bold text-brand-400">92%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: '92%' }}></div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">
                                Meta baseada no cronograma de 200 dias letivos e distribuição semanal.
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <CheckCircle2 className="text-brand-400 w-6 h-6 mb-3" />
                            <h5 className="text-sm font-bold text-white mb-1">Transparência PNAE</h5>
                            <p className="text-xs text-slate-400 leading-relaxed">Dados consolidados prontos para prestação de contas ao FNDE.</p>
                        </div>
                    </div>
                </Card>

                <Card variant="glass" padding="lg" className="flex flex-col justify-between h-full">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight">Status das Entregas</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logística na Rede</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {[
                                { label: 'Em Dia / Concluídas', count: 18, color: 'emerald' },
                                { label: 'Atrasadas / Pendentes', count: 3, color: 'rose' },
                                { label: 'Em Rota de Entrega', count: 5, color: 'blue' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-transparent hover:border-surface-200 transition-all hover:bg-white hover:shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full bg-${s.color}-500 ring-2 ring-${s.color}-100`}></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-700">{s.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 relative z-10">Volume Executado PNAE</p>
                        <div className="flex justify-between items-end mb-3 relative z-10">
                            <span className="text-2xl font-display font-bold tracking-tight">R$ 142.5k</span>
                            <span className="text-[9px] font-bold text-brand-400 uppercase bg-brand-500/10 px-2 py-0.5 rounded">34% AF</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-brand-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '34%' }}></div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* RECENT STRATEGIC EVENTS */}
            <Card variant="glass" padding="lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 shadow-sm">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight leading-none">Ajustes e Validações</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pareceres Técnicos Recentes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.filter(r => r.parecer_nutricional).slice(0, 3).map((request, i) => (
                        <div key={i} className="p-6 bg-surface-50 rounded-2xl border border-surface-100 hover:border-brand-200 hover:bg-white hover:shadow-md transition-all group cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-md text-[9px] font-bold uppercase tracking-wider group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                    Ajuste Autorizado
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(request.created_at || '').toLocaleDateString()}
                                </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight mb-2 group-hover:text-brand-600 transition-colors">{(request as any).escola?.nome}</h5>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                                "{request.parecer_nutricional}"
                            </p>
                        </div>
                    ))}
                    {requests.filter(r => r.parecer_nutricional).length === 0 && (
                        <div className="lg:col-span-3 py-12 text-center bg-surface-50 rounded-2xl border border-dashed border-surface-200">
                            <p className="text-sm text-slate-400 font-medium">Nenhum ajuste técnico recente.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SMEExecutiveDashboard;
