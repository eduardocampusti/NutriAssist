import React, { useMemo } from 'react';
import { UserProfile, School, MenuPlan, MenuExecution } from '../types';
import { useSchools } from '../contexts/SchoolContext';
import { useMenu } from '../contexts/MenuContext';
import { useInventory } from '../contexts/InventoryContext';
import { AccessGate } from './Security/AccessGate';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertCircle, FileText, Upload, Calendar, ArrowRight, Truck, AlertTriangle } from 'lucide-react';
import OccurrenceForm from './Inventory/OccurrenceForm';
import { occurrenceService } from '../services/occurrenceService';
import { useToast } from '../contexts/ToastContext';

interface SchoolDirectorDashboardProps {
    activeProfile: UserProfile;
    school: School | undefined;
}

const SchoolDirectorDashboard: React.FC<SchoolDirectorDashboardProps> = ({
    activeProfile,
    school
}) => {
    const navigate = useNavigate();
    const { menuPlans, executions } = useMenu();
    const { inventory } = useInventory();
    const { addToast } = useToast();
    const [showOccurrenceForm, setShowOccurrenceForm] = React.useState(false);

    // Filter data for this school
    const myPlans = useMemo(() =>
        menuPlans.filter(p => !p.escolaId || p.escolaId === school?.id),
        [menuPlans, school]);

    const today = new Date().toISOString().split('T')[0];
    const myExecutionToday = executions.find(e => e.schoolId === school?.id && e.date === today);

    const handleOccurrenceSubmit = async (occurrence: any) => {
        try {
            await occurrenceService.create(occurrence);
            addToast("Intercorrência registrada com sucesso! A Nutricionista RT será notificada.", 'success');
            setShowOccurrenceForm(false);
        } catch (error) {
            addToast("Erro ao registrar no servidor, mas o protocolo foi gerado localmente.", 'warning');
            setShowOccurrenceForm(false);
        }
    };

    if (!school) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-lg font-bold">Nenhuma escola vinculada ao seu perfil.</p>
                <p className="text-sm">Entre em contato com a Secretaria de Educação.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            Painel do Gestor
                        </span>
                        <span className="text-slate-400 text-xs font-medium">INEP: {school.codigo_inep}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-tight">
                        {school.nome}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Olá, {activeProfile.nome}. Bem-vindo(a) à gestão técnica.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowOccurrenceForm(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <AlertTriangle size={18} />
                        Registrar Intercorrência
                    </button>
                    <button
                        onClick={() => navigate('/importar-alunos')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <Upload size={18} />
                        Importar Alunos
                    </button>
                </div>
            </div>

            {showOccurrenceForm && (
                <OccurrenceForm
                    school={school}
                    activeProfile={activeProfile}
                    inventory={inventory}
                    activeMenus={myPlans as any}
                    onClose={() => setShowOccurrenceForm(false)}
                    onSubmit={handleOccurrenceSubmit}
                />
            )}

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrículas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{school.numAlunos}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Alunos ativos no censo</p>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos NE</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{school.numAlunosNE}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Necessidades Especiais</p>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cardápio</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{myExecutionToday ? 'Executado' : 'Pendente'}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Status da alimentação hoje</p>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendências</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">0</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Ações requeridas</p>
                </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/alunos')}
                    className="group cursor-pointer bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-emerald-100 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Users size={20} className="stroke-[3]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Gerenciar Turmas</h4>
                            <p className="text-xs text-slate-500">Listagem e edição de alunos</p>
                        </div>
                        <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                </div>

                <div
                    onClick={() => navigate('/cardapio')}
                    className="group cursor-pointer bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-emerald-100 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Calendar size={20} className="stroke-[3]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Executar Cardápio</h4>
                            <p className="text-xs text-slate-500">Registrar adesão diária</p>
                        </div>
                        <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                </div>

                <AccessGate permission="RECEIVE_DISTRIBUTION">
                    <div
                        onClick={() => navigate('/estoque/recebimento')}
                        className="group cursor-pointer bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-emerald-100 transition-all relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <Truck size={20} className="stroke-[3]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Receber Mercadorias</h4>
                                <p className="text-xs text-slate-500">Conferir entregas da Central</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </div>
                </AccessGate>
            </div>

        </div>
    );
};

export default SchoolDirectorDashboard;
