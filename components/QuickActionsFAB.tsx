
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Package, Heart, LayoutGrid, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Keyboard Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const actions = [
        { id: 'doc', label: 'Nova Redação IA', icon: FileText, path: '/elaborar', color: 'bg-blue-600' },
        { id: 'stock', label: 'Entrada de Estoque', icon: Package, path: '/estoque/entrada', color: 'bg-emerald-600' },
        { id: 'ne', label: 'Aluno Especial', icon: Heart, path: '/alunos-ne', color: 'bg-rose-600' },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4 print:hidden">
            {/* Action Buttons */}
            {isOpen && (
                <div className="flex flex-col items-end gap-3 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-3 group">
                            <span
                                className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl"
                            >
                                {action.label}
                            </span>
                            <button
                                onClick={() => {
                                    navigate(action.path);
                                    setIsOpen(false);
                                }}
                                className={`w-12 h-12 ${action.color} text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95`}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <action.icon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 ${isOpen ? 'bg-slate-900' : 'bg-emerald-600'} text-white rounded-[24px] shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 relative overflow-hidden group`}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isOpen ? (
                    <X className="w-8 h-8 relative z-10 animate-in spin-in-90 duration-300" />
                ) : (
                    <Plus className="w-8 h-8 relative z-10 animate-in zoom-in duration-300" />
                )}
            </button>
        </div>
    );
};

export default QuickActionsFAB;
