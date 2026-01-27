import React, { useState, useEffect } from 'react';
import { Distribution, DistributionStatus, InventoryItem, UserProfile, School } from '../../types';
import {
    Truck,
    ClipboardCheck,
    Clock,
    ArrowRight,
    PackageSearch,
    Search,
    ChevronRight,
    CheckCircle2,
    PackageX,
    Filter,
    ShieldCheck,
    FileText
} from 'lucide-react';
import { distributionService } from '../../services/distributionService';
import { useInventory } from '../../contexts/InventoryContext';
import { useToast } from '../../contexts/ToastContext';
import DistributionReport from './DistributionReport';
import DistributionReceiptModal from './DistributionReceiptModal';

interface DistributionReceiptViewProps {
    school: School;
    activeProfile: UserProfile;
}

const DistributionReceiptView: React.FC<DistributionReceiptViewProps> = ({
    school,
    activeProfile
}) => {
    const { inventory } = useInventory();
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | DistributionStatus>(DistributionStatus.AGUARDANDO_CONFIRMACAO);

    // UI States
    const [selectedDist, setSelectedDist] = useState<Distribution | null>(null);
    const [viewingReportId, setViewingReportId] = useState<string | null>(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        loadDistributions();
    }, [school.id]);

    const loadDistributions = async () => {
        setIsLoading(true);
        try {
            const data = await distributionService.listDistributions({ escola_id: school.id });
            setDistributions(data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar entregas.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDistributions = distributions.filter(dist => {
        const matchesSearch = dist.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'TODOS' || dist.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = distributions.filter(d => d.status === DistributionStatus.AGUARDANDO_CONFIRMACAO).length;

    if (viewingReportId) {
        const dist = distributions.find(d => d.id === viewingReportId);
        if (dist) {
            const reportMovements = dist.itens?.map(it => ({
                itemId: it.produto_id,
                quantidade: it.quantidade_enviada,
                data: new Date(dist.created_at || Date.now()).getTime(),
            })) || [];

            return (
                <DistributionReport
                    school={school}
                    movements={reportMovements as any}
                    inventory={inventory}
                    date={new Date(dist.created_at || Date.now()).getTime()}
                    user={activeProfile}
                    onClose={() => setViewingReportId(null)}
                />
            );
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        Recebimento de Mercadorias
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Gerenciamento de Entregas e Conferência de Estoque
                    </p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setStatusFilter(DistributionStatus.AGUARDANDO_CONFIRMACAO)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === DistributionStatus.AGUARDANDO_CONFIRMACAO ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Pendentes ({pendingCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('TODOS')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'TODOS' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID da entrega..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl text-sm font-medium shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                </div>
                <div className="md:col-span-4 flex items-center justify-center bg-emerald-50 rounded-3xl border border-emerald-100 px-6 py-4">
                    <PackageSearch className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                        Total: {filteredDistributions.length} Entregas
                    </span>
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {isLoading ? (
                        <div className="p-20 text-center text-slate-300 animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Entregas...</div>
                    ) : filteredDistributions.length === 0 ? (
                        <div className="p-20 text-center text-slate-300 italic flex flex-col items-center gap-4">
                            <PackageX className="w-12 h-12 opacity-10" />
                            <p className="text-sm font-medium">Nenhuma entrega encontrada para este filtro.</p>
                        </div>
                    ) : (
                        filteredDistributions.map((dist) => {
                            const totalItems = dist.itens?.length || 0;
                            const isPending = dist.status === DistributionStatus.AGUARDANDO_CONFIRMACAO;

                            return (
                                <div key={dist.id} className="group p-8 hover:bg-slate-50/50 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-[24px] flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isPending ? 'bg-amber-600 text-white shadow-amber-100' : 'bg-slate-100 text-slate-400 shadow-none'}`}>
                                                {isPending ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                                <span className="text-[8px] font-black uppercase mt-1">
                                                    {isPending ? 'Pendente' : 'Recebido'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                                        Remessa #{dist.id.slice(0, 8)}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {dist.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        Saída: {new Date(dist.data_envio || Date.now()).toLocaleDateString()}
                                                    </p>
                                                    <span className="text-slate-200">|</span>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {totalItems} Itens • {dist.motorista || 'Motorista não informado'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => setViewingReportId(dist.id)}
                                                className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-100 hover:border-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
                                            >
                                                Ver Romaneio
                                            </button>

                                            {isPending && (
                                                <button
                                                    onClick={() => { setSelectedDist(dist); setShowReceiptModal(true); }}
                                                    className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Conferir e Receber
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {dist.status !== DistributionStatus.AGUARDANDO_CONFIRMACAO && (
                                        <div className="mt-6 flex flex-col md:flex-row gap-4">
                                            {dist.assinatura_digital_simples && (
                                                <div className="flex-1 p-4 bg-slate-900 rounded-2xl text-white flex items-center gap-4 border border-slate-800">
                                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-emerald-400">Assinado Digitalmente</p>
                                                        <p className="text-xs font-bold">{dist.cargo_responsavel || 'Responsável Unidade'}</p>
                                                        <p className="text-[9px] text-slate-400 uppercase font-black mt-0.5">
                                                            EM: {new Date(dist.data_recebimento!).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {dist.observacoes_recebimento && (
                                                <div className="flex-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-1 italic">Nota de Recebimento:</p>
                                                    <p className="text-xs text-emerald-800 font-medium">"{dist.observacoes_recebimento}"</p>
                                                </div>
                                            )}

                                            {dist.comprovante_url && (
                                                <a
                                                    href={dist.comprovante_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all group"
                                                >
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <FileText className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase">Documento</p>
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase">Ver Comprovante</p>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showReceiptModal && selectedDist && (
                <DistributionReceiptModal
                    distribution={selectedDist}
                    inventory={inventory}
                    activeProfile={activeProfile}
                    onClose={() => { setShowReceiptModal(false); setSelectedDist(null); }}
                    onSuccess={() => {
                        setShowReceiptModal(false);
                        setSelectedDist(null);
                        loadDistributions();
                    }}
                />
            )}
        </div>
    );
};

export default DistributionReceiptView;
