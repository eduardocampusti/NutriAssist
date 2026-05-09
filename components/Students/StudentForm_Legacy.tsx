import React, { useState, useEffect } from 'react';
import { Student, School, StudentNutritionalNeeds, FoodNeedType } from '../../types';
import { generateId } from '../../utils/id';
import { studentService } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';

interface StudentFormProps {
    student?: Student;
    schools: School[];
    onSave: (data: any) => void;
    onCancel: () => void;
    readOnlySchoolId?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, schools, onSave, onCancel, readOnlySchoolId }) => {
    const { addToast } = useToast();
    // FORM STATE
    const [formData, setFormData] = useState({
        nome: '',
        escolaId: readOnlySchoolId || '',
        dataNascimento: '',
        possuiNae: false
    });

    // NAE STATE
    const [needs, setNeeds] = useState<StudentNutritionalNeeds[]>([]);
    const [newNeed, setNewNeed] = useState<Partial<StudentNutritionalNeeds>>({
        tipoRestricao: FoodNeedType.ALERGIA,
        descricaoClinica: '',
        anoReferencia: new Date().getFullYear()
    });

    useEffect(() => {
        const loadData = async () => {
            if (student) {
                setFormData({
                    nome: student.nome,
                    escolaId: student.escolaId,
                    dataNascimento: student.dataNascimento,
                    possuiNae: student.possuiNae
                });
                // Load Needs
                if (student.possuiNae) {
                    const loadedNeeds = await studentService.getNeedsByStudent(student.id);
                    setNeeds(loadedNeeds);
                }
            }
        };
        loadData();
    }, [student]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.escolaId || !formData.dataNascimento) {
            addToast("Preencha todos os campos obrigatórios", 'warning');
            return;
        }
        onSave(formData);
    };

    const handleAddNeed = async () => {
        if (!newNeed.descricaoClinica) return;

        const needToAdd = {
            ...newNeed,
            // Temp ID for display if we are creating new student
            id: generateId(),
            alunoId: student?.id || 'temp', // If temp, we must handle in parent
            created_at: Date.now()
        } as StudentNutritionalNeeds;

        setNeeds([...needs, needToAdd]);
        setFormData(prev => ({ ...prev, possuiNae: true }));
        setNewNeed({ tipoRestricao: FoodNeedType.ALERGIA, descricaoClinica: '', anoReferencia: new Date().getFullYear() });

        // If student exists, actually persist
        if (student?.id) {
            try {
                await studentService.addNutritionalNeed({
                    alunoId: student.id,
                    tipoRestricao: needToAdd.tipoRestricao,
                    descricaoClinica: needToAdd.descricaoClinica,
                    anoReferencia: needToAdd.anoReferencia,
                    observacoes: needToAdd.observacoes,
                    laudoMedicoUrl: needToAdd.laudoMedicoUrl
                });
            } catch (e) {
                console.error(e);
                addToast("Erro ao salvar necessidade.", 'error');
            }
        }
    };

    const handleRemoveNeed = async (id: string) => {
        setNeeds(needs.filter(n => n.id !== id));
        if (student?.id) {
            await studentService.removeNutritionalNeed(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-[32px] shadow-lg border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">👤</span>
                {student ? 'Editar Aluno' : 'Novo Cadastro de Aluno'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo *</label>
                        <input
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                            placeholder="NOME DO ALUNO"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Nascimento *</label>
                        <input
                            type="date"
                            value={formData.dataNascimento}
                            onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Escola de Matrícula *</label>
                        <select
                            value={formData.escolaId}
                            onChange={e => setFormData({ ...formData, escolaId: e.target.value })}
                            disabled={!!readOnlySchoolId}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-indigo-500 outline-none disabled:opacity-50"
                        >
                            <option value="">Selecione...</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.possuiNae ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                                {formData.possuiNae && <span className="text-white text-xs">✓</span>}
                            </div>
                            <input type="checkbox" className="hidden" checked={formData.possuiNae} onChange={e => setFormData({ ...formData, possuiNae: e.target.checked })} />
                            <span className={`text-xs font-black uppercase ${formData.possuiNae ? 'text-rose-600' : 'text-slate-500'}`}>
                                Possui Necessidade Alimentar Especial (NAE)
                            </span>
                        </label>
                    </div>
                </div>

                {/* NUTRITIONAL NEEDS SECTION */}
                {formData.possuiNae && (
                    <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-xs font-black text-rose-700 uppercase mb-4 flex items-center gap-2">
                            ⚠️ Restrições Alimentares
                        </h3>

                        {/* LIST EXISTING */}
                        <div className="space-y-2 mb-6">
                            {needs.length === 0 && <p className="text-[10px] text-rose-400 italic">Nenhuma restrição registrada.</p>}
                            {needs.map(n => (
                                <div key={n.id} className="bg-white p-3 rounded-xl border border-rose-100 flex justify-between items-center shadow-sm">
                                    <div>
                                        <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase mr-2">{n.tipoRestricao}</span>
                                        <span className="text-xs font-bold text-slate-700">{n.descricaoClinica}</span>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveNeed(n.id)} className="text-rose-400 hover:text-rose-600 font-black text-xs">X</button>
                                </div>
                            ))}
                        </div>

                        {/* ADD NEW */}
                        {(student?.id || needs.length === 0) && ( // Allow adding only if saved student OR first draft
                            <div className="p-4 bg-white/50 rounded-xl border border-rose-100/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-rose-400 uppercase">Tipo</label>
                                    <select
                                        value={newNeed.tipoRestricao}
                                        onChange={e => setNewNeed({ ...newNeed, tipoRestricao: e.target.value as any })}
                                        className="w-full text-xs font-bold p-2 rounded-lg border border-slate-200"
                                    >
                                        {Object.values(FoodNeedType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-[9px] font-bold text-rose-400 uppercase">Descrição Clínica</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={newNeed.descricaoClinica}
                                            onChange={e => setNewNeed({ ...newNeed, descricaoClinica: e.target.value })}
                                            className="flex-1 text-xs font-bold p-2 rounded-lg border border-slate-200"
                                            placeholder="Ex: Alergia à Proteína do Leite de Vaca (APLV)"
                                        />
                                        <button type="button" onClick={handleAddNeed} className="bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-rose-600">
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!student?.id && needs.length > 0 && (
                            <p className="text-[10px] text-rose-500 mt-2 text-center">* As restrições adicionadas serão salvas ao confirmar o cadastro.</p>
                        )}
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase">Cancelar</button>
                    <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg hover:scale-105 transition-all">
                        Salvar Cadastro
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
