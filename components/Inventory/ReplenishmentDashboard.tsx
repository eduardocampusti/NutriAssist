import React, { useState, useEffect } from 'react';
import { replenishmentService } from '../../services/replenishmentService';
import { ReplenishmentRequest, ReplenishmentStatus, ReplenishmentPriority, UserProfile, UserRole } from '../../types';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Search,
    Filter,
    AlertTriangle,
    MessageSquare,
    Calendar,
    ChevronRight,
    ArrowRightCircle,
    Package,
    Scale
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ReplenishmentDashboardProps {
    activeProfile: UserProfile;
}

const ReplenishmentDashboard: React.FC<ReplenishmentDashboardProps> = ({ activeProfile }) => {
    const { addToast } = useToast();
    const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<ReplenishmentRequest | null>(null);
    const [technicalNote, setTechnicalNote] = useState('');
    const [nutritionalNote, setNutritionalNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await replenishmentService.getRequests();
            setRequests(data);
        } catch (error: any) {
            addToast("Erro ao carregar solicitações: " + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const filteredRequests = requests.filter(r =>
        filterStatus === 'ALL' ? true : r.status === filterStatus
    );

    const handleUpdateStatus = async (status: ReplenishmentStatus) => {
        if (!selectedRequest) return;

        setIsUpdating(true);
        try {
            const additionalData: any = {
                observacao_geral: technicalNote,
                parecer_nutricional: nutritionalNote
            };

            if (status === ReplenishmentStatus.ENTREGUE) {
                additionalData.data_atendimento = new Date().toISOString();
            }

            await replenishmentService.updateRequestStatus(
                selectedRequest.id,
                status,
                activeProfile.id,
                additionalData
            );

            addToast(`Solicitação atualizada para ${status}!`, 'success');
            setSelectedRequest(null);
            setTechnicalNote('');
            loadRequests();
        } catch (error: any) {
            addToast("Erro ao atualizar status: " + error.message, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusStyle = (status: ReplenishmentStatus) => {
        switch (status) {
            case ReplenishmentStatus.PENDENTE: return 'bg-amber-50 text-amber-600 border-amber-100';
            case ReplenishmentStatus.ANALISE: return 'bg-blue-50 text-blue-600 border-blue-100';
            case ReplenishmentStatus.APROVADO: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case ReplenishmentStatus.REJEITADO: return 'bg-rose-50 text-rose-600 border-rose-100';
            case ReplenishmentStatus.ENTREGUE: return 'bg-slate-50 text-slate-500 border-slate-100';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    const getPriorityStyle = (priority: ReplenishmentPriority) => {
        switch (priority) {
            case ReplenishmentPriority.CRITICO: return 'bg-red-500 text-white shadow-red-100';
            case ReplenishmentPriority.URGENTE: return 'bg-amber-500 text-white shadow-amber-100';
            default: return 'bg-slate-100 text-slate-500 shadow-slate-50';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* STATS HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pendentes', value: requests.filter(r => r.status === ReplenishmentStatus.PENDENTE).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Em Análise', value: requests.filter(r => r.status === ReplenishmentStatus.ANALISE).length, icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Aprovados', value: requests.filter(r => r.status === ReplenishmentStatus.APROVADO).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Críticos', value: requests.filter(r => r.prioridade === ReplenishmentPriority.CRITICO).length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col xl:flex-row gap-8 overflow-hidden h-[calc(100vh-320px)]">
                {/* LISTING */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                        <header className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-4">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-500" /> Fluxo de Solicitações das Unidades
                            </h3>
                            <div className="flex gap-2">
                                {['ALL', ...Object.values(ReplenishmentStatus)].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border ${filterStatus === s
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        {s === 'ALL' ? 'Todos' : s}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="py-20 text-center text-slate-300 animate-pulse">Carregando pedidos...</div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="py-20 text-center text-slate-300 italic">Nenhum pedido encontrado.</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {filteredRequests.map(request => (
                                        <div
                                            key={request.id}
                                            onClick={() => setSelectedRequest(request)}
                                            className={`p-6 hover:bg-slate-50 transition-all cursor-pointer group flex items-center gap-6 ${selectedRequest?.id === request.id ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-xl shadow-sm">
                                                    🏫
                                                </div>
                                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getPriorityStyle(request.prioridade)}`}>
                                                    {request.prioridade === ReplenishmentPriority.CRITICO && <AlertTriangle size={10} />}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h5 className="font-black text-slate-800 uppercase text-xs">{(request as any).escola?.nome}</h5>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border ${getStatusStyle(request.status)}`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(request.data_pedido).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Package size={12} /> {request.itens.length} Itens</span>
                                                </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1">
                                                <ChevronRight className={`w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all ${selectedRequest?.id === request.id ? 'translate-x-1 text-blue-500' : ''}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* DETAILS PANEL */}
                <div className="w-full xl:w-[450px] shrink-0">
                    {selectedRequest ? (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                            <header className="p-8 border-b border-slate-50 bg-slate-900 text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detalhes da Solicitação</p>
                                <h3 className="text-lg font-black uppercase leading-tight">{(selectedRequest as any).escola?.nome}</h3>
                                <div className="mt-4 flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${getPriorityStyle(selectedRequest.prioridade)}`}>
                                        {selectedRequest.prioridade}
                                    </span>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Solicitado por: {(selectedRequest as any).solicitante?.nome}</p>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* ITEM LIST */}
                                <section className="space-y-4">
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Itens Solicitados</h6>
                                    <div className="space-y-3">
                                        {selectedRequest.itens.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                        <Package size={14} />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 uppercase">{item.produto_id.substring(0, 8)}...</p> {/* Ideally join with catalog names */}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-800">{item.quantidade_pedida}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Unidades</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* NOTES */}
                                {selectedRequest.observacao_geral && (
                                    <section className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <h6 className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center gap-2">
                                            <MessageSquare size={12} /> Observação da Escola
                                        </h6>
                                        <p className="text-xs text-blue-800 font-medium italic">"{selectedRequest.observacao_geral}"</p>
                                    </section>
                                )}

                                {/* ACTION ZONE */}
                                {selectedRequest.status !== ReplenishmentStatus.ENTREGUE && selectedRequest.status !== ReplenishmentStatus.REJEITADO && (
                                    <section className="space-y-6 pt-4 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota Técnica de Atendimento</label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                rows={2}
                                                placeholder="Descreva o andamento ou motivo da aprovação/rejeição..."
                                                value={technicalNote}
                                                onChange={e => setTechnicalNote(e.target.value)}
                                            />
                                        </div>

                                        {(activeProfile.role === UserRole.NUTRICIONISTA || activeProfile.role === UserRole.ADMIN) && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                                    <Scale size={12} /> Parecer Nutricional / Substituição
                                                </label>
                                                <textarea
                                                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-3xl px-5 py-4 text-xs font-medium text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    rows={3}
                                                    placeholder="Análise do impacto e autorização de substituições..."
                                                    value={nutritionalNote}
                                                    onChange={e => setNutritionalNote(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedRequest.status === ReplenishmentStatus.PENDENTE && (
                                                <button
                                                    onClick={() => handleUpdateStatus(ReplenishmentStatus.ANALISE)}
                                                    disabled={isUpdating}
                                                    className="col-span-2 py-4 rounded-2xl border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Iniciar Análise Técnica <ArrowRightCircle size={14} />
                                                </button>
                                            )}

                                            {selectedRequest.status === ReplenishmentStatus.ANALISE && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ReplenishmentStatus.APROVADO)}
                                                        disabled={isUpdating}
                                                        className="py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                                    >
                                                        Aprovar <CheckCircle2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ReplenishmentStatus.REJEITADO)}
                                                        disabled={isUpdating}
                                                        className="py-4 rounded-2xl bg-white border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Indeferir <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}

                                            {selectedRequest.status === ReplenishmentStatus.APROVADO && (
                                                <button
                                                    onClick={() => handleUpdateStatus(ReplenishmentStatus.ENTREGUE)}
                                                    disabled={isUpdating}
                                                    className="col-span-2 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
                                                >
                                                    Confirmar Entrega na Unidade <Truck size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-6">
                                <Truck size={40} />
                            </div>
                            <h4 className="text-slate-800 font-black uppercase text-sm tracking-tight mb-2">Seleção de Pedido</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-[240px]">Selecione uma solicitação na lista ao lado para realizar a análise técnica e programar a entrega.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplenishmentDashboard;
