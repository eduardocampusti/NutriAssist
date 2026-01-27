import React, { useState, useEffect } from 'react';
import {
    School, Student, Cook, TrainingSession, UserProfile, UserRole
} from '../../types';
import { useSchools } from '../../contexts/SchoolContext';
import { useUsers } from '../../contexts/UserContext';
import { useNutrition } from '../../contexts/NutritionContext';
import { usePNAE } from '../../contexts/PNAEContext';
import { studentService } from '../../services/studentService';
import {
    FileText, Users, School as SchoolIcon, GraduationCap,
    ChefHat, Printer, Search, Filter, ArrowLeft
} from 'lucide-react';
import { OfficialLetterhead } from '../OfficialLetterhead';

interface OperationalReportsProps {
    onClose: () => void;
    activeProfile?: UserProfile;
}

type ReportTab = 'SCHOOLS' | 'STUDENTS_BY_SCHOOL' | 'STUDENT_INDIVIDUAL' | 'TEAM' | 'TRAININGS';

const OperationalReports: React.FC<OperationalReportsProps> = ({ onClose, activeProfile }) => {
    const { schools, cooks } = useSchools();
    const { trainings } = useNutrition();
    const { letterhead } = usePNAE();

    const [activeTab, setActiveTab] = useState<ReportTab>('SCHOOLS');
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        if (activeTab === 'STUDENTS_BY_SCHOOL' || activeTab === 'STUDENT_INDIVIDUAL') {
            loadAllStudents();
        }
    }, [activeTab]);

    const loadAllStudents = async () => {
        setIsLoading(true);
        try {
            const all = await studentService.getAllStudents();
            setStudents(all);
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- RENDERERS ---

    const renderHeader = () => (
        <div className="print:hidden flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Relatórios de Gestão</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidades, Alunos & Equipe</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                >
                    <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
                <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase">
                    Fechar
                </button>
            </div>
        </div>
    );

    const renderPrintHeader = (title: string) => (
        <OfficialLetterhead
            config={letterhead}
            title={title}
            className="hidden print:block mb-8"
        />
    );



    const renderPrintFooter = () => (
        <OfficialLetterhead
            config={letterhead}
            type="footer"
            className="mt-12 opacity-80"
        />
    );

    // Helper to render nested values safely
    const renderValue = (value: any): string => {
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).filter(v => typeof v !== 'object').join(', ') || JSON.stringify(value);
        }
        return String(value);
    };

    const renderSidebar = () => (
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 print:hidden shrink-0 h-full overflow-y-auto">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Tipos de Relatório</div>

            <button
                onClick={() => setActiveTab('SCHOOLS')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'SCHOOLS' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <SchoolIcon className="w-4 h-4" /> Escolas (Rede)
            </button>

            <button
                onClick={() => setActiveTab('STUDENTS_BY_SCHOOL')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'STUDENTS_BY_SCHOOL' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Users className="w-4 h-4" /> Alunos por Escola
            </button>

            <button
                onClick={() => setActiveTab('STUDENT_INDIVIDUAL')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'STUDENT_INDIVIDUAL' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Users className="w-4 h-4" /> Relatório Individual
            </button>

            <button
                onClick={() => setActiveTab('TEAM')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'TEAM' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <ChefHat className="w-4 h-4" /> Equipe de Cozinha
            </button>

            <button
                onClick={() => setActiveTab('TRAININGS')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'TRAININGS' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <GraduationCap className="w-4 h-4" /> Capacitações
            </button>
        </div>
    );

    // --- REPORT VIEWS ---

    const ViewSchools = () => (
        <div className="space-y-6 pb-20 print:pb-0 print:space-y-0 print:flex print:flex-col print:min-h-[29.7cm] print:p-[1.5cm]">
            <div className="print:flex-1">
                {renderPrintHeader('Relatório Geral de Unidades Escolares')}

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Unidade Escolar</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">INEP</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Localidade</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500 text-right">Alunos</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500 text-right">Alunos NAE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map(school => (
                            <tr key={school.id} className="border-b border-slate-100 hover:bg-slate-50 print:hover:bg-transparent">
                                <td className="py-3 text-xs font-bold text-slate-800">{school.nome}</td>
                                <td className="py-3 text-xs text-slate-600">{school.codigo_inep || '-'}</td>
                                <td className="py-3 text-xs text-slate-600">{school.localidade}</td>
                                <td className="py-3 text-xs font-bold text-slate-800 text-right">{school.numAlunos}</td>
                                <td className="py-3 text-xs font-bold text-emerald-600 text-right">{school.numAlunosNE}</td>
                            </tr>
                        ))}
                        <tr className="bg-slate-50 print:bg-transparent border-t-2 border-slate-300">
                            <td className="py-3 text-xs font-black uppercase text-slate-800">Total Geral</td>
                            <td></td>
                            <td></td>
                            <td className="py-3 text-xs font-black text-slate-800 text-right">{schools.reduce((acc, s) => acc + (s.numAlunos || 0), 0)}</td>
                            <td className="py-3 text-xs font-black text-slate-800 text-right">{schools.reduce((acc, s) => acc + (s.numAlunosNE || 0), 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {renderPrintFooter()}
        </div>
    );

    const ViewStudentsBySchool = () => {
        const filteredStudents = students
            .filter(s => !selectedSchoolId || s.escolaId === selectedSchoolId)
            .sort((a, b) => a.nome.localeCompare(b.nome));

        return (
            <div className="space-y-6 pb-20 print:pb-0 print:space-y-0 print:flex print:flex-col print:min-h-[29.7cm] print:p-[1.5cm]">
                <div className="print:hidden bg-slate-50 p-4 rounded-xl flex gap-4 items-center border border-slate-200">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none w-full"
                        value={selectedSchoolId}
                        onChange={e => setSelectedSchoolId(e.target.value)}
                    >
                        <option value="">Todas as Escolas</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>

                <div className="print:flex-1">
                    {renderPrintHeader(`Listagem de Alunos - ${selectedSchoolId ? schools.find(s => s.id === selectedSchoolId)?.nome : 'Geral'}`)}

                    <div className="mb-4 text-xs font-bold text-slate-500 uppercase">
                        Total de Alunos Listados: {filteredStudents.length}
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-2 text-xs font-black uppercase text-slate-500">Nome do Aluno</th>
                                <th className="py-2 text-xs font-black uppercase text-slate-500">Data Nasc.</th>
                                <th className="py-2 text-xs font-black uppercase text-slate-500">Idade</th>
                                {!selectedSchoolId && <th className="py-2 text-xs font-black uppercase text-slate-500">Escola</th>}
                                <th className="py-2 text-xs font-black uppercase text-slate-500">NAE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => {
                                const age = studentService.calculateAgeInMonths(student.dataNascimento);
                                const years = Math.floor(age / 12);
                                const months = age % 12;
                                return (
                                    <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="py-2 text-xs font-bold text-slate-800">{student.nome}</td>
                                        <td className="py-2 text-xs text-slate-600">{new Date(student.dataNascimento).toLocaleDateString()}</td>
                                        <td className="py-2 text-xs text-slate-600">{years}a {months}m</td>
                                        {!selectedSchoolId && (
                                            <td className="py-2 text-xs text-slate-500 truncate max-w-[150px]">
                                                {schools.find(s => s.id === student.escolaId)?.nome}
                                            </td>
                                        )}
                                        <td className="py-2 text-xs font-bold">
                                            {student.possuiNae ? <span className="text-red-600">SIM</span> : <span className="text-slate-300">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {renderPrintFooter()}
            </div>
        );
    };

    const ViewIndividualStudent = () => {
        if (!selectedStudent) {
            const filteredSearch = students.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));

            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 print:hidden">Selecione um Aluno</h3>

                    <div className="print:hidden bg-white border border-slate-300 rounded-xl flex items-center px-4 py-3 shadow-sm mb-6">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input
                            className="flex-1 outline-none text-sm font-medium"
                            placeholder="Buscar aluno por nome..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="print:hidden border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                        {filteredSearch.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Nenhum aluno encontrado.</div>
                        ) : (
                            filteredSearch.slice(0, 50).map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedStudent(s)}
                                    className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{s.nome}</p>
                                        <p className="text-xs text-slate-500">
                                            {schools.find(sch => sch.id === s.escolaId)?.nome} • {new Date(s.dataNascimento).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-slate-300"><ArrowLeft className="w-4 h-4 rotate-180" /></div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="hidden print:block text-center p-10 border border-black border-dashed">
                        Selecione um aluno na tela para gerar o relatório individual.
                    </div>
                </div>
            );
        }

        const school = schools.find(s => s.id === selectedStudent.escolaId);
        const age = studentService.calculateAgeInMonths(selectedStudent.dataNascimento);

        return (
            <div className="max-w-3xl mx-auto pb-20 print:pb-0 print:space-y-0 print:flex print:flex-col print:min-h-[29.7cm] print:p-[1.5cm]">
                <div className="print:hidden mb-6">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para busca
                    </button>
                </div>

                <div className="print:flex-1">
                    {renderPrintHeader('Ficha Individual do Aluno')}

                    <div className="border border-slate-300 rounded-xl p-6 mb-6 print:border-black">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black uppercase text-slate-900">{selectedStudent.nome}</h3>
                                <p className="text-sm text-slate-600 font-bold uppercase mt-1">{school?.nome || 'Escola não informada'}</p>
                            </div>
                            {selectedStudent.foto_url && (
                                <img src={selectedStudent.foto_url} className="w-24 h-24 rounded-xl object-cover border border-slate-200" alt="Foto" />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="block text-[10px] font-black uppercase text-slate-400">Data de Nascimento</span>
                                <span className="font-bold text-slate-800">{new Date(selectedStudent.dataNascimento).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-black uppercase text-slate-400">Idade</span>
                                <span className="font-bold text-slate-800">{Math.floor(age / 12)} anos e {age % 12} meses</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-black uppercase text-slate-400">Restrição Alimentar (NAE)</span>
                                <span className={`font-bold ${selectedStudent.possuiNae ? 'text-red-600 uppercase' : 'text-slate-800'}`}>
                                    {selectedStudent.possuiNae ? 'SIM' : 'NÃO'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-black uppercase text-slate-400">ID Sistema</span>
                                <span className="font-mono text-slate-600 text-xs">{selectedStudent.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </div>

                    {selectedStudent.dados_complementares && (
                        <div className="mb-6">
                            <h4 className="text-sm font-black uppercase text-slate-800 mb-2 border-b border-slate-200 pb-2">Dados Complementares</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedStudent.dados_complementares)
                                    .filter(([key]) => {
                                        const k = key.toUpperCase();
                                        return !['PHOTOURL', 'DOCUMENTS', 'GUARDIANS'].includes(k)
                                            && !k.includes('ID')
                                            && !k.includes('URL')
                                            && !k.includes('PHOTO');
                                    })
                                    .map(([key, value]) => {
                                        if (!value || (Array.isArray(value) && value.length === 0)) return null;

                                        let displayValue = String(value);

                                        // Custom formatters
                                        if (typeof value === 'object' && value !== null) {
                                            if (Array.isArray(value)) {
                                                displayValue = value.length > 0 ? JSON.stringify(value) : '-';
                                            } else {
                                                // Flatten object values cleanly
                                                displayValue = Object.entries(value)
                                                    .filter(([_, v]) => v && String(v).trim() !== '')
                                                    .map(([_, v]) => String(v))
                                                    .join(', ');
                                            }
                                        }

                                        if (displayValue === '[object Object]') displayValue = '-';
                                        if (displayValue.length > 100) displayValue = displayValue.substring(0, 100) + '...';

                                        return (
                                            <div key={key}>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                                                <p className="text-xs font-medium text-slate-700 break-words">{displayValue}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t-2 border-slate-100 print:text-black">
                        <p className="text-center text-xs font-bold uppercase text-slate-400 mb-16">Espaço para Anotações</p>
                        <div className="h-px bg-slate-300 mb-8"></div>
                        <div className="h-px bg-slate-300 mb-8"></div>
                        <div className="h-px bg-slate-300 mb-8"></div>
                    </div>
                </div>
                {renderPrintFooter()}
            </div>
        );
    };

    const ViewTeam = () => (
        <div className="space-y-6 pb-20 print:pb-0 print:space-y-0 print:flex print:flex-col print:min-h-[29.7cm] print:p-[1.5cm]">
            <div className="print:hidden bg-slate-50 p-4 rounded-xl flex gap-4 items-center border border-slate-200">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                    className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none w-full"
                    value={selectedSchoolId}
                    onChange={e => setSelectedSchoolId(e.target.value)}
                >
                    <option value="">Todas as Escolas</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
            </div>

            <div className="print:flex-1">
                {renderPrintHeader('Relatório da Equipe de Cozinha (Merendeiras)')}

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Nome Completo</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">CPF</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Escola Lotação</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Telefone</th>
                            <th className="py-2 text-xs font-black uppercase text-slate-500">Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cooks
                            .filter(c => !selectedSchoolId || c.escolaId === selectedSchoolId)
                            .map(cook => (
                                <tr key={cook.id} className="border-b border-slate-100 hover:bg-slate-50 print:hover:bg-transparent">
                                    <td className="py-3 text-xs font-bold text-slate-800">{cook.nome}</td>
                                    <td className="py-3 text-xs text-slate-600 font-mono">{cook.cpf}</td>
                                    <td className="py-3 text-xs text-slate-600">
                                        {schools.find(s => s.id === cook.escolaId)?.nome || 'Não vinculada'}
                                    </td>
                                    <td className="py-3 text-xs text-slate-600">{cook.telefone || '-'}</td>
                                    <td className="py-3 text-xs font-bold">
                                        {cook.ativo ? <span className="text-emerald-600">ATIVA</span> : <span className="text-slate-400">INATIVA</span>}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {renderPrintFooter()}
        </div>
    );

    const ViewTrainings = () => (
        <div className="space-y-6 pb-20 print:pb-0 print:space-y-0 print:flex print:flex-col print:min-h-[29.7cm] print:p-[1.5cm]">
            <div className="print:flex-1">
                {renderPrintHeader('Relatório de Capacitações e Treinamentos')}

                <div className="grid gap-6">
                    {trainings.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">Nenhum treinamento registrado.</div>
                    ) : (
                        trainings.map(training => (
                            <div key={training.id} className="border border-slate-200 rounded-xl p-6 break-inside-avoid print:border-black">
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-sm font-black uppercase text-slate-800">{training.tema}</h3>
                                    <span className="text-xs font-bold text-slate-500">{new Date(training.data).toLocaleDateString()}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                                    <div>
                                        <span className="block text-[10px] uppercase text-slate-400 font-bold">Carga Horária</span>
                                        <span>{training.cargaHoraria} horas</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase text-slate-400 font-bold">Participantes</span>
                                        <span>{training.numParticipantes}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Conteúdo Programático</span>
                                    <p className="text-xs text-slate-700 mt-1">{training.conteudoProgramatico}</p>
                                </div>

                                <div>
                                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Escolas Participantes</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {training.escolasParticipantesIds.map(schId => {
                                            const schoolName = schools.find(s => s.id === schId)?.nome;
                                            return schoolName ? (
                                                <span key={schId} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200 uppercase print:border-black print:text-black">
                                                    {schoolName}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {renderPrintFooter()}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col print:relative print:inset-auto print:overflow-visible print:block print:h-auto">
            <div className="flex flex-1 overflow-hidden print:overflow-visible print:block print:h-auto">
                {renderSidebar()}

                <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden print:bg-white print:block print:h-auto print:overflow-visible">
                    <div className="p-8 pb-4 print:hidden">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                                    {activeTab === 'SCHOOLS' && 'Relatório de Escolas'}
                                    {activeTab === 'STUDENTS_BY_SCHOOL' && 'Alunos por Escola'}
                                    {activeTab === 'STUDENT_INDIVIDUAL' && 'Ficha Individual'}
                                    {activeTab === 'TEAM' && 'Equipe de Cozinha'}
                                    {activeTab === 'TRAININGS' && 'Capacitações'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {letterhead.municipio} • Gestão PNAE
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handlePrint}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" /> Imprimir
                                </button>
                                <button onClick={onClose} className="px-4 py-2 text-slate-400 font-bold text-xs uppercase hover:text-red-500">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-4 print:p-0 print:overflow-visible print:h-auto print:block">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 min-h-full print:border-none print:shadow-none print:p-0 print:block print:h-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'SCHOOLS' && <ViewSchools />}
                                    {activeTab === 'STUDENTS_BY_SCHOOL' && <ViewStudentsBySchool />}
                                    {activeTab === 'STUDENT_INDIVIDUAL' && <ViewIndividualStudent />}
                                    {activeTab === 'TEAM' && <ViewTeam />}
                                    {activeTab === 'TRAININGS' && <ViewTrainings />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalReports;
