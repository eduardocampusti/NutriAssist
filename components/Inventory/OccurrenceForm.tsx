import React, { useState } from 'react';
import {
    AlertTriangle,
    X,
    Camera,
    Package,
    ClipboardList,
    Send,
    Loader2,
    Calendar,
    ChevronDown,
    Plus,
    Trash2
} from 'lucide-react';
import {
    OccurrenceType,
    OccurrenceStatus,
    OperationalOccurrence,
    InventoryItem,
    School,
    UserProfile,
    MenuPlan
} from '../../types';

interface OccurrenceFormProps {
    school: School;
    activeProfile: UserProfile;
    inventory: InventoryItem[];
    activeMenus: MenuPlan[];
    onClose: () => void;
    onSubmit: (occurrence: Partial<OperationalOccurrence>) => Promise<void>;
}

const OccurrenceForm: React.FC<OccurrenceFormProps> = ({
    school,
    activeProfile,
    inventory,
    activeMenus,
    onClose,
    onSubmit
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        tipo: OccurrenceType.DIVERGENCIA_QTD,
        descricao: '',
        cardapio_afetado_id: activeMenus[0]?.id || '',
        itens_afetados: [] as { produto_id: string; quantidade_afetada: number }[]
    });

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            itens_afetados: [...prev.itens_afetados, { produto_id: '', quantidade_afetada: 0 }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            itens_afetados: prev.itens_afetados.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.itens_afetados];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, itens_afetados: newItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descricao.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                escola_id: school.id,
                responsavel_registro_id: activeProfile.id,
                status: OccurrenceStatus.PENDENTE,
                data_registro: new Date().toISOString()
            } as any);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Registrar Intercorrência</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Contingência Operacional</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* TIPO E CARDÁPIO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Natureza da Ocorrência</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value as OccurrenceType })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none"
                                >
                                    {Object.values(OccurrenceType).map(t => (
                                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardápio Afetado</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={formData.cardapio_afetado_id}
                                    onChange={e => setFormData({ ...formData, cardapio_afetado_id: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none"
                                >
                                    <option value="">Nenhum específico</option>
                                    {activeMenus.map(m => (
                                        <option key={m.id} value={m.id}>{m.titulo || `Cardápio #${m.id.slice(0, 6)}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIÇÃO */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                        <textarea
                            required
                            placeholder="Descreva o ocorrido (ex: Recebemos apenas 50% da carne solicitada para o almoço de amanhã)..."
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            rows={4}
                            className="w-full bg-slate-50 border-none rounded-[32px] px-6 py-5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                    </div>

                    {/* ITENS AFETADOS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Itens do Estoque Envolvidos</label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={14} /> Adicionar Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.itens_afetados.map((item, index) => (
                                <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
                                        <select
                                            value={item.produto_id}
                                            onChange={e => handleUpdateItem(index, 'produto_id', e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="">Selecione o Produto...</option>
                                            {inventory.map(i => (
                                                <option key={i.id} value={i.id}>{i.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            placeholder="Qtd"
                                            value={item.quantidade_afetada || ''}
                                            onChange={e => handleUpdateItem(index, 'quantidade_afetada', Number(e.target.value))}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* UPLOAD SIMULADO */}
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 group hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer">
                        <Camera className="w-8 h-8 group-hover:scale-110 group-hover:text-emerald-500 transition-all" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Anexar Evidência Visual (Foto)</p>
                    </div>

                </form>

                {/* FOOTER */}
                <div className="p-8 border-t border-slate-50 bg-white flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    >
                        Descartar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.descricao}
                        onClick={handleSubmit}
                        className="flex-[2] bg-slate-900 text-white rounded-[24px] py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Enviar para Avaliação Técnica
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OccurrenceForm;
