import React, { useMemo } from 'react';
import { useMenu } from '../../contexts/MenuContext';
import { useInventory } from '../../contexts/InventoryContext';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    CheckCircle2,
    Scale,
    TrendingDown,
    PackageSearch
} from 'lucide-react';

export const IntegratedSupplyReport: React.FC = () => {
    const { menuPlans, executions } = useMenu();
    const { inventory, distributions } = useInventory();

    const stats = useMemo(() => {
        // Simple aggregation logic for the prototype
        let totalPlanned = 0;
        let totalDelivered = 0;
        let totalConsumed = 0;

        // Planejado
        menuPlans.forEach(p => {
            if (p.status === 'APROVADO' && p.preparacoes) {
                p.preparacoes.forEach(d => {
                    d.ingredientes.forEach((ing: any) => {
                        totalPlanned += (p.numAlunos || 0) * (ing.perCapitaGrams || 0) / 1000;
                    });
                });
            }
        });

        // Entregue
        distributions.forEach(d => {
            if (d.status === 'ENTREGUE') {
                d.itens?.forEach(it => {
                    totalDelivered += it.quantidade_enviada;
                });
            }
        });

        // Consumido
        executions.forEach(e => {
            const plan = menuPlans.find(p => p.id === e.menuId);
            const dish = plan?.preparacoes?.find((d: any) => d.id === e.dishId);
            if (dish) {
                dish.ingredientes.forEach((ing: any) => {
                    totalConsumed += (e.servingsConfirmed || 0) * (ing.perCapitaGrams || 0) / 1000;
                });
            }
        });

        return { totalPlanned, totalDelivered, totalConsumed };
    }, [menuPlans, executions, distributions]);

    const complianceRate = stats.totalPlanned > 0 ? (stats.totalDelivered / stats.totalPlanned) * 100 : 0;
    const consumptionRate = stats.totalDelivered > 0 ? (stats.totalConsumed / stats.totalDelivered) * 100 : 0;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <Scale className="w-8 h-8 text-emerald-600" />
                        Relatório Integrado de Suprimentos
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Planejamento × Entrega × Execução</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Necessidade Planejada</p>
                    <div className="flex justify-between items-end">
                        <h4 className="text-3xl font-black text-slate-800">{stats.totalPlanned.toFixed(1)} <span className="text-sm">kg</span></h4>
                        <LayoutDashboard className="w-8 h-8 text-slate-100" />
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Baseado em {menuPlans.length} Cardápios
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Entregue (ODs)</p>
                    <div className="flex justify-between items-end">
                        <h4 className="text-3xl font-black text-emerald-600">{stats.totalDelivered.toFixed(1)} <span className="text-sm">kg</span></h4>
                        <ArrowUpRight className="w-8 h-8 text-emerald-100" />
                    </div>
                    <div className={`pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold ${complianceRate < 90 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {complianceRate.toFixed(1)}% Comprometimento da Meta
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo Realizado</p>
                    <div className="flex justify-between items-end">
                        <h4 className="text-3xl font-black text-blue-600">{stats.totalConsumed.toFixed(1)} <span className="text-sm">kg</span></h4>
                        <ArrowDownRight className="w-8 h-8 text-blue-100" />
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-blue-500">
                        {consumptionRate.toFixed(1)}% do Estoque Enviado
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase">Análise de Desperdício</h4>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Inconsistências Logísticas</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(stats.totalDelivered - stats.totalConsumed) > (stats.totalPlanned * 0.1) && (
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-amber-400 mb-1">Alerta de Excedente</p>
                                    <p className="text-xs text-slate-300">Há um volume de entrega {(stats.totalDelivered - stats.totalConsumed).toFixed(1)}kg superior ao consumo registrado. Verifique sobras em estoque escolar.</p>
                                </div>
                            </div>
                        )}
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex gap-4">
                            <PackageSearch className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Aderência PNAE</p>
                                <p className="text-xs text-slate-300">O consumo está {Math.abs(100 - (stats.totalConsumed / stats.totalPlanned * 100)).toFixed(1)}% divergente do planejado nutricionalmente.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Desempenho por Escola (Top 5)</h4>
                    <div className="space-y-4">
                        {/* Mocking school comparison for visual completeness */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-xs">🏫</div>
                                    <span className="text-xs font-bold text-slate-700">Unidade Escolar {i}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-800">92% Compliance</p>
                                    <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[92%]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
