import React, { useEffect, useState, useMemo } from 'react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { PageHeader } from './UI/PageHeader';
import {
    Plus,
    Search,
    FileText,
    Trash2,
    Edit,
    ChevronRight,
    Utensils,
    Printer,
    Info
} from 'lucide-react';
import { fndePreparacaoService, FNDEPreparacao } from '../services/fndePreparacaoService';
import { useToast } from '../contexts/ToastContext';
import PreparacaoEditor from './PreparacaoEditor';
import PreparacaoReport from './PreparacaoReport';
import { ConfirmModal } from './ConfirmModal';

const PreparacoesManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [preparacoes, setPreparacoes] = useState<FNDEPreparacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPrepId, setEditingPrepId] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
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
            console.error("Erro ao carregar preparações:", err);
            addToast("Erro ao carregar fichas técnicas.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPreparacoes();
    }, []);

    const filteredPreparacoes = useMemo(() => {
        return preparacoes.filter(p =>
            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [preparacoes, searchTerm]);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            await fndePreparacaoService.delete(deleteConfirmId);
            addToast("Ficha técnica excluída com sucesso!", "success");
            await loadPreparacoes();
        } catch (err) {
            console.error("Erro ao excluir:", err);
            addToast("Erro ao excluir ficha técnica.", "error");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    const handleEdit = (id: string) => {
        setEditingPrepId(id);
        setIsEditorOpen(true);
    };

    const handleCreate = () => {
        setEditingPrepId(null);
        setIsEditorOpen(true);
    };

    const handleSaveSuccess = () => {
        setIsEditorOpen(false);
        setEditingPrepId(null);
        loadPreparacoes();
    };

    const handlePrint = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const data = await fndePreparacaoService.getById(id);
            setReportPrep(data);
        } catch (err) {
            console.error("Erro ao carregar para impressão:", err);
            addToast("Erro ao carregar dados da ficha.", "error");
        }
    };

    if (isEditorOpen) {
        return (
            <PreparacaoEditor
                id={editingPrepId}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveSuccess}
            />
        );
    }

    if (reportPrep) {
        return (
            <PreparacaoReport
                preparacao={reportPrep}
                onClose={() => setReportPrep(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 -m-8 p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            <PageHeader
                title="Fichas Técnicas Digitais"
                subtitle="Composição Nutricional FNDE"
                icon={Utensils}
                actions={
                    <div className="flex gap-4">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="bg-white border-2 border-slate-200 text-slate-900 font-black hover:bg-slate-50 rounded-2xl px-6 uppercase text-[10px] tracking-widest"
                        >
                            Voltar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-slate-900 text-white hover:bg-black rounded-2xl px-8 shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 font-black uppercase text-[10px] tracking-widest"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nova Ficha Técnica
                        </Button>
                    </div>
                }
            />

            {/* BARRA DE PESQUISA */}
            <div className="bg-white rounded-[32px] border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="PESQUISAR PREPARAÇÕES POR NOME OU DESCRIÇÃO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-300 border-2 border-emerald-700/40 rounded-[28px] pl-16 pr-8 py-6 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-600 focus:ring-8 focus:ring-emerald-500/10 transition-all shadow-2xl shadow-emerald-900/10 placeholder:text-slate-700/60"
                    />
                </div>
            </div>

            {/* LISTA DE PREPARAÇÕES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/50 border-2 border-slate-200 h-64 rounded-[48px] animate-pulse"></div>
                    ))
                ) : filteredPreparacoes.length > 0 ? (
                    filteredPreparacoes.map((prep) => (
                        <Card
                            key={prep.id}
                            variant="elevated"
                            padding="lg"
                            className="bg-white border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 group cursor-pointer rounded-[48px] overflow-hidden"
                            onClick={() => handleEdit(prep.id)}
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 rounded-[22px] bg-indigo-50 text-indigo-600 shadow-sm group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-500">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => handlePrint(prep.id, e)}
                                        className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg"
                                        title="Imprimir / PDF"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(prep.id); }}
                                        className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg"
                                        title="Editar Ficha"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(prep.id, e)}
                                        className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-lg"
                                        title="Excluir Ficha"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {prep.nome}
                                </h3>

                                <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed h-10">
                                    {prep.descricao || "Sem descrição operacional registrada."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rendimento</span>
                                    <span className="text-xs font-black text-slate-900">
                                        {prep.rendimento_porcoes} {prep.rendimento_porcoes === 1 ? 'PORÇÃO' : 'PORÇÕES'}
                                    </span>
                                </div>
                                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-105">
                                    Visualizar Ficha
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">🥘</div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nenhuma Ficha Técnica Encontrada</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">
                            {searchTerm ? "Não encontramos preparações que coincidam com sua busca." : "Comece cadastrando sua primeira preparação operacional usando o botão acima."}
                        </p>
                    </div>
                )}
            </div>

            {/* INFO BOX */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-indigo-100 text-indigo-600">
                    <Info className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase mb-1">Dica de Gestão</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                        As Fichas Técnicas são reutilizáveis. Uma vez cadastradas, elas podem ser incorporadas em qualquer cardápio da rede, garantindo que o valor nutricional calculado seja sempre fiel à base FNDE.
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
