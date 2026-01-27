import React, { useState } from 'react';
import { InventoryItem, UserProfile, ReplenishmentPriority, ReplenishmentRequestItem } from '../../types';
import { X, Send, Package, ShoppingCart, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { replenishmentService } from '../../services/replenishmentService';

interface ReplenishmentRequestModalProps {
    schoolId: string;
    activeProfile: UserProfile;
    inventory: InventoryItem[];
    onClose: () => void;
    onSuccess: () => void;
}

const ReplenishmentRequestModal: React.FC<ReplenishmentRequestModalProps> = ({
    schoolId,
    activeProfile,
    inventory,
    onClose,
    onSuccess
}) => {
    const { addToast } = useToast();
    const [selectedItems, setSelectedItems] = useState<ReplenishmentRequestItem[]>([]);
    const [priority, setPriority] = useState<ReplenishmentPriority>(ReplenishmentPriority.NORMAL);
    const [observations, setObservations] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleItem = (produtoId: string) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.produto_id === produtoId);
            if (exists) {
                return prev.filter(i => i.produto_id !== produtoId);
            } else {
                return [...prev, { produto_id: produtoId, quantidade_pedida: 1 }];
            }
        });
    };

    const updateQuantity = (produtoId: string, delta: number) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.produto_id === produtoId) {
                const newQty = Math.max(1, item.quantidade_pedida + delta);
                return { ...item, quantidade_pedida: newQty };
            }
            return item;
        }));
    };

    const handleSave = async () => {
        if (selectedItems.length === 0) {
            addToast("Selecione pelo menos um item para solicitar.", 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await replenishmentService.createRequest({
                escola_id: schoolId,
                solicitante_id: activeProfile.id,
                prioridade: priority,
                itens: selectedItems,
                observacao_geral: observations,
                data_pedido: new Date().toISOString()
            } as any);

            addToast("Solicitação de reposição enviada com sucesso!", 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            addToast("Erro ao enviar solicitação: " + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* HEADER */}
                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Solicitar Reposição</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pedido formal de alimentos e insumos para a unidade</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDE: CATALOG */}
                    <div className="w-1/2 border-r border-slate-50 flex flex-col">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Catálogo de Produtos</h3>
                            <input
                                type="text"
                                placeholder="Filtrar produtos..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                            {inventory.map(item => {
                                const isSelected = selectedItems.find(i => i.produto_id === item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${isSelected
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300'
                                                }`}>
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-slate-800 uppercase">{item.nome}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.unidadeMedida}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 bg-slate-50'
                                            }`}>
                                            {isSelected ? <Plus className="w-3 h-3 rotate-45" /> : <Plus className="w-3 h-3" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT SIDE: SELECTION & SETTINGS */}
                    <div className="w-1/2 flex flex-col">
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                            {/* SELECTED ITEMS */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Itens Selecionados ({selectedItems.length})</h3>

                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col gap-1">
                                    <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                                        Solicitação de caráter administrativo e subsídio para planejamento.
                                    </p>
                                    <p className="text-[9px] text-blue-600/70 font-bold uppercase tracking-tight">
                                        Conforme normas do PNAE • Rastreabilidade Garantida
                                    </p>
                                </div>

                                {selectedItems.length === 0 ? (
                                    <div className="py-12 text-center text-slate-300 italic text-sm">
                                        Nenhum item selecionado. Escola à esquerda.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedItems.map(item => {
                                            const product = inventory.find(i => i.id === item.produto_id);
                                            return (
                                                <div key={item.produto_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-slate-800 uppercase">{product?.nome}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{product?.unidadeMedida}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-slate-100">
                                                        <button
                                                            onClick={() => updateQuantity(item.produto_id, -1)}
                                                            className="p-1 hover:text-red-500 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-black text-slate-700 w-8 text-center">{item.quantidade_pedida}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.produto_id, 1)}
                                                            className="p-1 hover:text-blue-500 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* PRIORITY & NOTES */}
                            <section className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Prioridade do Pedido</h3>
                                    <div className="flex gap-2">
                                        {[
                                            { id: ReplenishmentPriority.NORMAL, label: 'Normal', color: 'emerald' },
                                            { id: ReplenishmentPriority.URGENTE, label: 'Urgente', color: 'amber' },
                                            { id: ReplenishmentPriority.CRITICO, label: 'Crítico', icon: AlertTriangle, color: 'rose' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPriority(p.id as ReplenishmentPriority)}
                                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${priority === p.id
                                                    ? `bg-${p.color}-50 border-${p.color}-200 text-${p.color}-700 ring-2 ring-${p.color}-500/20 shadow-sm`
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                    }`}
                                            >
                                                {p.icon ? <p.icon className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full bg-${p.color}-400`} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Observações Adicionais</h3>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                                        rows={3}
                                        placeholder="Justifique a urgência ou dê detalhes sobre a entrega..."
                                        value={observations}
                                        onChange={e => setObservations(e.target.value)}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* FOOTER */}
                        <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting || selectedItems.length === 0}
                                className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                                {!isSubmitting && <Send className="w-4 h-4" />}
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplenishmentRequestModal;
