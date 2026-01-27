import React from 'react';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    type = 'warning',
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                <div className={`h-2 w-full ${type === 'danger' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />

                <div className="p-8 text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4
            ${type === 'danger' ? 'bg-rose-50 text-rose-500' : type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}
          `}>
                        {type === 'danger' && <AlertTriangle />}
                        {type === 'warning' && <AlertTriangle />}
                        {type === 'info' && <Info />}
                    </div>

                    <h3 className="text-xl font-black text-slate-800 uppercase leading-none">{title}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{message}</p>
                </div>

                <div className="bg-slate-50 p-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-400 font-bold uppercase tracking-wide text-xs hover:bg-white hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 rounded-xl text-white font-black uppercase tracking-wide text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
              ${type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
                    >
                        {isLoading ? 'Processando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
