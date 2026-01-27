import React, { useState, useMemo } from 'react';
import {
    AlertTriangle,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    ChevronRight,
    Building2,
    Calendar,
    MessageSquare,
    Package,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useSchools } from '../../contexts/SchoolContext';
import { useUsers } from '../../contexts/UserContext';
import {
    OperationalOccurrence,
    OccurrenceStatus,
    OccurrenceType,
    UserRole
} from '../../types';
import OccurrenceReviewModal from './OccurrenceReviewModal';
import { occurrenceService } from '../../services/occurrenceService';
import { useToast } from '../../contexts/ToastContext';

const OccurrenceManager: React.FC = () => {
    const { occurrences, inventory, isLoading: isInventoryLoading } = useInventory();
    const { schools } = useSchools();
    const { activeProfile } = useUsers();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | OccurrenceStatus>('TODOS');
    const [selectedOccurrence, setSelectedOccurrence] = useState<OperationalOccurrence | null>(null);

    const filteredOccurrences = useMemo(() => {
        return occurrences.filter(o => {
            const schoolName = schools.find(s => s.id === o.escola_id)?.nome || '';
            const matchesSearch = o.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.includes(searchTerm);
            const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter;

            // ACL: Diretores só veem os da sua escola
            if (activeProfile?.role === UserRole.DIRETOR) {
                return matchesSearch && matchesStatus && o.escola_id === activeProfile.school_id;
            }

            return matchesSearch && matchesStatus;
        });
    }, [occurrences, searchTerm, statusFilter, schools, activeProfile]);

    const handleReview = async (id: string, status: OccurrenceStatus, opinion: string) => {
        try {
            await occurrenceService.updateStatus(id, status, opinion, activeProfile?.id);
            addToast("Parecer técnico registrado com sucesso.", 'success');
            setSelectedOccurrence(null);
            // Idealmente, recarregar contexto aqui ou via subscription
        } catch (error) {
            addToast("Erro ao registrar parecer.", 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        Gestão de Intercorrências
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Protocolos de Contingência e Pareceres Técnicos
                    </p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    {['TODOS', OccurrenceStatus.PENDENTE, OccurrenceStatus.AVALIADO].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            {s === 'TODOS' ? 'Histórico' : s.split('_')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por escola, ID ou relato..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl text-sm font-medium shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {isInventoryLoading ? (
                    <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sincronizando Intercorrências...</p>
                    </div>
                ) : filteredOccurrences.length === 0 ? (
                    <div className="p-20 text-center text-slate-300 italic flex flex-col items-center gap-4">
                        <CheckCircle2 className="w-12 h-12 opacity-10" />
                        <p className="text-sm font-medium">Nenhuma intercorrência encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filteredOccurrences.map(occ => {
                            const school = schools.find(s => s.id === occ.escola_id);
                            const isPending = occ.status === OccurrenceStatus.PENDENTE;

                            return (
                                <div key={occ.id} className="group p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isPending ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">#{occ.id.slice(0, 8)}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${isPending ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {occ.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                    <Building2 className="w-3 h-3" /> {school?.nome || 'Unidade Geral'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3" /> {new Date(occ.data_registro).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                                                    <Package className="w-3 h-3" /> {occ.tipo.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mt-3 line-clamp-1 max-w-xl group-hover:text-slate-600 transition-colors">
                                                "{occ.descricao}"
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedOccurrence(occ)}
                                        className="w-full md:w-auto px-6 py-4 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isPending && activeProfile?.role === UserRole.NUTRICIONISTA ? 'Fornceder Parecer' : 'Ver Detalhes'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* REVIEW MODAL */}
            {selectedOccurrence && (
                <OccurrenceReviewModal
                    occurrence={selectedOccurrence}
                    school={schools.find(s => s.id === selectedOccurrence.escola_id)}
                    activeProfile={activeProfile!}
                    inventory={inventory}
                    onClose={() => setSelectedOccurrence(null)}
                    onReview={handleReview}
                />
            )}
        </div>
    );
};

export default OccurrenceManager;
