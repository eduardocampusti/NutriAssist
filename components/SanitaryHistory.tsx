import React, { useState, useEffect } from 'react';
import { SanitaryChecklist, SanitaryAnswer, UserRole, UserProfile } from '../types';
import { sanitaryService } from '../services/sanitaryService';
import {
    Calendar,
    User,
    ChevronRight,
    BarChart3,
    AlertCircle,
    FileText,
    Clock,
    CheckCircle2,
    MinusCircle
} from 'lucide-react';

interface SanitaryHistoryProps {
    activeProfile: UserProfile;
}

const SanitaryHistory: React.FC<SanitaryHistoryProps> = ({ activeProfile }) => {
    const [history, setHistory] = useState<SanitaryChecklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<SanitaryChecklist | null>(null);

    useEffect(() => {
        loadHistory();
    }, [activeProfile]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const schoolId = activeProfile.role === UserRole.DIRETOR ? activeProfile.school_id : undefined;
            const data = await sanitaryService.getHistory(schoolId);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month: number) => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months[month - 1];
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Histórico de Controle Sanitário</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registros mensais permanentes</p>
                </div>
                <button
                    onClick={loadHistory}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400"
                >
                    <Clock className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LIST */}
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado.</p>
                        </div>
                    ) : (
                        history.map(item => {
                            const compliance = sanitaryService.calculateCompliance(item);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all ${selectedItem?.id === item.id ? 'bg-slate-900 text-white shadow-2xl border-slate-900 translate-x-2' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black ${selectedItem?.id === item.id ? 'bg-white/10' : 'bg-slate-50 text-slate-400'}`}>
                                                {getMonthName(item.mes_referencia).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedItem?.id === item.id ? 'text-white/50' : 'text-slate-400'}`}>
                                                    {item.ano_referencia}
                                                </p>
                                                <p className="text-sm font-black uppercase tracking-tight">{item.escola?.nome}</p>
                                            </div>
                                        </div>
                                        <div className={`text-xl font-black ${compliance >= 90 ? 'text-emerald-400' : compliance >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {compliance.toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className={selectedItem?.id === item.id ? 'text-white/40' : 'text-slate-400'} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedItem?.id === item.id ? 'text-white/60' : 'text-slate-500'}`}>
                                                {item.responsavel?.nome.split(' ')[0]}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className={selectedItem?.id === item.id ? 'text-white' : 'text-slate-300'} />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* DETAILS PANEL */}
                <div className="relative">
                    {selectedItem ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl sticky top-8 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Detalhamento</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referência: {getMonthName(selectedItem.mes_referencia)} / {selectedItem.ano_referencia}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedItem.respostas.map((res, i) => (
                                    <div key={i} className="flex items-start justify-between p-4 bg-slate-50 rounded-2xl border border-transparent group hover:bg-slate-100 transition-all">
                                        <div className="flex-1 pr-4">
                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{res.pergunta}</p>
                                            {res.observacao && (
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 text-xs">{res.observacao}</p>
                                            )}
                                        </div>
                                        <div>
                                            {res.resposta === SanitaryAnswer.SIM ? (
                                                <CheckCircle2 className="text-emerald-500" size={18} />
                                            ) : res.resposta === SanitaryAnswer.NAO ? (
                                                <AlertCircle className="text-rose-500" size={18} />
                                            ) : (
                                                <MinusCircle className="text-slate-300" size={18} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedItem.observacoes_gerais && (
                                <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Parecer e Recomendações</h5>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedItem.observacoes_gerais}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <BarChart3 className="text-slate-300 w-8 h-8" />
                            </div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-tighter">Selecione um registro <br /> para ver os detalhes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SanitaryHistory;
