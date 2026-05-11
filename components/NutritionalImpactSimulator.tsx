import React, { useState, useEffect, useMemo } from 'react';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import { simulationService, ImpactSimulation } from '../services/simulationService';
import { normativeService } from '../services/normativeService';
import { generateTechnicalDocument } from '../services/geminiService';
import { NormativeFood, UserRole } from '../types';
import { Play, AlertOctagon, Users, School, Zap, FileText, RefreshCw, Search, CheckCircle2, X } from 'lucide-react';
import { OfficialDocumentViewer } from './OfficialDocumentViewer';

const S  = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';
const SH = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';

const NutritionalImpactSimulator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeProfile } = useUsers();
    const { letterhead } = usePNAE();
    const [normativeFoods, setNormativeFoods] = useState<NormativeFood[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [durationDays, setDurationDays] = useState(7);
    const [simulation, setSimulation] = useState<ImpactSimulation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [technicalOpinion, setTechnicalOpinion] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        normativeService.getAll().then(setNormativeFoods).catch(() => {});
    }, []);

    const filteredFoods = useMemo(() =>
        normativeFoods.filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase())),
        [normativeFoods, searchTerm]);

    const handleRunSimulation = async () => {
        if (!selectedItemId) return;
        setIsLoading(true);
        try {
            const item = normativeFoods.find(f => f.id === selectedItemId);
            const result = await simulationService.runSimulation(selectedItemId, durationDays, item?.nome || '');
            setSimulation(result);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleGenerateOpinion = async () => {
        if (!simulation) return;
        setIsGenerating(true);
        try {
            const doc = await generateTechnicalDocument('PARECER', 'PARECER',
                { item: simulation.itemName, duracao: `${simulation.durationDays} dias`, alunos_impactados: simulation.totalStudentsAffected },
                `Simulação de ausência de ${simulation.itemName}.`, activeProfile?.role || UserRole.NUTRICIONISTA);
            setTechnicalOpinion(doc);
        } catch (e) { console.error(e); }
        finally { setIsGenerating(false); }
    };

    const IMPACT_STYLE: Record<string, { bg: string; color: string; border: string; gradient: string }> = {
        ALTO:  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', gradient: 'linear-gradient(135deg,#fee2e2,#fca5a5)' },
        MÉDIO: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', gradient: 'linear-gradient(135deg,#fef3c7,#fcd34d)' },
        BAIXO: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', gradient: 'linear-gradient(135deg,#d1fae5,#6ee7b7)' },
    };
    const imp = simulation ? (IMPACT_STYLE[simulation.impactScore] || IMPACT_STYLE['BAIXO']) : null;

    return (
        <div style={{ paddingBottom: 80 }} className="animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(5,150,105,0.2)', flexShrink: 0 }}>
                            <Zap style={{ width: 22, height: 22, color: '#065f46' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#064e3b', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Simulador de Impacto</h2>
                            <p style={{ fontSize: 12, color: '#059669', margin: 0, fontWeight: 600 }}>Previsão Nutricional · Contingência PNAE</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(6,78,59,0.15)', color: '#065f46', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <X style={{ width: 13, height: 13 }} /> Fechar
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>

                {/* PAINEL ESQUERDO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Parâmetros */}
                    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding: '14px 18px', borderBottom: '1px solid #bbf7d0' }}>
                            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Configuração</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Parâmetros de Ausência</p>
                        </div>
                        <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Busca */}
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Item Alimentar</label>
                                <div style={{ position: 'relative', marginBottom: 8 }}>
                                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
                                    <input type="text" placeholder="Filtrar item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px 9px 36px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)}
                                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, outline: 'none', color: '#0f172a' }}>
                                    <option value="">Selecione o Insumo</option>
                                    {filteredFoods.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                            </div>

                            {/* Período */}
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Período de Ruptura</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
                                    {[{ v: 1, l: '1 Dia' }, { v: 7, l: '1 Semana' }, { v: 30, l: '1 Mês' }].map(d => (
                                        <button key={d.v} onClick={() => setDurationDays(d.v)}
                                            style={{ padding: '8px', borderRadius: 9, fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.04em',
                                                background: durationDays === d.v ? '#059669' : '#f8fafc',
                                                color: durationDays === d.v ? '#fff' : '#64748b',
                                                border: `1px solid ${durationDays === d.v ? '#059669' : '#e2e8f0'}`,
                                                boxShadow: durationDays === d.v ? '0 3px 10px rgba(5,150,105,0.3)' : 'none',
                                            }}>
                                            {d.l}
                                        </button>
                                    ))}
                                </div>
                                <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))}
                                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontWeight: 800, fontFamily: 'inherit', outline: 'none', color: '#0f172a', boxSizing: 'border-box' }} />
                            </div>

                            {/* Botão executar */}
                            <button onClick={handleRunSimulation} disabled={!selectedItemId || isLoading}
                                style={{ width: '100%', padding: '12px', background: !selectedItemId || isLoading ? '#f1f5f9' : 'linear-gradient(135deg,#059669,#15803d)', color: !selectedItemId || isLoading ? '#94a3b8' : '#fff', borderRadius: 12, border: 'none', fontSize: 12, fontWeight: 800, cursor: !selectedItemId || isLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: selectedItemId && !isLoading ? '0 4px 14px rgba(5,150,105,0.35)' : 'none', transition: 'all 0.15s' }}>
                                {isLoading ? <><RefreshCw style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Analisando...</> : <><Play style={{ width: 14, height: 14 }} /> Executar Simulação</>}
                            </button>
                        </div>
                    </div>

                    {/* Aviso */}
                    <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.12)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Zap style={{ width: 15, height: 15, color: '#fbbf24' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Aviso de Integridade</p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>As simulações não alteram dados reais de estoque ou cardápio. Use para planejar contingências.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAINEL DIREITO */}
                <div>
                    {!simulation ? (
                        <div style={{ background: '#f0fdf4', borderRadius: 18, border: '2px dashed #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, textAlign: 'center', minHeight: 420 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Zap style={{ width: 26, height: 26, color: '#15803d' }} />
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#15803d', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Dashboard Vazio</h3>
                            <p style={{ fontSize: 12, color: '#86efac', maxWidth: 240, lineHeight: 1.6, margin: 0 }}>Selecione um item e período para iniciar a análise de impacto.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in fade-in zoom-in-95 duration-500">

                            {/* KPI IMPACT CARDS */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                {/* Score */}
                                <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: S, transition: 'all 0.2s' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH; el.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = S; el.style.transform = 'translateY(0)'; }}>
                                    <div style={{ background: imp!.gradient, padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                                            <AlertOctagon style={{ width: 17, height: 17, color: imp!.color }} />
                                        </div>
                                        <span style={{ fontSize: 9.5, fontWeight: 700, color: imp!.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risco Logístico</span>
                                    </div>
                                    <div style={{ background: '#fff', padding: '14px 18px 18px' }}>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: imp!.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{simulation.impactScore}</div>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>Nível de Impacto</p>
                                    </div>
                                </div>

                                {/* Alunos */}
                                <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: S, transition: 'all 0.2s' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH; el.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = S; el.style.transform = 'translateY(0)'; }}>
                                    <div style={{ background: 'linear-gradient(135deg,#dbeafe,#93c5fd)', padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users style={{ width: 17, height: 17, color: '#1e3a5f' }} />
                                        </div>
                                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Alunos Afetados</span>
                                    </div>
                                    <div style={{ background: '#fff', padding: '14px 18px 18px' }}>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>{simulation.totalStudentsAffected.toLocaleString('pt-BR')}</div>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>Matrículas impactadas</p>
                                    </div>
                                </div>

                                {/* Escolas */}
                                <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: S, transition: 'all 0.2s' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = SH; el.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = S; el.style.transform = 'translateY(0)'; }}>
                                    <div style={{ background: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <School style={{ width: 17, height: 17, color: '#4c1d95' }} />
                                        </div>
                                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#4c1d95', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Escolas Atingidas</span>
                                    </div>
                                    <div style={{ background: '#fff', padding: '14px 18px 18px' }}>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>{simulation.schoolsAffectedCount}</div>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>Unidades escolares</p>
                                    </div>
                                </div>
                            </div>

                            {/* DETALHAMENTO NUTRICIONAL */}
                            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', boxShadow: S, overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Zap style={{ width: 15, height: 15, color: '#15803d' }} />
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Comprometimento Nutricional Esperado</p>
                                </div>
                                <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {simulation.nutritionalLoss.map((loss, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{loss.nutrient}</span>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626' }}>-{loss.impactPercent}%</span>
                                                </div>
                                                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: 99, width: `${loss.impactPercent}%`, transition: 'width 1s ease' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 18px', border: '1px solid #f1f5f9' }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Modalidades Afetadas</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {simulation.stagesAffected.map(s => (
                                                <span key={s} style={{ fontSize: 9.5, fontWeight: 700, padding: '4px 10px', borderRadius: 7, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase' }}>{s}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', flexShrink: 0, boxShadow: '0 0 0 3px rgba(220,38,38,0.15)', display: 'inline-block' }} />
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', margin: 0 }}>Revisão Urgente: {simulation.menusAffectedCount} Planos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SUBSTITUIÇÕES */}
                            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 18, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                        <CheckCircle2 style={{ width: 17, height: 17, color: '#34d399' }} />
                                        <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>Substituições Técnicas Equivalentes</p>
                                    </div>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.08)' }}>Mesmo Grupo</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                                    {simulation.suggestedSubstitutes.map(sub => (
                                        <div key={sub.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', transition: 'all 0.15s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.10)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                                            <p style={{ fontSize: 9, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{sub.grupo_alimentar}</p>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{sub.nome}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FileText style={{ width: 11, height: 11, color: '#64748b' }} />
                                                <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Padrão PNAE</span>
                                            </div>
                                        </div>
                                    ))}
                                    {simulation.suggestedSubstitutes.length === 0 && (
                                        <div style={{ gridColumn: '1/-1', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                                            <p style={{ fontSize: 11, color: '#f87171', fontWeight: 700, margin: 0 }}>Nenhuma substituição direta encontrada no catálogo normativo.</p>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleGenerateOpinion} disabled={isGenerating}
                                        style={{ flex: 1, padding: '11px', background: isGenerating ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#059669,#15803d)', color: '#fff', borderRadius: 11, border: 'none', fontSize: 11, fontWeight: 800, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: isGenerating ? 'none' : '0 4px 14px rgba(5,150,105,0.4)', transition: 'all 0.15s' }}>
                                        {isGenerating ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <FileText style={{ width: 14, height: 14 }} />}
                                        {isGenerating ? 'Gerando Fundamentação...' : 'Gerar Parecer Técnico (IA)'}
                                    </button>
                                    <button onClick={() => window.print()}
                                        style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Imprimir
                                    </button>
                                </div>
                            </div>

                            {technicalOpinion && (
                                <OfficialDocumentViewer content={technicalOpinion} config={letterhead} onClose={() => setTechnicalOpinion(null)} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionalImpactSimulator;
