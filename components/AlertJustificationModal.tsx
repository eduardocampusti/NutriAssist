
import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle } from 'lucide-react';

interface AlertJustificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (text: string) => void;
    title?: string;
    description?: string;
    isAudit?: boolean;
}

const AlertJustificationModal: React.FC<AlertJustificationModalProps> = ({
    isOpen, onClose, onConfirm, title, description, isAudit = false
}) => {
    const [text, setText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!text.trim()) {
            alert('Por favor, insira uma justificativa.');
            return;
        }
        onConfirm(text);
        setText('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 m-4 relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${isAudit ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                        {isAudit ? <AlertTriangle size={28} /> : <MessageSquare size={28} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {isAudit ? 'Encaminhar para Auditoria' : 'Justificativa Administrativa'}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                            {description || 'Registre o motivo desta ação para fins de rastreabilidade e histórico.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-2">
                            {isAudit ? 'Observações para o Auditor' : 'Motivo da Justificativa'}
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-400 resize-none transition-all"
                            placeholder={isAudit ? "Descreva os pontos que necessitam de verificação..." : "Explique o contexto desta ocorrência..."}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all transform active:scale-95 ${isAudit ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                }`}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertJustificationModal;
