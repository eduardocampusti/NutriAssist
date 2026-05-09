import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, Cook, StudentNE } from '../types';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';
import { useDocuments } from './DocumentContext';
import { useAuth } from './AuthContext';

import { generateId } from '../utils/id';

interface SchoolContextType {
    schools: School[];
    cooks: Cook[];
    studentsNE: StudentNE[];
    addSchool: (school: Omit<School, 'id' | 'created_at' | 'ativo'>) => Promise<void>;
    updateSchool: (id: string, updates: Partial<School>) => Promise<void>;
    toggleSchool: (id: string) => Promise<void>;
    addCook: (cook: Omit<Cook, 'id' | 'created_at'>) => Promise<void>;
    updateCook: (id: string, updates: Partial<Cook>) => Promise<void>;
    toggleCook: (id: string) => Promise<void>;
    addStudentNE: (student: Omit<StudentNE, 'id' | 'created_at'>) => Promise<void>;
    toggleStudentNE: (id: string) => Promise<void>;
    isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [cooks, setCooks] = useState<Cook[]>([]);
    const [studentsNE, setStudentsNE] = useState<StudentNE[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    const { addLog } = useDocuments();
    const { user } = useAuth();

    // Initial load and sync
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch from Supabase
                const { data: dbSchools, error: sErr } = await supabase.from('schools').select('*').order('nome');

                // Map DB (snake_case) to TS (camelCase)
                const mappedSchools: School[] = (dbSchools || []).map((s: any) => ({
                    ...s,
                    zona: s.zona_escolar || s.zona || 'SEDE',
                    zona_id: s.zona_id || s.zona_escolar || s.zona || 'SEDE',
                    numAlunos: s.num_alunos || s.numAlunos || 0,
                    numAlunosNE: s.num_alunos_ne || s.numAlunosNE || 0,
                    created_at: s.created_at ? new Date(s.created_at).getTime() : Date.now()
                }));

                const { data: dbCooks, error: cErr } = await supabase.from('cooks').select('*').order('nome');
                const { data: dbStudents, error: stErr } = await supabase.from('students_ne').select('*').order('nome');

                // 2. Migration logic: if DB is empty, check localStorage
                if ((!mappedSchools || mappedSchools.length === 0) && !sErr) {
                    const localSchools = JSON.parse(localStorage.getItem('nutriassist_schools_v3') || '[]');
                    if (localSchools.length > 0) {
                        // Insert local schools mapping camel -> snake AND timestamp -> ISO
                        const dbPayload = localSchools.map((s: School) => ({
                            ...s,
                            zona_escolar: s.zona,
                            num_alunos: s.numAlunos,
                            num_alunos_ne: s.numAlunosNE,
                            created_at: new Date(s.created_at).toISOString()
                        }));
                        await supabase.from('schools').insert(dbPayload);
                        setSchools(localSchools);
                    } else {
                        // No seeding of dummy data. Return empty or prompt user to create a school.
                        console.warn('Nenhuma escola encontrada no banco de dados.');
                        setSchools([]);
                    }
                } else {
                    setSchools(mappedSchools || []);
                }

                if ((!dbCooks || dbCooks.length === 0) && !cErr) {
                    const localCooks = JSON.parse(localStorage.getItem('nutriassist_cooks_v3') || '[]');
                    if (localCooks.length > 0) {
                        await supabase.from('cooks').insert(localCooks);
                        setCooks(localCooks);
                    }
                } else {
                    setCooks(dbCooks || []);
                }

                if ((!dbStudents || dbStudents.length === 0) && !stErr) {
                    const localStudents = JSON.parse(localStorage.getItem('nutriassist_students_ne') || '[]');
                    if (localStudents.length > 0) {
                        await supabase.from('students_ne').insert(localStudents);
                        setStudentsNE(localStudents);
                    }
                } else {
                    setStudentsNE(dbStudents || []);
                }
            } catch (error) {
                console.error("Falha ao carregar dados do Supabase:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addSchool = async (s: Omit<School, 'id' | 'created_at' | 'ativo'>) => {
        const newSchool: School = {
            ...s,
            id: generateId(),
            created_at: Date.now(),
            ativo: true
        };

        // Map camelCase -> snake_case for DB
        const { numAlunos, numAlunosNE, created_at, zona, zona_id, ...rest } = newSchool;
        const dbPayload = {
            ...rest,
            zona_escolar: zona,
            zona_id: zona_id || zona,
            num_alunos: numAlunos,
            num_alunos_ne: numAlunosNE,
            created_at: new Date(created_at).toISOString()
        };

        const { error } = await supabase.from('schools').insert(dbPayload);

        if (!error) {
            setSchools(prev => [...prev, newSchool]);
            addToast("Unidade escolar cadastrada!", 'success');
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Cadastro da escola ${newSchool.nome}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'ESCOLAS',
                acao: 'CADASTRO_ESCOLA',
                dados: { id: newSchool.id, nome: newSchool.nome }
            });
        } else {
            console.error(error);
            addToast("Erro ao salvar escola: " + error.message, 'error');
            throw error;
        }
    };

    const updateSchool = async (id: string, updates: Partial<School>) => {
        // Map updates to snake_case
        const dbUpdates: any = { ...updates };
        if ('numAlunos' in updates) {
            dbUpdates.num_alunos = updates.numAlunos;
            delete dbUpdates.numAlunos;
        }
        if ('numAlunosNE' in updates) {
            dbUpdates.num_alunos_ne = updates.numAlunosNE;
            delete dbUpdates.numAlunosNE;
        }
        if ('zona' in updates) {
            dbUpdates.zona_escolar = updates.zona;
            delete dbUpdates.zona;
        }
        if ('zona_id' in updates) {
            dbUpdates.zona_id = updates.zona_id;
        }

        const { error } = await supabase.from('schools').update(dbUpdates).eq('id', id);
        if (!error) {
            setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            addToast("Dados da escola atualizados.", 'success');
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Edição da escola ID: ${id}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'ESCOLAS',
                acao: 'EDICAO_ESCOLA',
                dados: { id, updates }
            });
        } else {
            addToast("Erro ao atualizar escola: " + error.message, 'error');
        }
    };

    const toggleSchool = async (id: string) => {
        const school = schools.find(s => s.id === id);
        if (!school) return;
        const newStatus = !school.ativo;

        const { error } = await supabase.from('schools').update({ ativo: newStatus }).eq('id', id);
        if (!error) {
            setSchools(prev => prev.map(s => s.id === id ? { ...s, ativo: newStatus } : s));
        }
    };

    const addCook = async (c: Omit<Cook, 'id' | 'created_at'>) => {
        const newCook: Cook = {
            ...c,
            id: generateId(),
            created_at: Date.now()
        };

        const { error } = await supabase.from('cooks').insert(newCook);
        if (!error) {
            setCooks(prev => [...prev, newCook]);
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Cadastro da merendeira ${newCook.nome}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'MERENDEIRAS',
                acao: 'CADASTRO_MERENDEIRA',
                dados: { id: newCook.id, nome: newCook.nome }
            });
        }
    };

    const updateCook = async (id: string, updates: Partial<Cook>) => {
        const { error } = await supabase.from('cooks').update(updates).eq('id', id);
        if (!error) {
            setCooks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Edição da merendeira ID: ${id}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'MERENDEIRAS',
                acao: 'EDICAO_MERENDEIRA',
                dados: { id, updates }
            });
        }
    };

    const toggleCook = async (id: string) => {
        const cook = cooks.find(c => c.id === id);
        if (!cook) return;
        const newStatus = !cook.ativo;

        const { error } = await supabase.from('cooks').update({
            ativo: newStatus,
            situacao: newStatus ? 'ATIVA' : 'INATIVA'
        }).eq('id', id);

        if (!error) {
            setCooks(prev => prev.map(c => c.id === id ? { ...c, ativo: newStatus, situacao: newStatus ? 'ATIVA' : 'INATIVA' } : c));
        }
    };

    const addStudentNE = async (s: Omit<StudentNE, 'id' | 'created_at'>) => {
        const newStudent: StudentNE = {
            ...s,
            id: generateId(),
            created_at: Date.now()
        };

        const { error } = await supabase.from('students_ne').insert(newStudent);
        if (!error) {
            setStudentsNE(prev => [...prev, newStudent]);
        }
    };

    const toggleStudentNE = async (id: string) => {
        const student = studentsNE.find(s => s.id === id);
        if (!student) return;
        const newStatus = !student.ativo;

        const { error } = await supabase.from('students_ne').update({ ativo: newStatus }).eq('id', id);
        if (!error) {
            setStudentsNE(prev => prev.map(s => s.id === id ? { ...s, ativo: newStatus } : s));
        }
    };

    return (
        <SchoolContext.Provider value={{
            schools, cooks, studentsNE,
            addSchool, updateSchool, toggleSchool,
            addCook, updateCook, toggleCook,
            addStudentNE, toggleStudentNE,
            isLoading
        }}>
            {children}
        </SchoolContext.Provider>
    );
};

export const useSchools = () => {
    const context = useContext(SchoolContext);
    if (context === undefined) {
        throw new Error('useSchools must be used within a SchoolProvider');
    }
    return context;
};
