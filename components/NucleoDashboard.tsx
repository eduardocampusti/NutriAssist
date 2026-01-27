
import React, { useMemo, useState } from 'react';
import { UserProfile, School, MenuPlan, MenuExecution } from '../types';
import { useSchools } from '../contexts/SchoolContext';
import { useMenu } from '../contexts/MenuContext';
import { useInventory } from '../contexts/InventoryContext';
import { AccessGate } from './Security/AccessGate';
import { useNavigate } from 'react-router-dom';
import {
    Users, BookOpen, AlertCircle, FileText, Upload,
    Calendar, ArrowRight, Truck, AlertTriangle, Building2,
    ChevronRight, Search
} from 'lucide-react';
import OccurrenceForm from './Inventory/OccurrenceForm';
import { occurrenceService } from '../services/occurrenceService';
import { useToast } from '../contexts/ToastContext';

interface NucleoDashboardProps {
    activeProfile: UserProfile;
}

const NucleoDashboard: React.FC<NucleoDashboardProps> = ({
    activeProfile
}) => {
    const navigate = useNavigate();
    const { schools } = useSchools();
    const { menuPlans, executions } = useMenu();
    const { inventory } = useInventory();
    const { addToast } = useToast();

    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
    const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter schools for the user's zone
    const mySchools = useMemo(() =>
        schools.filter(s => s.zona_id === activeProfile.zona_id),
        [schools, activeProfile.zona_id]);

    const selectedSchool = useMemo(() =>
        mySchools.find(s => s.id === selectedSchoolId),
        [mySchools, selectedSchoolId]);

    // Metrics for the selected school
    const myPlans = useMemo(() =>
        menuPlans.filter(p => !p.escolaId || p.escolaId === selectedSchool?.id),
        [menuPlans, selectedSchool]);

    const today = new Date().toISOString().split('T')[0];
    const myExecutionToday = executions.find(e => e.schoolId === selectedSchool?.id && e.date === today);

    const handleOccurrenceSubmit = async (occurrence: any) => {
        try {
            await occurrenceService.create(occurrence);
            addToast("Intercorrência registrada com sucesso! A Nutricionista RT será notificada.", 'success');
            setShowOccurrenceForm(false);
        } catch (error) {
            addToast("Erro ao registrar no servidor.", 'error');
        }
    };

    const filteredSchools = mySchools.filter(s =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            {/* HEADER NÚCLEO */}
            <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                Gestão Regional
                            </span>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Zona Escolar {activeProfile.zona_id}</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter leading-none">
                            NÚCLEO ADMINISTRATIVO
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl">
                            Bem-vindo(a), {activeProfile.nome}. Você é responsável pela gestão da alimentação escolar de {mySchools.length} unidades na região {activeProfile.zona_id}.
                        </p>
                    </div>

                    <div className="flex bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="text-center px-6 border-r border-white/10">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Escolas</p>
                            <p className="text-2xl font-black">{mySchools.length}</p>
                        </div>
                        <div className="text-center px-6">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Alertas</p>
                            <p className="text-2xl font-black">0</p>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SCHOOL SELECTOR SIDEBAR */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-3">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar unidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-bold text-slate-700 outline-none"
                        />
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredSchools.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSchoolId(s.id)}
                                className={`w-full p-6 h-28 rounded-[28px] border transition-all text-left flex items-center gap-5 group ${selectedSchoolId === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl translate-x-2' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${selectedSchoolId === s.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                                    🏫
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-black uppercase tracking-tight truncate ${selectedSchoolId === s.id ? 'text-white' : 'text-slate-800'}`}>{s.nome}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedSchoolId === s.id ? 'text-indigo-200' : 'text-slate-400'}`}>INEP: {s.codigo_inep}</p>
                                </div>
                                <ChevronRight size={18} className={`transition-transform ${selectedSchoolId === s.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* SELECTED SCHOOL VIEW */}
                <div className="lg:col-span-2">
                    {selectedSchool ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSchool.nome}</h2>
                                        <p className="text-slate-500 text-sm font-medium">Gestão técnica compartilhada via Núcleo Cocal</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowOccurrenceForm(true)}
                                            className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <AlertTriangle size={14} /> Registrar Erro
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Matrículas</p>
                                        <p className="text-2xl font-black text-slate-800">{selectedSchool.numAlunos}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">NE</p>
                                        <p className="text-2xl font-black text-rose-600">{selectedSchool.numAlunosNE}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Hoje</p>
                                        <p className="text-xs font-black uppercase text-indigo-600 mt-2">{myExecutionToday ? '✓ Servido' : '○ Pendente'}</p>
                                    </div>
                                    <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-100 flex flex-col justify-center cursor-pointer" onClick={() => navigate('/estoque')}>
                                        <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Saldo Estoque</p>
                                        <p className="text-sm font-black flex items-center gap-2">Consultar <ArrowRight size={12} /></p>
                                    </div>
                                </div>

                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/estoque/recebimento')}
                                        className="p-6 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-3xl border border-emerald-100 transition-all text-left flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">Confirmar Entrega</p>
                                            <p className="text-[10px] opacity-70 font-medium">Receber mercadorias da Central</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/estoque/auditoria')}
                                        className="p-6 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-3xl border border-amber-100 transition-all text-left flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">Realizar Auditoria</p>
                                            <p className="text-[10px] opacity-70 font-medium">Conferir saldos e validades</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* QUICK LINK TO REPLENISHMENT */}
                            <div
                                onClick={() => navigate('/estoque/reposicao')}
                                className="bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-indigo-100 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm text-indigo-600 font-black">
                                        📦
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tight">Solicitar Reposição</h3>
                                        <p className="text-sm text-indigo-600/70 font-medium">Pedido oficial de alimentos para {selectedSchool.nome}</p>
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ArrowRight />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px] text-slate-400 space-y-4">
                            <Building2 size={64} strokeWidth={1} />
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-600">Selecione uma Unidade Escolar</p>
                                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-1">Ao lado, escolha a escola que deseja gerenciar administrativamente hoje.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showOccurrenceForm && selectedSchool && (
                <OccurrenceForm
                    school={selectedSchool}
                    activeProfile={activeProfile}
                    inventory={inventory}
                    activeMenus={myPlans as any}
                    onClose={() => setShowOccurrenceForm(false)}
                    onSubmit={handleOccurrenceSubmit}
                />
            )}
        </div>
    );
};

export default NucleoDashboard;
