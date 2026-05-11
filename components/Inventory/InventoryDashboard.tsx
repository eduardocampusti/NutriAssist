import React from 'react';
import { InventoryItem, InventoryBatch, Supplier, SupplierType, MovementType, InventoryCategory, InventoryMovement, LetterheadConfig, School } from '../../types';
import {
    TrendingUp, Sprout, AlertTriangle, Package,
    DollarSign, Clock, ShieldAlert, ChevronRight,
    Target, FileText, Printer, History, Activity
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

const S = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';
const SH = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13), 0 40px 72px rgba(0,0,0,0.09)';

const CircularProgress: React.FC<{
    percent: number; size?: number; strokeWidth?: number; color: string; label: string; accent: string;
}> = ({ percent, size = 130, strokeWidth = 11, color, label, accent }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size/2} cy={size/2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
                    <circle cx={size/2} cy={size/2} r={radius} stroke={accent} strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                        strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{percent.toFixed(0)}%</span>
                </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>{label}</span>
        </div>
    );
};

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ inventory, batches, suppliers, movements, schools, config }) => {
    const [reportType, setReportType] = React.useState<'BALANCE'|'VALIDITY'|'MOVEMENTS'|'LOW_STOCK'|'FULL_STOCK'|'PERISHABLE'|'FAMILY_AGRI'|null>(null);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const totalValue = batches.filter(b => b.ativo && b.saldoAtual > 0).reduce((acc, b) => acc + (b.saldoAtual * b.valorUnitario), 0);
    const agriBatches = batches.filter(b => { const s = suppliers.find(x => x.id === b.supplierId); return s?.tipo === SupplierType.AGRICULTOR; });
    const agriValue = agriBatches.filter(b => b.ativo && b.saldoAtual > 0).reduce((acc, b) => acc + (b.saldoAtual * b.valorUnitario), 0);
    const agriPercent = totalValue > 0 ? (agriValue / totalValue) * 100 : 0;
    const expiredBatches = batches.filter(b => b.ativo && b.saldoAtual > 0 && b.validade < now);
    const nearExpirationBatches = batches.filter(b => b.ativo && b.saldoAtual > 0 && b.validade >= now && b.validade < now + thirtyDays);
    const totalActiveBatches = batches.filter(b => b.ativo && b.saldoAtual > 0).length;
    const validityRiskPercent = totalActiveBatches > 0 ? ((expiredBatches.length + nearExpirationBatches.length) / totalActiveBatches) * 100 : 0;
    const lowStockItems = inventory.filter(i => { const bal = batches.filter(b => b.itemId === i.id && b.ativo).reduce((a, b) => a + b.saldoAtual, 0); return i.ativo && bal < i.estoqueMinimo; });
    const stockIntegrityPercent = inventory.length > 0 ? ((inventory.length - lowStockItems.length) / inventory.length) * 100 : 0;
    const categories = Object.values(InventoryCategory);
    const categoryStats = categories.map(cat => {
        const items = inventory.filter(i => i.categoria === cat && i.ativo);
        const critical = items.filter(i => { const bal = batches.filter(b => b.itemId === i.id && b.ativo).reduce((a, b) => a + b.saldoAtual, 0); return bal < i.estoqueMinimo; }).length;
        return { name: cat, total: items.length, critical, health: items.length > 0 ? ((items.length - critical) / items.length) * 100 : 100 };
    });

    const REPORTS = [
        { id: 'LOW_STOCK',  label: 'Ruptura (Acabando)',    icon: AlertTriangle, desc: 'Abaixo do mínimo',        accent: '#dc2626', bg: 'linear-gradient(135deg,#fee2e2,#fca5a5)', iconColor: '#991b1b' },
        { id: 'FULL_STOCK', label: 'Estoque Cheio',         icon: ShieldAlert,   desc: 'Níveis em conformidade',  accent: '#059669', bg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', iconColor: '#065f46' },
        { id: 'PERISHABLE', label: 'Perecíveis',            icon: Clock,         desc: 'Congelados/Hortifruti',   accent: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fcd34d)', iconColor: '#78350f' },
        { id: 'FAMILY_AGRI',label: 'Agri. Familiar',        icon: Sprout,        desc: 'PNAE 45% Conformidade',   accent: '#4f46e5', bg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', iconColor: '#3730a3' },
        { id: 'MOVEMENTS',  label: 'Relatório Histórico',   icon: History,       desc: 'Extrato de movimentações',accent: '#1d4ed8', bg: 'linear-gradient(135deg,#dbeafe,#93c5fd)', iconColor: '#1e3a5f' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* QUICK REPORTS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {REPORTS.map((rpt) => (
                    <button key={rpt.id} onClick={() => setReportType(rpt.id as any)}
                        style={{ flex: '1 1 180px', background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(-4px) scale(1.02)'; el.style.boxShadow = SH; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(0) scale(1)'; el.style.boxShadow = S; }}>
                        <div style={{ background: rpt.bg, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                                <rpt.icon style={{ width: 18, height: 18, color: rpt.iconColor }} />
                            </div>
                        </div>
                        <div style={{ padding: '10px 16px 14px' }}>
                            <p style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 3px' }}>{rpt.label}</p>
                            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{rpt.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ALERT BANNER */}
            {expiredBatches.length > 0 && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderLeft: '4px solid #dc2626', borderRadius: '0 16px 16px 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 4px 16px rgba(220,38,38,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#dc2626,#991b1b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220,38,38,0.3)', flexShrink: 0 }}>
                            <ShieldAlert style={{ width: 20, height: 20, color: '#fff' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Ação Necessária: Produtos Vencidos</p>
                            <p style={{ fontSize: 11, color: '#b91c1c', margin: 0, fontWeight: 600 }}>{expiredBatches.length} lote(s) com validade expirada no depósito central</p>
                        </div>
                    </div>
                    <button onClick={() => setReportType('VALIDITY')}
                        style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(220,38,38,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Ver Relatório
                    </button>
                </div>
            )}

            {/* MONITOR CIRCULAR */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target style={{ width: 17, height: 17, color: '#4f46e5' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Saúde do Estoque</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Monitor de Conformidade</p>
                    </div>
                </div>
                <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                    <CircularProgress percent={agriPercent} accent={agriPercent >= 30 ? '#059669' : '#d97706'} color="" label="Meta Agri. Familiar (45%)" />
                    <CircularProgress percent={stockIntegrityPercent} accent={stockIntegrityPercent >= 80 ? '#4f46e5' : '#f97316'} color="" label="Integridade dos Níveis" />
                    <CircularProgress percent={100 - validityRiskPercent} accent={validityRiskPercent < 15 ? '#059669' : '#dc2626'} color="" label="Segurança de Validade" />
                </div>
            </div>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { label: 'Valor Investido', value: `R$ ${totalValue.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, sub: null, icon: DollarSign, bg: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', iconColor: '#065f46', valColor: '#0f172a' },
                    { label: 'Origem PNAE', value: `${agriPercent.toFixed(1)}%`, sub: 'Agri. Familiar', icon: Sprout, bg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', iconColor: '#3730a3', valColor: '#4f46e5' },
                    { label: 'Atenção Validade', value: nearExpirationBatches.length.toString(), sub: 'LOTES', icon: Clock, bg: 'linear-gradient(135deg,#fef3c7,#fcd34d)', iconColor: '#78350f', valColor: '#0f172a' },
                    { label: 'Ruptura de Estoque', value: lowStockItems.length.toString(), sub: 'ITENS', icon: AlertTriangle, bg: 'linear-gradient(135deg,#fee2e2,#fca5a5)', iconColor: '#991b1b', valColor: '#dc2626' },
                ].map((k) => (
                    <div key={k.label} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: S, transition: 'all 0.22s ease' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH; el.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = S; el.style.transform = 'translateY(0)'; }}>
                        <div style={{ background: k.bg, padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                                <k.icon style={{ width: 18, height: 18, color: k.iconColor }} />
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: k.iconColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</span>
                        </div>
                        <div style={{ padding: '14px 18px 18px' }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: k.valColor, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
                            {k.sub && <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{k.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* SAÚDE POR CATEGORIA */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding: '16px 22px', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package style={{ width: 17, height: 17, color: '#15803d' }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Saúde por Categoria de Alimento</p>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {categoryStats.map(stat => (
                        <div key={stat.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.name}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{stat.total - stat.critical} / {stat.total} OK</span>
                            </div>
                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 99, background: stat.health === 100 ? '#22c55e' : stat.health > 70 ? '#4f46e5' : '#f97316', width: `${stat.health}%`, transition: 'width 1s ease' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* VALIDADE + RUPTURAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Validade */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fcd34d)', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <Clock style={{ width: 17, height: 17, color: '#92400e' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Fluxo de Validade (PVPS)</p>
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#92400e', background: 'rgba(255,255,255,0.7)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(146,64,14,0.2)', textTransform: 'uppercase' }}>Top 5</span>
                    </div>
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {batches.filter(b => b.ativo && b.saldoAtual > 0 && b.validade < now + (90*24*60*60*1000))
                            .sort((a,b) => a.validade - b.validade).slice(0,5).map(b => {
                            const item = inventory.find(i => i.id === b.itemId);
                            const daysLeft = Math.ceil((b.validade - now) / (1000*60*60*24));
                            const isExp = daysLeft < 0, isCrit = daysLeft < 30;
                            return (
                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: isExp ? '#fff1f2' : isCrit ? '#fff7ed' : '#f8fafc', borderRadius: 12, border: `1px solid ${isExp ? '#fecdd3' : isCrit ? '#fed7aa' : '#f1f5f9'}` }}>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{item?.nome}</p>
                                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>LOTE: {b.loteCod} · {b.saldoAtual} {item?.unidadeMedida}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 10, fontWeight: 800, color: isExp ? '#dc2626' : isCrit ? '#d97706' : '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>
                                            {isExp ? 'Expirado' : `${daysLeft}d`}
                                        </p>
                                        <p style={{ fontSize: 9.5, color: '#94a3b8', margin: 0 }}>{new Date(b.validade).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {nearExpirationBatches.length === 0 && expiredBatches.length === 0 && (
                            <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                <div style={{ width: 44, height: 44, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                    <Package style={{ width: 20, height: 20, color: '#22c55e' }} />
                                </div>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Todos os lotes dentro da validade</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rupturas */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg,#fee2e2,#fca5a5)', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <AlertTriangle style={{ width: 17, height: 17, color: '#991b1b' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Rupturas Identificadas</p>
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#991b1b', background: 'rgba(255,255,255,0.7)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(153,27,27,0.2)', textTransform: 'uppercase' }}>Urgente</span>
                    </div>
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {lowStockItems.slice(0,5).map(item => {
                            const bal = batches.filter(b => b.itemId === item.id && b.ativo).reduce((a,b) => a + b.saldoAtual, 0);
                            const pct = Math.min(100, Math.max(0, (bal / item.estoqueMinimo) * 100));
                            return (
                                <div key={item.id} style={{ padding: '10px 12px', background: '#fff1f2', borderRadius: 12, border: '1px solid #fecdd3', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{item.nome}</p>
                                            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>Mínimo: {item.estoqueMinimo} {item.unidadeMedida}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: '0 0 2px' }}>{bal}</p>
                                            <p style={{ fontSize: 9.5, color: '#f87171', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Disponível</p>
                                        </div>
                                    </div>
                                    <div style={{ height: 6, background: '#fecdd3', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: '#dc2626', borderRadius: 99, width: `${pct}%`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {lowStockItems.length === 0 && (
                            <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                <div style={{ width: 44, height: 44, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                    <ShieldAlert style={{ width: 20, height: 20, color: '#22c55e' }} />
                                </div>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Nenhum item abaixo do estoque mínimo</p>
                            </div>
                        )}
                        {lowStockItems.length > 5 && (
                            <button style={{ width: '100%', padding: '10px', fontSize: 10, fontWeight: 700, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                Ver mais {lowStockItems.length - 5} alertas <ChevronRight style={{ width: 12, height: 12 }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {reportType && (
                <InventoryReportView type={reportType} inventory={inventory} batches={batches}
                    movements={movements} suppliers={suppliers} schools={schools} config={config}
                    onClose={() => setReportType(null)} />
            )}
        </div>
    );
};

export default InventoryDashboard;
