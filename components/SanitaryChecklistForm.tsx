import React, { useState } from 'react';
import { SanitaryAnswer, SanitaryItemAnswer, UserProfile, SanitaryChecklist } from '../types';
import { sanitaryService } from '../services/sanitaryService';
import {
    ClipboardCheck,
    Save,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MinusCircle,
    MessageSquare
} from 'lucide-react';

interface SanitaryChecklistFormProps {
    activeProfile: UserProfile;
    onSuccess: () => void;
}

const QUESTIONS = [
    'Armazenamento adequado dos alimentos (seco/frio)',
    'Controle de validade (itens dentro do prazo)',
    'Organização do estoque (empilhamento/identificação)',
    'Condições de higiene do local (limpeza/ralos/telas)',
    'Uso correto dos alimentos recebidos (conforme guia)',
    'Presença de EPIs e vestimenta adequada da equipe',
    'Estado das embalagens (integridade/limpeza)',
    'Controle de pragas (ausência de vestígios/insetos)'
];

const SanitaryChecklistForm: React.FC<SanitaryChecklistFormProps> = ({ activeProfile, onSuccess }) => {
    const [respostas, setRespostas] = useState<SanitaryItemAnswer[]>(
        QUESTIONS.map(q => ({ pergunta: q, resposta: SanitaryAnswer.SIM }))
    );
    const [obsGerais, setObsGerais] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = (index: number, value: SanitaryAnswer) => {
        const newRespostas = [...respostas];
        newRespostas[index].resposta = value;
        setRespostas(newRespostas);
    };

    const handleObsChange = (index: number, text: string) => {
        const newRespostas = [...respostas];
        newRespostas[index].observacao = text;
        setRespostas(newRespostas);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const now = new Date();
            await sanitaryService.saveChecklist({
                escola_id: activeProfile.school_id || '',
                responsavel_id: activeProfile.id,
                mes_referencia: now.getMonth() + 1,
                ano_referencia: now.getFullYear(),
                data_realizacao: now.toISOString(),
                respostas,
                observacoes_gerais: obsGerais
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar checklist');
        } finally {
            setLoading(false);
        }
    };

    const compliance = ((respostas.filter(r => r.resposta === SanitaryAnswer.SIM).length / respostas.length) * 100).toFixed(0);

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* HEADER */}
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Novo Checklist Sanitário</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Conformidade e Segurança Alimentar</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-emerald-400">{compliance}%</div>
                        <p className="text-[9px] font-black uppercase text-slate-500">Índice de Conformidade</p>
                    </div>
                </div>

                {/* QUESTIONS LIST */}
                <div className="p-8 space-y-6">
                    {respostas.map((item, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">{item.pergunta}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(idx, SanitaryAnswer.SIM)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.resposta === SanitaryAnswer.SIM ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            <CheckCircle2 size={14} /> Sim
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(idx, SanitaryAnswer.NAO)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.resposta === SanitaryAnswer.NAO ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            <XCircle size={14} /> Não
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(idx, SanitaryAnswer.NA)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.resposta === SanitaryAnswer.NA ? 'bg-slate-400 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            <MinusCircle size={14} /> N.A
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full md:w-72">
                                    <div className="relative">
                                        <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <textarea
                                            placeholder="Observações específicas..."
                                            className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-20"
                                            value={item.observacao || ''}
                                            onChange={(e) => handleObsChange(idx, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* GENERAL COMMENTS */}
                    <div className="pt-6 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Observações Gerais e Recomendações</label>
                        <textarea
                            className="w-full bg-slate-50 border border-transparent rounded-[2rem] p-6 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all h-32"
                            placeholder="Descreva quaisquer intercorrências ou necessidades de melhoria..."
                            value={obsGerais}
                            onChange={(e) => setObsGerais(e.target.value)}
                        />
                    </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 font-medium">Ao salvar, este registro se tornará permanente para histórico da unidade.</p>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                                <AlertCircle size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}
                        <button
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Processando...' : 'Confirmar e Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SanitaryChecklistForm;
