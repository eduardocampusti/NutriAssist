import React, { useState } from 'react';
import {
    AlertTriangle,
    X,
    CheckCircle2,
    MessageSquare,
    FileText,
    Calendar,
    User,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Scale,
    Package
} from 'lucide-react';
import {
    OperationalOccurrence,
    OccurrenceStatus,
    UserProfile,
    InventoryItem,
    School
} from '../../types';

interface OccurrenceReviewModalProps {
    occurrence: OperationalOccurrence;
    school: School | undefined;
    activeProfile: UserProfile;
    inventory: InventoryItem[];
    onClose: () => void;
    onReview: (id: string, status: OccurrenceStatus, opinion: string) => Promise<void>;
}

const OccurrenceReviewModal: React.FC<OccurrenceReviewModalProps> = ({
    occurrence,
    school,
    activeProfile,
    inventory,
    onClose,
    onReview
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [opinion, setOpinion] = useState('');
    const [status, setStatus] = useState<OccurrenceStatus>(OccurrenceStatus.AVALIADO);

    const handleReview = async () => {
        if (!opinion.trim()) return;
        setIsSubmitting(true);
        try {
            await onReview(occurrence.id, status, opinion);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">

                {/* HEADER */}
                <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Scale className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-rose-500/20">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Avaliação de Intercorrência</h2>
                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mt-1">Gabinete Técnico Nutricional • ID: #{occurrence.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/10 rounded-2xl text-white/40 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">

                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Data Registro
                            </p>
                            <p className="text-xs font-bold text-slate-700">{new Date(occurrence.data_registro).toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Escola
                            </p>
                            <p className="text-xs font-bold text-slate-700 truncate">{school?.nome || 'Unidade Geral'}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Natureza
                            </p>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-black uppercase rounded-md tracking-widest">
                                {occurrence.tipo.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>

                    {/* RELATO DO DIRETOR */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relato da Direção Escolar</h4>
                        <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 relative">
                            <MessageSquare className="absolute -top-3 -left-3 w-8 h-8 text-amber-200" />
                            <p className="text-sm text-amber-900 font-medium leading-relaxed italic">
                                "{occurrence.descricao}"
                            </p>
                        </div>
                    </section>

                    {/* ITENS AFETADOS TABLE */}
                    {occurrence.itens_afetados && occurrence.itens_afetados.length > 0 && (
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Itens do Estoque Impactados</h4>
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {occurrence.itens_afetados.map((it, idx) => {
                                            const product = inventory.find(p => p.id === it.produto_id);
                                            return (
                                                <tr key={idx} className="text-xs font-bold text-slate-600">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                            <Package size={14} />
                                                        </div>
                                                        {product?.nome || 'Desconhecido'}
                                                    </td>
                                                    <td className="px-6 py-4 text-rose-600">-{it.quantidade_afetada} {product?.unidade_medida}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* PARECER TÉCNICO FORM */}
                    <section className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Parecer Técnico Nutricional</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Defina a conduta a ser adotada pela unidade</p>
                            </div>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                <button
                                    onClick={() => setStatus(OccurrenceStatus.AVALIADO)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${status === OccurrenceStatus.AVALIADO ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400'}`}
                                >
                                    Validado
                                </button>
                                <button
                                    onClick={() => setStatus(OccurrenceStatus.RESOLVIDO)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${status === OccurrenceStatus.RESOLVIDO ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                                >
                                    Resolvido
                                </button>
                                <button
                                    onClick={() => setStatus(OccurrenceStatus.CANCELADO)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${status === OccurrenceStatus.CANCELADO ? 'bg-rose-100 text-rose-600' : 'text-slate-400'}`}
                                >
                                    Improcedente
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                required
                                value={opinion}
                                onChange={e => setOpinion(e.target.value)}
                                placeholder="Registre aqui as orientações técnicas, substituições alimentares e decisões administrativas..."
                                rows={6}
                                className="w-full bg-slate-50 border-none rounded-[40px] px-8 py-8 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-300 transition-all"
                            />
                            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <p className="text-[10px] font-bold leading-relaxed">
                                    Este parecer constitui prova técnica de validade administrativa conforme a Portaria de Institucionalização do Sistema NutriAssist.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="p-10 border-t border-slate-50 bg-white flex gap-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all"
                    >
                        Voltar
                    </button>
                    <button
                        disabled={isSubmitting || !opinion.trim()}
                        onClick={handleReview}
                        className="flex-[2] bg-slate-900 text-white rounded-3xl py-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <FileText size={18} />
                                Homologar Parecer Técnico
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OccurrenceReviewModal;
