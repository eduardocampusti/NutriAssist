import React, { useState } from 'react';
import { InventoryItem, AuditItemStatus, StockAuditItem, UserProfile } from '../../types';
import { X, CheckCircle, AlertCircle, Package, ClipboardCheck, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { replenishmentService } from '../../services/replenishmentService';

interface StockAuditModalProps {
    schoolId: string;
    activeProfile: UserProfile;
    items: (InventoryItem & { saldoEscola: number })[];
    onClose: () => void;
    onSuccess: () => void;
}

const StockAuditModal: React.FC<StockAuditModalProps> = ({
    schoolId,
    activeProfile,
    items,
    onClose,
    onSuccess
}) => {
    const { addToast } = useToast();
    const [auditItems, setAuditItems] = useState<StockAuditItem[]>(
        items.map(i => ({
            produto_id: i.id,
            status_visto: AuditItemStatus.NORMAL,
            observacao: ''
        }))
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateItemStatus = (produtoId: string, status: AuditItemStatus) => {
        setAuditItems(prev => prev.map(item =>
            item.produto_id === produtoId ? { ...item, status_visto: status } : item
        ));
    };

    const updateItemObs = (produtoId: string, obs: string) => {
        setAuditItems(prev => prev.map(item =>
            item.produto_id === produtoId ? { ...item, observacao: obs } : item
        ));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await replenishmentService.createAudit({
                escola_id: schoolId,
                responsavel_id: activeProfile.id,
                data_auditoria: new Date().toISOString(),
                itens: auditItems
            });

            addToast("Auditoria de estoque registrada com sucesso!", 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            addToast("Erro ao salvar auditoria: " + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* HEADER */}
                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nova Auditoria de Estoque</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Conferência física dos alimentos na unidade</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                A classificação auxilia a SME na priorização das rotas de entrega. Marque como <strong>CRÍTICO</strong> apenas itens que impactam o cardápio dos próximos 2 dias.
                            </p>
                            <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-tight italic">
                                Instrumento de apoio à gestão com caráter administrativo e rastreabilidade total conforme normas do PNAE.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {items.map(item => {
                            const auditItem = auditItems.find(ai => ai.produto_id === item.id);
                            return (
                                <div key={item.id} className="p-5 rounded-3xl border border-slate-100 bg-white hover:border-emerald-200 transition-all group flex flex-col md:flex-row gap-6 md:items-center">
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform border border-slate-100">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-slate-800 uppercase leading-none mb-1">{item.nome}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Sistema: {item.saldoEscola.toFixed(2)} {item.unidadeMedida}</p>
                                        </div>
                                    </div>

                                    {/* STATUS SELECTOR */}
                                    <div className="flex gap-2">
                                        {[
                                            { id: AuditItemStatus.NORMAL, label: 'Normal', color: 'emerald' },
                                            { id: AuditItemStatus.BAIXO, label: 'Acabando', color: 'amber' },
                                            { id: AuditItemStatus.FALTA, label: 'Em Falta', color: 'rose' }
                                        ].map(status => (
                                            <button
                                                key={status.id}
                                                onClick={() => updateItemStatus(item.id, status.id as AuditItemStatus)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${auditItem?.status_visto === status.id
                                                    ? `bg-${status.color}-600 text-white border-${status.color}-600 shadow-lg shadow-${status.color}-200`
                                                    : `bg-white text-slate-400 border-slate-100 hover:border-${status.color}-300 hover:text-${status.color}-600`
                                                    }`}
                                            >
                                                {status.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* OBSERVATION */}
                                    <div className="md:w-64">
                                        <input
                                            type="text"
                                            placeholder="Observação (opcional)"
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={auditItem?.observacao || ''}
                                            onChange={(e) => updateItemObs(item.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Salvando...' : 'Finalizar Auditoria'}
                        {!isSubmitting && <CheckCircle className="w-4 h-4" />}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default StockAuditModal;
