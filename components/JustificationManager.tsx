import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, AdministrativeJustification, JustificationType } from '../types';
import { justificationService } from '../services/justificationService';
import JustificationForm from './JustificationForm';
import {
    ShieldAlert,
    Plus,
    Search,
    History,
    Filter,
    ArrowRight,
    FileText,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface JustificationManagerProps {
    activeProfile: UserProfile;
}

const JustificationManager: React.FC<JustificationManagerProps> = ({ activeProfile }) => {
    const [activeTab, setActiveTab] = useState<'LIST' | 'NEW'>('LIST');
    const [justifications, setJustifications] = useState<AdministrativeJustification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    useEffect(() => {
        loadJustifications();
    }, [activeProfile]);

    const loadJustifications = async () => {
        setLoading(true);
        try {
            // Se for diretor, vê apenas da escola. Se for nutricionista/sede, vê tudo.
            const schoolId = activeProfile.role === UserRole.DIRETOR ? activeProfile.school_id : undefined;

            let query = supabase
                .from('justificativas')
                .select('*, escola:escolas(nome), usuario:profiles(nome)')
                .order('data_fato', { ascending: false });

            if (schoolId) query = query.eq('escola_id', schoolId);

            const { data, error } = await query;
            if (error) throw error;
            setJustifications(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = justifications.filter(j => {
        const matchesSearch = j.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.escola?.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'ALL' || j.tipo === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER MANAGER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance e Transparência</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gestão de Justificativas</h2>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('LIST')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={14} /> Auditória
                    </button>
                    <button
                        onClick={() => setActiveTab('NEW')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'NEW' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Plus size={14} /> Nova Justificativa
                    </button>
                </div>
            </div>

            {activeTab === 'NEW' ? (
                <JustificationForm
                    activeProfile={activeProfile}
                    onSuccess={() => {
                        setActiveTab('LIST');
                        loadJustifications();
                    }}
                    onCancel={() => setActiveTab('LIST')}
                />
            ) : (
                <div className="space-y-6">
                    {/* FILTERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                placeholder="Buscar por descrição ou unidade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none appearance-none"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="ALL">Todos os Tipos de Justificativa</option>
                                {Object.values(JustificationType).map(t => (
                                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* LIST */}
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma justificativa formalizada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map(j => (
                                <div key={j.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black px-3 py-1 bg-slate-900 text-white rounded-full uppercase tracking-widest">
                                                    {j.tipo?.replace('_', ' ')}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(j.data_fato).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-relaxed">
                                                {j.escola?.nome}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic border-l-4 border-slate-100 pl-4 py-1">
                                                "{j.descricao}"
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8 min-w-[180px]">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável Técnico</p>
                                                <p className="text-[10px] font-black text-slate-700 uppercase">{j.usuario?.nome}</p>
                                            </div>
                                            {j.vinculo_tipo && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl text-blue-600">
                                                    <AlertCircle size={12} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Vínculo: {j.vinculo_tipo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JustificationManager;
