import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from './UI/Button';
import { PageHeader } from './UI/PageHeader';
import {
    Plus, Search, FileText, Trash2, Edit,
    ChevronRight, Utensils, Printer, Info, Users
} from 'lucide-react';
import { fndePreparacaoService, FNDEPreparacao } from '../services/fndePreparacaoService';
import { useToast } from '../contexts/ToastContext';
import PreparacaoEditor from './PreparacaoEditor';
import PreparacaoReport from './PreparacaoReport';
import { ConfirmModal } from './ConfirmModal';

/* Paleta rotativa para ícone do card */
const PALETTES = [
  { bg: 'linear-gradient(135deg,#d1fae5 0%,#6ee7b7 100%)', iconColor: '#065f46' },
  { bg: 'linear-gradient(135deg,#fef3c7 0%,#fcd34d 100%)', iconColor: '#78350f' },
  { bg: 'linear-gradient(135deg,#dbeafe 0%,#93c5fd 100%)', iconColor: '#1e3a5f' },
  { bg: 'linear-gradient(135deg,#fce7f3 0%,#f9a8d4 100%)', iconColor: '#831843' },
  { bg: 'linear-gradient(135deg,#ede9fe 0%,#c4b5fd 100%)', iconColor: '#4c1d95' },
  { bg: 'linear-gradient(135deg,#fee2e2 0%,#fca5a5 100%)', iconColor: '#7f1d1d' },
];
const getPalette = (i: number) => PALETTES[i % PALETTES.length];

const PreparacoesManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [preparacoes, setPreparacoes] = useState<FNDEPreparacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditorOpen = searchParams.get('editor') === 'true';
    const editingPrepId = searchParams.get('id');
    const [reportPrep, setReportPrep] = useState<FNDEPreparacao | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { addToast } = useToast();

    const loadPreparacoes = async () => {
        setIsLoading(true);
        try {
            const data = await fndePreparacaoService.list();
            setPreparacoes(data);
        } catch (err) {
            addToast("Erro ao carregar fichas técnicas.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadPreparacoes(); }, []);

    const filteredPreparacoes = useMemo(() =>
        preparacoes.filter(p =>
            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [preparacoes, searchTerm]);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setDeleteConfirmId(id); };
    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            await fndePreparacaoService.delete(deleteConfirmId);
            addToast("Ficha técnica excluída com sucesso!", "success");
            await loadPreparacoes();
        } catch { addToast("Erro ao excluir ficha técnica.", "error"); }
        finally { setIsDeleting(false); setDeleteConfirmId(null); }
    };
    const handleEdit = (id: string) => setSearchParams({ editor: 'true', id });
    const handleCreate = () => setSearchParams({ editor: 'true', id: 'new' });
    const handleSaveSuccess = () => { setSearchParams({}); loadPreparacoes(); };
    const handlePrint = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try { const data = await fndePreparacaoService.getById(id); setReportPrep(data); }
        catch { addToast("Erro ao carregar dados da ficha.", "error"); }
    };

    if (isEditorOpen) return (
        <PreparacaoEditor id={editingPrepId === 'new' ? null : editingPrepId}
            onClose={() => setSearchParams({})} onSave={handleSaveSuccess} />
    );
    if (reportPrep) return (
        <PreparacaoReport preparacao={reportPrep} onClose={() => setReportPrep(null)} />
    );

    return (
        <div className="min-h-screen bg-slate-100 -m-8 p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            <PageHeader
                title="Fichas Técnicas Digitais"
                subtitle="Composição Nutricional FNDE"
                icon={Utensils}
                actions={
                    <div className="flex gap-4">
                        <Button onClick={onClose} variant="outline"
                            className="bg-white border-2 border-slate-200 text-slate-900 font-black hover:bg-slate-50 rounded-2xl px-6 uppercase text-[10px] tracking-widest">
                            Voltar
                        </Button>
                        <Button onClick={handleCreate}
                            className="bg-slate-900 text-white hover:bg-black rounded-2xl px-8 shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 font-black uppercase text-[10px] tracking-widest">
                            <Plus className="w-4 h-4 mr-2" /> Nova Ficha Técnica
                        </Button>
                    </div>
                }
            />

            {/* BARRA DE PESQUISA */}
            <div style={{
                background: '#fff', borderRadius: 18,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                padding: '10px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <Search style={{ width: 17, height: 17, color: '#94a3b8', flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Pesquisar preparações por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 14, color: '#0f172a', fontFamily: 'inherit',
                    }}
                />
            </div>

            {/* GRID DE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse" style={{
                            background: '#fff', borderRadius: 22, height: 230,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        }} />
                    ))
                ) : filteredPreparacoes.length > 0 ? (
                    filteredPreparacoes.map((prep, index) => {
                        const pal = getPalette(index);
                        return (
                            <div
                                key={prep.id}
                                onClick={() => handleEdit(prep.id)}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: 20,
                                    border: '1px solid rgba(0,0,0,0.09)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.09)',
                                    cursor: 'pointer',
                                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                                    overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column',
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = 'translateY(-6px) scale(1.01)';
                                    el.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08), 0 24px 56px rgba(0,0,0,0.16), 0 48px 96px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = 'translateY(0) scale(1)';
                                    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.09)';
                                }}
                            >
                                {/* Topo colorido */}
                                <div style={{
                                    background: pal.bg,
                                    padding: '28px 22px 26px',
                                    minHeight: 110,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: 'rgba(255,255,255,0.75)',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 18px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
                                    }}>
                                        <FileText style={{ width: 21, height: 21, color: pal.iconColor }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        {[
                                            { action: (e: React.MouseEvent) => handlePrint(prep.id, e), icon: <Printer style={{ width: 13, height: 13 }} />, title: 'Imprimir / PDF', color: '#475569' },
                                            { action: (e: React.MouseEvent) => { e.stopPropagation(); handleEdit(prep.id); }, icon: <Edit style={{ width: 13, height: 13 }} />, title: 'Editar', color: '#059669' },
                                            { action: (e: React.MouseEvent) => handleDeleteClick(prep.id, e), icon: <Trash2 style={{ width: 13, height: 13 }} />, title: 'Excluir', color: '#e11d48' },
                                        ].map((btn, bi) => (
                                            <button key={bi} onClick={btn.action} title={btn.title}
                                                style={{
                                                    width: 31, height: 31, borderRadius: 8,
                                                    background: 'rgba(255,255,255,0.7)',
                                                    border: '1px solid rgba(255,255,255,0.85)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', color: btn.color,
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.09)'; }}
                                            >
                                                {btn.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Corpo */}
                                <div style={{ padding: '16px 18px 0', flex: 1 }}>
                                    <h3 style={{
                                        fontSize: 14.5, fontWeight: 800, color: '#0f172a',
                                        letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 5,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const,
                                    }}>
                                        {prep.nome}
                                    </h3>
                                    <p style={{
                                        fontSize: 12.5, color: '#64748b', lineHeight: 1.5,
                                        fontWeight: 400, height: 38,
                                        overflow: 'hidden', display: '-webkit-box',
                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                                    }}>
                                        {prep.descricao || "Sem descrição operacional registrada."}
                                    </p>
                                </div>

                                {/* Rodapé */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 18px 16px',
                                    borderTop: '1px solid #f1f5f9',
                                    margin: '12px 0 0',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                                            Rendimento
                                        </div>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                                            borderRadius: 7, padding: '3px 9px',
                                            fontSize: 12, fontWeight: 700, color: '#15803d',
                                        }}>
                                            <Users style={{ width: 11, height: 11 }} />
                                            {prep.rendimento_porcoes} {prep.rendimento_porcoes === 1 ? 'porção' : 'porções'}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: '7px 13px',
                                            background: '#f8fafc', border: '1px solid #e2e8f0',
                                            borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                                            color: '#475569', display: 'flex', alignItems: 'center', gap: 4,
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.background = '#f0fdf4'; el.style.color = '#15803d'; el.style.borderColor = '#bbf7d0';
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.background = '#f8fafc'; el.style.color = '#475569'; el.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        Visualizar <ChevronRight style={{ width: 13, height: 13 }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center"
                        style={{ background: '#f8fafc', borderRadius: 22, border: '2px dashed #e2e8f0' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🥘</div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            Nenhuma Ficha Encontrada
                        </h3>
                        <p style={{ color: '#64748b', fontSize: 13, maxWidth: 280, marginTop: 6 }}>
                            {searchTerm ? "Nenhuma preparação coincide com sua busca." : "Cadastre a primeira ficha técnica usando o botão acima."}
                        </p>
                    </div>
                )}
            </div>

            {/* DICA DE GESTÃO */}
            <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderLeft: '4px solid #22c55e',
                borderRadius: '0 16px 16px 0',
                padding: '14px 18px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
                <div style={{
                    padding: 6, borderRadius: 8,
                    background: '#dcfce7', color: '#15803d',
                    flexShrink: 0, marginTop: 1,
                }}>
                    <Info style={{ width: 16, height: 16 }} />
                </div>
                <div>
                    <h4 style={{
                        fontSize: 11, fontWeight: 800, color: '#14532d',
                        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3,
                    }}>
                        Dica de Gestão
                    </h4>
                    <p style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.6, fontWeight: 400 }}>
                        As Fichas Técnicas são reutilizáveis. Uma vez cadastradas, podem ser incorporadas
                        em qualquer cardápio da rede, garantindo que o valor nutricional calculado seja
                        sempre fiel à base FNDE.
                    </p>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteConfirmId}
                title="Excluir Ficha Técnica?"
                message={`Deseja realmente excluir a ficha "${preparacoes.find(p => p.id === deleteConfirmId)?.nome || ''}"? Esta ação não pode ser desfeita.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
                confirmLabel="Excluir Definitivamente"
                cancelLabel="Manter Ficha"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default PreparacoesManager;
