import React, { useState } from 'react';
import { DocStatus, UserRole, UserProfile } from '../../types';

interface Step4Props {
    status: DocStatus;
    activeProfile?: UserProfile;
    onSubmit: (finalStatus: DocStatus, obs?: string) => void;
}

export const Step4_Approval: React.FC<Step4Props> = ({ status, activeProfile, onSubmit }) => {
    const [obs, setObs] = useState('');

    // Permission Logic
    const canApprove = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.SECRETARIO || activeProfile?.role === UserRole.SECRETARIA;

    // APROVAÇÃO OBRIGATÓRIA PELA SME: Nutricionista agora é apenas Criador.
    const isSent = status === DocStatus.ENVIADO || status === DocStatus.APROVADO;

    if (!isSent) {
        // SCENARIO A: Creator Sending for Approval
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl">
                    📤
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Pronto para Envio</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm">
                    O cardápio foi validado tecnicamente. Ao enviar, ele ficará disponível para a Secretaria de Educação realizar a homologação final.
                </p>

                <button
                    onClick={() => onSubmit(DocStatus.ENVIADO)}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
                >
                    Enviar para Aprovação
                </button>
            </div>
        );
    }

    if (!canApprove && isSent) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                    ⏳
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Aguardando Homologação</h2>
                <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto">
                    O cardápio foi enviado para a Secretaria Municipal de Educação.
                    Aguarde a aprovação final para emissão oficial do PDF.
                </p>
            </div>
        );
    }

    // SCENARIO B: Approver reviewing
    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl text-center">
                <h2 className="text-xl font-black text-slate-800 uppercase mb-6">Homologação do Cardápio</h2>

                <div className="mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Parecer do Aprovador (Obrigatório para Ajustes)</label>
                    <textarea
                        value={obs}
                        onChange={e => setObs(e.target.value)}
                        className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500"
                        placeholder="Insira observações sobre a decisão..."
                    />
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => onSubmit(DocStatus.AJUSTE, obs)}
                        disabled={!obs}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-amber-400 hover:text-amber-600 disabled:opacity-50 transition-all"
                    >
                        Solicitar Ajustes
                    </button>
                    <button
                        onClick={() => onSubmit(DocStatus.APROVADO, obs)}
                        className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 hover:scale-105 transition-transform"
                    >
                        Aprovar & Publicar
                    </button>
                </div>
            </div>
        </div>
    );
};
