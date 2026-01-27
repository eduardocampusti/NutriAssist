import React, { useState, useEffect } from 'react';
import { exportToCSV } from '../../utils/export';
import { Student, School, UserProfile, UserRole } from '../../types';
import { studentService } from '../../services/studentService';
import { auditService } from '../../services/auditService';
import { hasPermission } from '../../utils/permissions';
import { StudentForm } from './StudentForm';
import { NutritionalDiagnosisForm } from '../NutritionalDiagnosis/NutritionalDiagnosisForm';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmModal } from '../ConfirmModal';

interface StudentManagerProps {
    schools: School[];
    activeProfile?: UserProfile;
    onClose: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ schools, activeProfile, onClose }) => {
    const { addToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [filterSchool, setFilterSchool] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
    const [evaluationStudent, setEvaluationStudent] = useState<Student | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

    // Computed: Can manage all or just own school?
    const isGlobalAdmin = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.SECRETARIO;
    const userSchoolId = activeProfile?.school_id;

    useEffect(() => {
        loadStudents();
    }, [filterSchool]); // Reload if school filter changes (or just filter locally)

    const loadStudents = async () => {
        try {
            const all = await studentService.getAllStudents();
            setStudents(all);

            // LGPD: Log access to student database
            if (activeProfile) {
                auditService.logAccess(
                    activeProfile.id,
                    'STUDENTS_LIST',
                    'ALL',
                    `Acessou listagem de alunos. Filtro: ${filterSchool || 'Geral'}`
                );
            }
        } catch (error) {
            console.error("Failed to load students", error);
        }
    };

    const handleSave = async (studentData: any) => {
        try {
            if (editingStudent) {
                await studentService.updateStudent(editingStudent.id, studentData);
                if (activeProfile) {
                    auditService.logAction(
                        activeProfile.id,
                        'UPDATE_STUDENT',
                        'alunos',
                        editingStudent.id,
                        { nome: studentData.nome }
                    );
                }
            } else {
                const newStudent = await studentService.createStudent(studentData);
                if (activeProfile) {
                    auditService.logAction(
                        activeProfile.id,
                        'CREATE_STUDENT',
                        'alunos',
                        (newStudent as any)?.id || 'NEW',
                        { nome: studentData.nome }
                    );
                }
            }
            setIsFormOpen(false);
            setEditingStudent(undefined);
            await loadStudents();
            addToast("Aluno salvo com sucesso!", 'success');
        } catch (e) {
            console.error(e);
            addToast("Erro ao salvar aluno. Verifique os dados e tente novamente.", 'error');
        }
    };

    const confirmDelete = (id: string) => {
        setStudentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        try {
            await studentService.deleteStudent(studentToDelete);
            if (activeProfile) {
                auditService.logAction(activeProfile.id, 'DELETE_STUDENT', 'alunos', studentToDelete);
            }
            await loadStudents();
            addToast("Aluno excluído com sucesso!", 'success');
        } catch (error) {
            console.error(error);
            addToast("Erro ao excluir aluno.", 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(s => {
        // School Filter
        if (!isGlobalAdmin && userSchoolId && s.escolaId !== userSchoolId) return false;
        if (isGlobalAdmin && filterSchool && s.escolaId !== filterSchool) return false;

        // Search
        if (searchTerm && !s.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        return true; // Active filtering is done in service
    });

    if (isFormOpen) {
        return (

            <StudentForm
                initialData={editingStudent}
                schools={isGlobalAdmin ? schools : schools.filter(s => s.id === userSchoolId)}
                onSuccess={async () => {
                    await loadStudents();
                    setIsFormOpen(false);
                    setEditingStudent(undefined);
                    // Add audit log here if possible, or rely on service.
                    // Ideally we'd log that an action completed.
                }}
                onCancel={() => { setIsFormOpen(false); setEditingStudent(undefined); }}
            />
        );

    }

    if (evaluationStudent && activeProfile) {
        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl relative">
                    <NutritionalDiagnosisForm
                        student={evaluationStudent}
                        activeProfile={activeProfile}
                        onClose={() => setEvaluationStudent(null)}
                        onSaveSuccess={async () => {
                            setEvaluationStudent(null);
                            // Opcional: recarregar lista se necessário, mas diagnóstico não muda dados cadastrais do aluno
                        }}
                    />
                </div>
            </div>
        );
    }

    // Export Logic
    const handleExport = () => {
        const dataToExport = filteredStudents.map(s => {
            const schoolName = schools.find(sch => sch.id === s.escolaId)?.nome || 'N/A';
            return {
                Nome: s.nome,
                'Data Nascimento': s.dataNascimento,
                Idade: `${studentService.calculateAgeInMonths(s.dataNascimento)} meses`,
                Escola: schoolName,
                'Possui NE': s.clinical?.specialNeeds?.length ? 'SIM' : 'NÃO',
                'Diagnóstico': s.clinical?.diagnosis || '',
                'Alergias': s.clinical?.allergies || '',
                'Responsável': s.guardians?.[0]?.name || '',
                'Contato': s.guardians?.[0]?.phone || ''
            };
        });

        exportToCSV(dataToExport, `alunos_brotar_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-white rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl text-indigo-600">
                        🎓
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Alunos</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Dados & Saúde Nutricional</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">
                        Voltar ao Início
                    </button>
                    {(hasPermission(activeProfile?.role, 'MANAGE_STUDENTS') || activeProfile?.role === UserRole.NUTRICIONISTA) && (
                        <button
                            onClick={handleExport}
                            className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
                            title="Exportar Lista Filtrada"
                        >
                            📊 Exportar
                        </button>
                    )}
                    {hasPermission(activeProfile?.role, 'MANAGE_STUDENTS') && (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg hover:scale-105 transition-all"
                        >
                            + Novo Aluno
                        </button>
                    )}
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white p-2 rounded-2xl border border-slate-200 flex items-center px-4">
                    <span className="text-slate-400 mr-2">🔍</span>
                    <input
                        placeholder="Buscar por nome..."
                        className="flex-1 border-none focus:ring-0 text-sm font-medium outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {isGlobalAdmin && (
                    <select
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase text-slate-600 outline-none"
                        value={filterSchool}
                        onChange={e => setFilterSchool(e.target.value)}
                    >
                        <option value="">Todas as Escolas</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                )}
            </div>

            {/* LIST */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Idade</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Escola</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">NAE</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 text-sm italic">Nenhum aluno encontrado.</td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => {
                                    const ageMonths = studentService.calculateAgeInMonths(student.dataNascimento);
                                    const years = Math.floor(ageMonths / 12);
                                    const months = ageMonths % 12;

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <p className="text-sm font-black text-slate-800 uppercase">{student.nome}</p>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${ageMonths < 36 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {years}a {months}m ({ageMonths}m)
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-xs font-bold text-slate-500">{schools.find(s => s.id === student.escolaId)?.nome || '-'}</p>
                                            </td>
                                            <td className="px-8 py-4">
                                                {student.possuiNae ? (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-600 animate-pulse">
                                                        ⚠️ Possui Restrição
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                {hasPermission(activeProfile?.role, 'MANAGE_STUDENTS') ? (
                                                    <>
                                                        <button
                                                            onClick={() => { setEditingStudent(student); setIsFormOpen(true); }}
                                                            className="mr-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(student.id)}
                                                            className="text-rose-400 hover:text-rose-600 font-bold text-xs uppercase"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase">Apenas Leitura</span>
                                                )}

                                                {/* BOTÃO AVALIAR - VIGILÂNCIA NUTRICIONAL */}
                                                {(activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN) && (
                                                    <button
                                                        onClick={() => setEvaluationStudent(student)}
                                                        className="ml-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                                                        title="Realizar Avaliação Nutricional"
                                                    >
                                                        Avaliar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* CONFIRM MODAL */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Excluir Aluno"
                message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
                confirmLabel="Sim, Excluir"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />
        </div>
    );
};

export default StudentManager;
