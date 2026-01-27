import React, { useState, useEffect } from 'react';
import { TimelineEvent, EventType, UserProfile, UserRole, School } from '../types';
import { historyService } from '../services/historyService';
import ServiceTimeline from './ServiceTimeline';
import {
    Search,
    Filter,
    Calendar,
    Download,
    AlertCircle,
    School as SchoolIcon,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface SchoolServiceHistoryProps {
    activeProfile: UserProfile;
}

const SchoolServiceHistory: React.FC<SchoolServiceHistoryProps> = ({ activeProfile }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activeProfile.school_id || '');
    const [schools, setSchools] = useState<School[]>([]);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const isStaff = [UserRole.NUTRICIONISTA, UserRole.TECNICO, UserRole.SECRETARIA].includes(activeProfile.role);

    useEffect(() => {
        if (isStaff) {
            loadSchools();
        }
    }, []);

    useEffect(() => {
        if (selectedSchoolId) {
            loadTimeline();
        }
    }, [selectedSchoolId]);

    const loadSchools = async () => {
        const { data } = await supabase.from('escolas').select('*').order('nome');
        if (data) setSchools(data);
    };

    const loadTimeline = async () => {
        setLoading(true);
        try {
            const data = await historyService.getSchoolTimeline(selectedSchoolId);
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesType = filterType === 'ALL' || event.tipo === filterType;
        const eventDate = new Date(event.data);
        const matchesStart = !dateRange.start || eventDate >= new Date(dateRange.start);
        const matchesEnd = !dateRange.end || eventDate <= new Date(dateRange.end);
        return matchesType && matchesStart && matchesEnd;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* HEADER & FILTERS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Histórico de Atendimento</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transparência e Rastreabilidade Logística</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isStaff && (
                            <div className="relative">
                                <SchoolIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <select
                                    className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none appearance-none"
                                    value={selectedSchoolId}
                                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                                >
                                    <option value="">Selecionar Escola...</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={loadTimeline}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">Todos os Tipos</option>
                            <option value={EventType.ENTREGA}>Entregas</option>
                            <option value={EventType.SOLICITACAO}>Solicitações</option>
                            <option value={EventType.OCORRENCIA}>Alertas/Ocorrências</option>
                            <option value={EventType.SANITARIO}>Controle Sanitário</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase text-slate-600 outline-none"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            placeholder="Data Início"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase text-slate-600 outline-none"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            placeholder="Data Fim"
                        />
                    </div>
                </div>
            </div>

            {/* TIMELINE CONTENT */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-50 shadow-sm">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Histórico...</p>
                </div>
            ) : selectedSchoolId ? (
                <div className="px-4">
                    <ServiceTimeline events={filteredEvents} />
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Aguardando Seleção</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Escolha uma unidade escolar para visualizar o histórico.</p>
                </div>
            )}

            {/* FOOTER STATS SLICE (Optional but recommended for WOW) */}
            {!loading && selectedSchoolId && filteredEvents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Eventos</p>
                        <div className="text-2xl font-black text-slate-900">{filteredEvents.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargas Recebidas</p>
                        <div className="text-2xl font-black text-blue-600">{filteredEvents.filter(e => e.tipo === EventType.ENTREGA).length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitações</p>
                        <div className="text-2xl font-black text-indigo-600">{filteredEvents.filter(e => e.tipo === EventType.SOLICITACAO).length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Alerta de Saúde</p>
                        <div className="text-2xl font-black text-rose-600">{filteredEvents.filter(e => e.tipo === EventType.OCORRENCIA).length}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolServiceHistory;
