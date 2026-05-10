import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from './UI/PageHeader';
import {
    ShieldCheck, BarChart3, FileText, Gavel,
    TrendingUp, CheckCircle2, AlertCircle,
    Download, ChevronRight, School, Users, Award
} from 'lucide-react';
import { nutritionalDashboardService, ZoneHealth, ManagementAlert } from '../services/nutritionalDashboardService';
import ZoneRiskMap from './ZoneRiskMap';
import { usePNAE } from '../contexts/PNAEContext';

/* sombra padrão do projeto */
const SHADOW_BASE = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';
const SHADOW_HOVER = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13), 0 40px 72px rgba(0,0,0,0.09)';

const SecretaryExecutiveDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { letterhead } = usePNAE();
    const [zoneData, setZoneData] = useState<ZoneHealth[]>([]);
    const [alerts, setAlerts] = useState<ManagementAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [zones, strategic] = await Promise.all([
                    nutritionalDashboardService.getZoneHealth(),
                    nutritionalDashboardService.getExecutiveAlerts()
                ]);
                setZoneData(zones);
                setAlerts(strategic);
            } catch (err) {
                console.error('Erro painel executivo:', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const metrics = useMemo(() => {
        const totalSchools  = zoneData.reduce((a, z) => a + z.total_escolas_na_zona, 0);
        const totalAdequate = zoneData.reduce((a, z) => a + z.escolas_adequadas, 0);
        const avgCompliance = zoneData.length > 0
            ? zoneData.reduce((a, z) => a + z.perc_conformidade_zona, 0) / zoneData.length
            : 0;
        return { totalSchools, totalAdequate, avgCompliance };
    }, [zoneData]);

    if (isLoading) return (
        <div style={{ padding: 64, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Consolidando Governança Municipal...
        </div>
    );

    return (
        <div style={{ paddingBottom: 96 }} className="animate-in fade-in duration-700">
            <PageHeader
                title="Governança Nutricional Municipal"
                subtitle={`Painel Executivo Estratégico • ${letterhead.municipio || 'SME'}`}
                icon={ShieldCheck}
            />

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, margin: '28px 0 20px' }}>

                {/* Card 1 — Eficiência: escuro premium */}
                <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    boxShadow: SHADOW_BASE,
                    transition: 'all 0.22s ease',
                }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_HOVER; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_BASE; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                    <div style={{ background: 'linear-gradient(135deg,#d1fae5 0%,#6ee7b7 100%)', padding: '18px 22px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <ShieldCheck style={{ width: 20, height: 20, color: '#065f46' }} />
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eficiência Nutricional</span>
                    </div>
                    <div style={{ background: '#fff', padding: '18px 22px 20px' }}>
                        <div style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                            {metrics.avgCompliance.toFixed(1)}<span style={{ fontSize: 22, color: '#059669' }}>%</span>
                        </div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                            Índice Municipal de Conformidade
                        </p>
                    </div>
                </div>

                {/* Card 2 — Rede Ativa */}
                <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    boxShadow: SHADOW_BASE,
                    transition: 'all 0.22s ease',
                }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_HOVER; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_BASE; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                    <div style={{ background: 'linear-gradient(135deg,#dbeafe 0%,#93c5fd 100%)', padding: '18px 22px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <Users style={{ width: 20, height: 20, color: '#1e3a5f' }} />
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rede Ativa</span>
                    </div>
                    <div style={{ background: '#fff', padding: '18px 22px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>{metrics.totalSchools}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Unidades</span>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '3px 9px' }}>
                            <CheckCircle2 style={{ width: 11, height: 11, color: '#059669' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>{metrics.totalAdequate} em Plenitude</span>
                        </div>
                    </div>
                </div>

                {/* Card 3 — Gestão do Risco */}
                <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    boxShadow: SHADOW_BASE,
                    transition: 'all 0.22s ease',
                }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_HOVER; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOW_BASE; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                    <div style={{ background: 'linear-gradient(135deg,#fef3c7 0%,#fcd34d 100%)', padding: '18px 22px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <TrendingUp style={{ width: 20, height: 20, color: '#78350f' }} />
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gestão do Risco</span>
                    </div>
                    <div style={{ background: '#fff', padding: '18px 22px 20px' }}>
                        <div style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                            {alerts.length}
                        </div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                            Pontos de Atenção Identificados
                        </p>
                    </div>
                </div>
            </div>

            {/* VIGILÂNCIA + ALERTAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, marginBottom: 20 }}>

                {/* Mapa de Zona */}
                <div style={{
                    background: '#fff', borderRadius: 20,
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: SHADOW_BASE,
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 style={{ width: 17, height: 17, color: '#15803d' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Consolidado por Zona</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Vigilância Geográfica</p>
                        </div>
                    </div>
                    <div style={{ padding: '0 4px 4px' }}>
                        <ZoneRiskMap data={zoneData} />
                    </div>
                </div>

                {/* Alertas */}
                <div style={{
                    background: '#fff', borderRadius: 20,
                    border: '1px solid rgba(0,0,0,0.07)',
                    borderLeft: '4px solid #f43f5e',
                    borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                    boxShadow: SHADOW_BASE,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <AlertCircle style={{ width: 17, height: 17, color: '#f43f5e', flexShrink: 0 }} />
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Monitoramento Preventivo</p>
                    </div>
                    <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {alerts.length > 0 ? alerts.map((alert, idx) => (
                            <div key={idx} style={{
                                background: '#fff1f2', border: '1px solid #fecdd3',
                                borderRadius: 14, padding: '12px 14px',
                                boxShadow: '0 1px 4px rgba(244,63,94,0.08)',
                            }}>
                                <p style={{ fontSize: 9.5, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                                    {alert.tipo.replace(/_/g, ' ')}
                                </p>
                                <p style={{ fontSize: 12, color: '#9f1239', lineHeight: 1.5, marginBottom: 8 }}>{alert.mensagem}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#be123c' }}>
                                    <ShieldCheck style={{ width: 11, height: 11 }} />
                                    Impacto Legal PNAE: Crítico
                                </div>
                            </div>
                        )) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 style={{ width: 24, height: 24, color: '#22c55e' }} />
                                </div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
                                    Nenhuma anormalidade<br/>sistêmica detectada
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AÇÕES ESTRATÉGICAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { label: 'Gerar Relatório CAE', desc: 'Conselho Alimentar Escolar', icon: FileText, accent: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', onClick: () => {} },
                    { label: 'Extração FNDE SigPC', desc: 'Exportar para sistema federal', icon: Download, accent: '#b45309', bg: '#fffbeb', border: '#fde68a', onClick: () => {} },
                    { label: 'Base Legal e Portarias', desc: 'Normativas e regulamentos', icon: Gavel, accent: '#0f172a', bg: '#f8fafc', border: '#e2e8f0', onClick: () => {} },
                    { label: 'Certificações', desc: 'Qualidade e conformidade', icon: Award, accent: '#059669', bg: '#f0fdf4', border: '#bbf7d0', onClick: () => navigate('/ranking-evolucao') },
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        style={{
                            background: '#fff',
                            borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)',
                            boxShadow: SHADOW_BASE,
                            padding: 0, cursor: 'pointer', textAlign: 'left',
                            overflow: 'hidden', transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                            display: 'flex', flexDirection: 'column',
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = 'translateY(-4px) scale(1.01)';
                            el.style.boxShadow = SHADOW_HOVER;
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = 'translateY(0) scale(1)';
                            el.style.boxShadow = SHADOW_BASE;
                        }}
                    >
                        {/* Barra de cor */}
                        <div style={{ height: 4, background: item.accent }} />
                        <div style={{ padding: '16px 18px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 11,
                                    background: item.bg, border: `1px solid ${item.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                }}>
                                    <item.icon style={{ width: 19, height: 19, color: item.accent }} />
                                </div>
                                <ChevronRight style={{ width: 15, height: 15, color: '#cbd5e1', marginTop: 4 }} />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                                {item.label}
                            </p>
                            <p style={{ fontSize: 11.5, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                {item.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SecretaryExecutiveDashboard;
