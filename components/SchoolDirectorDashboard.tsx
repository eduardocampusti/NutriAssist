import React, { useMemo } from 'react';
import { UserProfile, School, MenuPlan, MenuExecution } from '../types';
import { useSchools } from '../contexts/SchoolContext';
import { useMenu } from '../contexts/MenuContext';
import { useInventory } from '../contexts/InventoryContext';
import { AccessGate } from './Security/AccessGate';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertCircle, FileText, Upload, Calendar, ArrowRight, Truck, AlertTriangle, School as SchoolIcon } from 'lucide-react';
import OccurrenceForm from './Inventory/OccurrenceForm';
import { occurrenceService } from '../services/occurrenceService';
import { useToast } from '../contexts/ToastContext';
import { PageHeader } from './UI/PageHeader';
import { Card } from './UI/Card';

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
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in duration-500">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-bold">Nenhuma escola vinculada ao seu perfil.</p>
                <p className="text-sm">Entre em contato com a Secretaria de Educação.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            {/* HEADER */}
            <PageHeader
                title={school.nome}
                subtitle={`Painel do Gestor • INEP: ${school.codigo_inep}`}
                icon={<SchoolIcon className="w-6 h-6" />}
                actions={
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowOccurrenceForm(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 group"
                        >
                            <AlertTriangle size={16} className="group-hover:animate-pulse" />
                            Registrar Intercorrência
                        </button>
                        <button
                            onClick={() => navigate('/importar-alunos')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Upload size={16} />
                            Importar Alunos
                        </button>
                    </div>
                }
            />

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
                {/* METRICS GRID - GOVERNANCE STYLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Matrículas', value: school.numAlunos, sub: 'Ativos no Censo', icon: <Users size={24} /> },
                        { title: 'Alunos NE', value: school.numAlunosNE, sub: 'Necessidades Especiais', icon: <AlertCircle size={24} /> },
                        { title: 'Cardápio', value: myExecutionToday ? 'Executado' : 'Pendente', sub: 'Status Hoje', icon: <BookOpen size={24} /> },
                        { title: 'Pendências', value: '0', sub: 'Regular', icon: <FileText size={24} /> }
                    ].map((stat, i) => (
                        <Card key={i} variant="governance" padding="md" className="hover:bg-surface-50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-slate-400 group-hover:text-slate-900 transition-colors">{stat.icon}</span>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm"></div>
                            </div>
                            <p className="text-4xl font-display font-black text-slate-900 tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
                        </Card>
                    ))}
                </div>

                {/* QUICK ACTIONS ROW */}
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Acesso Rápido</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        onClick={() => navigate('/alunos')}
                        className="group cursor-pointer hover:bg-emerald-600 hover:text-white transition-all duration-300"
                        variant="governance"
                        padding="lg"
                    >
                        <div className="flex items-center gap-4">
                            <Users size={32} className="text-slate-900 group-hover:text-white transition-colors" />
                            <div>
                                <h4 className="font-display font-black uppercase text-xl text-slate-900 group-hover:text-white">Turmas</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-200">Gerenciar Alunos</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        onClick={() => navigate('/cardapio')}
                        className="group cursor-pointer hover:bg-emerald-600 hover:text-white transition-all duration-300"
                        variant="governance"
                        padding="lg"
                    >
                        <div className="flex items-center gap-4">
                            <Calendar size={32} className="text-slate-900 group-hover:text-white transition-colors" />
                            <div>
                                <h4 className="font-display font-black uppercase text-xl text-slate-900 group-hover:text-white">Cardápio</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-200">Registrar Adesão</p>
                            </div>
                        </div>
                    </Card>

                    <AccessGate permission="RECEIVE_DISTRIBUTION">
                        <Card
                            onClick={() => navigate('/estoque/recebimento')}
                            className="group cursor-pointer hover:bg-emerald-600 hover:text-white transition-all duration-300"
                            variant="governance"
                            padding="lg"
                        >
                            <div className="flex items-center gap-4">
                                <Truck size={32} className="text-slate-900 group-hover:text-white transition-colors" />
                                <div>
                                    <h4 className="font-display font-black uppercase text-xl text-slate-900 group-hover:text-white">Estoque</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-200">Receber Cota</p>
                                </div>
                            </div>
                        </Card>
                    </AccessGate>
                </div>

            </div>
            );
};


