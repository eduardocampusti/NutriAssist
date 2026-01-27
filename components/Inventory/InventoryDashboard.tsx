
import React from 'react';
import { InventoryItem, InventoryBatch, Supplier, SupplierType, MovementType, InventoryCategory, InventoryMovement, LetterheadConfig, School } from '../../types';
import {
    TrendingUp,
    Sprout,
    AlertTriangle,
    Package,
    DollarSign,
    Clock,
    ShieldAlert,
    ChevronRight,
    Target,
    FileText,
    Printer,
    History,
    Activity
} from 'lucide-react';
import InventoryReportView from './InventoryReportView';

interface InventoryDashboardProps {
    inventory: InventoryItem[];
    batches: InventoryBatch[];
    suppliers: Supplier[];
    movements: InventoryMovement[];
    schools: School[];
    config?: LetterheadConfig;
}

const CircularProgress: React.FC<{
    percent: number,
    size?: number,
    strokeWidth?: number,
    color: string,
    label: string
}> = ({ percent, size = 120, strokeWidth = 10, color, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-slate-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                        strokeLinecap="round"
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-800 leading-none">{percent.toFixed(0)}%</span>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{label}</span>
        </div>
    );
};

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ inventory, batches, suppliers, movements, schools, config }) => {
    const [reportType, setReportType] = React.useState<'BALANCE' | 'VALIDITY' | 'MOVEMENTS' | 'LOW_STOCK' | 'FULL_STOCK' | 'PERISHABLE' | 'FAMILY_AGRI' | null>(null);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // 1. Calculations
    const totalValue = batches
        .filter(b => b.ativo && b.saldoAtual > 0)
        .reduce((acc, b) => acc + (b.saldoAtual * b.valorUnitario), 0);

    const agriBatches = batches.filter(b => {
        const supp = suppliers.find(s => s.id === b.supplierId);
        return supp?.tipo === SupplierType.AGRICULTOR;
    });

    const agriValue = agriBatches
        .filter(b => b.ativo && b.saldoAtual > 0)
        .reduce((acc, b) => acc + (b.saldoAtual * b.valorUnitario), 0);

    const agriPercent = totalValue > 0 ? (agriValue / totalValue) * 100 : 0;

    const expiredBatches = batches.filter(b => b.ativo && b.saldoAtual > 0 && b.validade < now);
    const nearExpirationBatches = batches.filter(b => b.ativo && b.saldoAtual > 0 && b.validade >= now && b.validade < now + thirtyDays);

    const totalActiveBatches = batches.filter(b => b.ativo && b.saldoAtual > 0).length;
    const validityRiskPercent = totalActiveBatches > 0
        ? ((expiredBatches.length + nearExpirationBatches.length) / totalActiveBatches) * 100
        : 0;

    const lowStockItems = inventory.filter(i => {
        const balance = batches.filter(b => b.itemId === i.id && b.ativo).reduce((acc, b) => acc + b.saldoAtual, 0);
        return i.ativo && balance < i.estoqueMinimo;
    });

    const stockIntegrityPercent = inventory.length > 0
        ? ((inventory.length - lowStockItems.length) / inventory.length) * 100
        : 0;

    // Category Health Data
    const categories = Object.values(InventoryCategory);
    const categoryStats = categories.map(cat => {
        const items = inventory.filter(i => i.categoria === cat && i.ativo);
        const critical = items.filter(i => {
            const balance = batches.filter(b => b.itemId === i.id && b.ativo).reduce((acc, b) => acc + b.saldoAtual, 0);
            return balance < i.estoqueMinimo;
        }).length;
        return {
            name: cat,
            total: items.length,
            critical,
            health: items.length > 0 ? ((items.length - critical) / items.length) * 100 : 100
        };
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* QUICK REPORTS TOOLBAR */}
            <div className="flex flex-wrap gap-4 print:hidden">
                {[
                    { id: 'LOW_STOCK', label: 'Ruptura (Acabando)', icon: AlertTriangle, desc: 'Abaixo do mínimo', color: 'text-red-600', bg: 'bg-red-50' },
                    { id: 'FULL_STOCK', label: 'Estoque Cheio', icon: ShieldAlert, desc: 'Níveis em conformidade', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'PERISHABLE', label: 'Perecíveis', icon: Clock, desc: 'Congelados/Hortifruti', color: 'text-orange-600', bg: 'bg-orange-50' },
                    { id: 'FAMILY_AGRI', label: 'Agri. Familiar', icon: Sprout, desc: 'PNAE 45% Conformidade', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { id: 'MOVEMENTS', label: 'Relatório Histórico', icon: History, desc: 'Extrato de movimentações', color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((rpt) => (
                    <button
                        key={rpt.id}
                        onClick={() => setReportType(rpt.id as any)}
                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group flex-1 min-w-[200px] text-left"
                    >
                        <div className={`w-10 h-10 ${rpt.bg} ${rpt.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <rpt.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">{rpt.label}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 opacity-60">{rpt.desc}</p>
                    </button>
                ))}
            </div>

            {/* SMART ALERTS BANNER */}
            {expiredBatches.length > 0 && (
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[32px] flex items-center justify-between shadow-2xl shadow-red-100/50 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-red-900 leading-tight">Ação Necessária: Produtos Vencidos</h3>
                            <p className="text-sm font-bold text-red-600/80 uppercase tracking-tight">
                                Detectamos {expiredBatches.length} lote(s) com validade expirada no depósito central.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setReportType('VALIDITY')}
                        className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        Gerar Relatório de Vencidos
                    </button>
                </div>
            )}

            {/* KPI STATUS MONITOR (CIRCULAR CHARTS) */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <Target className="w-4 h-4 text-indigo-500" />
                    Monitor de Conformidade e Saúde do Estoque
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                    <CircularProgress
                        percent={agriPercent}
                        color={agriPercent >= 30 ? 'text-emerald-500' : 'text-amber-500'}
                        label="Meta Agri. Familiar (45%)"
                    />
                    <CircularProgress
                        percent={stockIntegrityPercent}
                        color={stockIntegrityPercent >= 80 ? 'text-indigo-500' : 'text-orange-500'}
                        label="Integridade dos Níveis"
                    />
                    <CircularProgress
                        percent={100 - validityRiskPercent}
                        color={validityRiskPercent < 15 ? 'text-emerald-500' : 'text-red-500'}
                        label="Segurança de Validade"
                    />
                </div>
            </div>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Investido</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">
                        <span className="text-sm font-bold opacity-30 mr-1">R$</span>
                        {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100">
                        <Sprout className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem PNAE</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{agriPercent.toFixed(1)}%</h3>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase mt-2">Agri. Familiar</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 border border-orange-100">
                        <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenção Validade</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{nearExpirationBatches.length} <span className="text-sm font-bold opacity-30">LOTES</span></h3>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 border border-red-100">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruptura de Estoque</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{lowStockItems.length} <span className="text-sm font-bold opacity-30">ITENS</span></h3>
                </div>
            </div>

            {/* CATEGORY HEALTH BAR CHART */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <Package className="w-4 h-4 text-emerald-500" />
                    Saúde por Categoria de Alimento
                </h4>
                <div className="space-y-6">
                    {categoryStats.map(stat => (
                        <div key={stat.name} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.name}</span>
                                <span className="text-[10px] font-black text-slate-400">{stat.total - stat.critical} / {stat.total} ITENS OK</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div
                                    className={`h-full transition-all duration-1000 ${stat.health === 100 ? 'bg-emerald-500' : stat.health > 70 ? 'bg-indigo-500' : 'bg-orange-500'}`}
                                    style={{ width: `${stat.health}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* EXPIRATION ALERTS LIST */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 transition-all hover:shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" /> Fluxo de Validade (PVPS)
                        </h4>
                        <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase">Top 5 Críticos</span>
                    </div>
                    <div className="space-y-4">
                        {batches
                            .filter(b => b.ativo && b.saldoAtual > 0 && b.validade < now + (90 * 24 * 60 * 60 * 1000))
                            .sort((a, b) => a.validade - b.validade)
                            .slice(0, 5)
                            .map(b => {
                                const item = inventory.find(i => i.id === b.itemId);
                                const daysLeft = Math.ceil((b.validade - now) / (1000 * 60 * 60 * 24));
                                const isCritical = daysLeft < 30;
                                const isExpired = daysLeft < 0;

                                return (
                                    <div key={b.id} className="group relative flex justify-between items-center p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isExpired ? 'bg-red-50 text-red-600' : isCritical ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {isExpired ? '❌' : isCritical ? '⚠️' : '✅'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase leading-none">{item?.nome}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">LOTE: {b.loteCod} • {b.saldoAtual} {item?.unidadeMedida}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isExpired ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                {isExpired ? 'EXPIRADO' : `EM ${daysLeft} DIAS`}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 opacity-60">
                                                {new Date(b.validade).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        {nearExpirationBatches.length === 0 && expiredBatches.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                    <Package className="w-8 h-8" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium italic">Todos os lotes dentro da validade.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CRITICAL STOCK ALERTS */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 transition-all hover:shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" /> Rupturas Identificadas
                        </h4>
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase">Reposição Urgente</span>
                    </div>
                    <div className="space-y-4">
                        {lowStockItems.slice(0, 5).map(item => {
                            const balance = batches.filter(b => b.itemId === item.id && b.ativo).reduce((acc, b) => acc + b.saldoAtual, 0);
                            const deficitPercent = Math.min(100, Math.max(0, (balance / item.estoqueMinimo) * 100));

                            return (
                                <div key={item.id} className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase leading-none">{item.nome}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Mínimo: {item.estoqueMinimo} {item.unidadeMedida}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-red-600">{balance} {item.unidadeMedida}</p>
                                            <p className="text-[9px] font-bold text-red-400 uppercase">Disponível</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 transition-all duration-1000"
                                            style={{ width: `${deficitPercent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {lowStockItems.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium italic">Nenhum item abaixo do estoque mínimo.</p>
                            </div>
                        )}
                        {lowStockItems.length > 5 && (
                            <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                                Ver mais {lowStockItems.length - 5} alertas <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* REPORT MODAL */}
            {reportType && (
                <InventoryReportView
                    type={reportType}
                    inventory={inventory}
                    batches={batches}
                    movements={movements}
                    suppliers={suppliers}
                    schools={schools}
                    config={config}
                    onClose={() => setReportType(null)}
                />
            )}
        </div>
    );
};

export default InventoryDashboard;
