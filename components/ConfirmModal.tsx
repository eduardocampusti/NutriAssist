import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './UI/Button';

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

    const typeConfig = {
        danger: {
            icon: <AlertTriangle size={32} />,
            color: 'rose',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            text: 'text-rose-600',
            buttonClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
        },
        warning: {
            icon: <AlertTriangle size={32} />,
            color: 'amber',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-600',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
        },
        info: {
            icon: <Info size={32} />,
            color: 'indigo',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            text: 'text-indigo-600',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
        }
    };

    const config = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay background */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-slate-900/40 border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="pt-16 pb-10 px-10 text-center">
                    {/* Icon Circle */}
                    <div className={`mx-auto w-24 h-24 ${config.bg} ${config.border} border-2 rounded-[32px] flex items-center justify-center ${config.text} mb-8 shadow-sm`}>
                        {config.icon}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-tight">
                        {title}
                    </h3>

                    <p className="text-slate-500 font-bold leading-relaxed px-4 text-sm">
                        {message}
                    </p>
                </div>

                <div className="px-10 pb-12 flex flex-col gap-4">
                    <Button
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={`w-full h-16 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95 ${config.buttonClass}`}
                    >
                        {confirmLabel}
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="ghost"
                        disabled={isLoading}
                        className="w-full h-16 rounded-[24px] text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 hover:bg-slate-50"
                    >
                        {cancelLabel}
                    </Button>
                </div>

                {/* Subtle bottom indicator */}
                <div className={`h-2 w-full ${type === 'danger' ? 'bg-rose-500/10' : type === 'warning' ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`} />
            </div>
        </div>
    );
};
