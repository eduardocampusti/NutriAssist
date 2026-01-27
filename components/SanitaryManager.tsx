import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import SanitaryChecklistForm from './SanitaryChecklistForm';
import SanitaryHistory from './SanitaryHistory';
import {
    ShieldCheck,
    History,
    Plus,
    Search,
    School as SchoolIcon,
    AlertCircle
} from 'lucide-react';

interface SanitaryManagerProps {
    activeProfile: UserProfile;
}

const SanitaryManager: React.FC<SanitaryManagerProps> = ({ activeProfile }) => {
    const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('HISTORY');

    const showNewButton = activeProfile.role === UserRole.DIRETOR ||
        activeProfile.role === UserRole.MERENDEIRA || // Em algumas redes a merendeira ajuda no técnico
        activeProfile.role === UserRole.NUTRICIONISTA;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER MANAGER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo de Segurança Alimentar</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Controle Sanitário Mensal</h2>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={14} /> Histórico
                    </button>
                    {showNewButton && (
                        <button
                            onClick={() => setActiveTab('NEW')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'NEW' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Plus size={14} /> Novo Registro
                        </button>
                    )}
                </div>
            </div>

            <div className="relative">
                {activeTab === 'NEW' ? (
                    <SanitaryChecklistForm
                        activeProfile={activeProfile}
                        onSuccess={() => setActiveTab('HISTORY')}
                    />
                ) : (
                    <SanitaryHistory activeProfile={activeProfile} />
                )}
            </div>

            {/* INFO FOOTER */}
            {activeTab === 'HISTORY' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 text-slate-500">
                    <AlertCircle className="shrink-0 text-blue-500" />
                    <p className="text-xs font-medium leading-relaxed">
                        O preenchimento deste checklist é **obrigatório mensalmente** conforme Resolução SME 04/2026.
                        A ausência de registros pode impactar na liberação de novas remessas de alimentos para a unidade.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SanitaryManager;
