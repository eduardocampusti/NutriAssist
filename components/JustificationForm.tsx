import React, { useState } from 'react';
import { UserProfile, JustificationType, AdministrativeJustification, UserRole } from '../types';
import { justificationService } from '../services/justificationService';
import {
    ShieldAlert,
    Save,
    MessageSquare,
    Calendar,
    AlertCircle,
    FileText,
    X
} from 'lucide-react';

interface JustificationFormProps {
    activeProfile: UserProfile;
    initialData?: Partial<AdministrativeJustification>;
    onSuccess: () => void;
    onCancel?: () => void;
}

const JustificationForm: React.FC<JustificationFormProps> = ({ activeProfile, initialData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        tipo: initialData?.tipo || JustificationType.OUTROS,
        descricao: initialData?.descricao || '',
        data_fato: initialData?.data_fato || new Date().toISOString().split('T')[0],
        escola_id: initialData?.escola_id || activeProfile.school_id || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descricao || !formData.escola_id) {
            setError('Por favor, preencha a descrição e selecione a escola.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await justificationService.saveJustification({
                escola_id: formData.escola_id,
                usuario_id: activeProfile.id,
                tipo: formData.tipo,
                descricao: formData.descricao,
                data_fato: new Date(formData.data_fato).toISOString(),
                vinculo_tipo: initialData?.vinculo_tipo,
                vinculo_id: initialData?.vinculo_id
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar justificativa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            {/* HEADER */}
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Justificativa Administrativa</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instrumento Formal de Transparência</p>
                    </div>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TIPO DE OCORRÊNCIA */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Ocorrência</label>
                        <div className="relative">
                            <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as JustificationType })}
                            >
                                <option value={JustificationType.FALTA_ITEM}>FALTA DE ITEM NO ESTOQUE</option>
                                <option value={JustificationType.ATRASO_ENTREGA}>ATRASO NA ENTREGA (FORNECEDOR)</option>
                                <option value={JustificationType.SUBSTITUICAO_ALIMENTO}>SUBSTITUIÇÃO DE ALIMENTO</option>
                                <option value={JustificationType.ALTERACAO_CARDAPIO}>ALTERAÇÃO DE CARDÁPIO</option>
                                <option value={JustificationType.PROBLEMA_FORNECEDOR}>PROBLEMA TÉCNICO COM FORNECEDOR</option>
                                <option value={JustificationType.OUTROS}>OUTRAS OCORRÊNCIAS</option>
                            </select>
                        </div>
                    </div>

                    {/* DATA DO FATO */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Fato</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="date"
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                value={formData.data_fato}
                                onChange={(e) => setFormData({ ...formData, data_fato: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* DESCRIÇÃO DESCRIÇÃO */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalhamento e Justificativa Técnica</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                        <textarea
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all h-40 resize-none leading-relaxed"
                            placeholder="Descreva detalhadamente o motivo da intercorrência, as medidas tomadas e quaisquer observações relevantes para a auditoria..."
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>
                </div>

                {/* INFO FOOTER */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                    <FileText className="shrink-0 text-slate-400 mt-0.5" size={16} />
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                        Este documento possui validade administrativa. Ao salvar, os dados serão vinculados ao histórico permanente da unidade escolar e estarão disponíveis para consulta da gestão e auditorias.
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex-1">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Formalizando...' : 'Confirmar Justificativa'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JustificationForm;
