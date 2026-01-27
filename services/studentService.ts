import { supabase } from './supabase';
import { Student, StudentNutritionalNeeds } from '../types';

export const studentService = {
    // --- STUDENTS ---

    getAllStudents: async (): Promise<Student[]> => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('ativo', true);

        if (error) throw error;

        return data.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            escolaId: s.escola_id,
            dataNascimento: s.data_nascimento,
            possuiNae: s.possui_nae,
            ativo: s.ativo,
            created_at: new Date(s.created_at).getTime(),
            dados_complementares: s.dados_complementares,
            foto_url: s.foto_url
        }));
    },

    getStudentsBySchool: async (schoolId: string): Promise<Student[]> => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('escola_id', schoolId)
            .eq('ativo', true);

        if (error) throw error;

        return data.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            escolaId: s.escola_id,
            dataNascimento: s.data_nascimento,
            possuiNae: s.possui_nae,
            ativo: s.ativo,
            created_at: new Date(s.created_at).getTime()
        }));
    },

    getStudentById: async (id: string): Promise<Student | null> => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            nome: data.nome,
            escolaId: data.escola_id,
            dataNascimento: data.data_nascimento,
            possuiNae: data.possui_nae,
            ativo: data.ativo,
            created_at: new Date(data.created_at).getTime(),
            dados_complementares: data.dados_complementares,
            foto_url: data.foto_url
        };
    },

    createStudent: async (student: Omit<Student, 'id' | 'created_at' | 'ativo' | 'possuiNae'> & { possuiNae?: boolean }): Promise<Student> => {
        const { data, error } = await supabase
            .from('students')
            .insert({
                nome: student.nome,
                escola_id: student.escolaId,
                data_nascimento: student.dataNascimento,
                possui_nae: student.possuiNae || false,
                dados_complementares: (student as any).dadosComplementares,
                foto_url: (student as any).fotoUrl
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            nome: data.nome,
            escolaId: data.escola_id,
            dataNascimento: data.data_nascimento,
            possuiNae: data.possui_nae,
            ativo: data.ativo,
            created_at: new Date(data.created_at).getTime()
        };
    },

    updateStudent: async (id: string, updates: Partial<Student>): Promise<void> => {
        // Map updates keys to snake_case if strictly needed, 
        // or just use manual mapping for safe fields
        const dbUpdates: any = {};
        if (updates.nome) dbUpdates.nome = updates.nome;
        if (updates.escolaId) dbUpdates.escola_id = updates.escolaId;
        if (updates.dataNascimento) dbUpdates.data_nascimento = updates.dataNascimento;
        if (updates.possuiNae !== undefined) dbUpdates.possui_nae = updates.possuiNae;
        if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;
        if ((updates as any).dadosComplementares) dbUpdates.dados_complementares = (updates as any).dadosComplementares;
        if ((updates as any).fotoUrl !== undefined) dbUpdates.foto_url = (updates as any).fotoUrl;

        const { error } = await supabase
            .from('students')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    deleteStudent: async (id: string): Promise<void> => {
        // Soft Delete
        const { error } = await supabase
            .from('students')
            .update({ ativo: false })
            .eq('id', id);

        if (error) throw error;
    },

    // --- NUTRITIONAL NEEDS (NAE) ---

    getNeedsByStudent: async (studentId: string): Promise<StudentNutritionalNeeds[]> => {
        const { data, error } = await supabase
            .from('student_nutritional_needs')
            .select('*')
            .eq('aluno_id', studentId);

        if (error) throw error;

        return data.map((n: any) => ({
            id: n.id,
            alunoId: n.aluno_id,
            tipoRestricao: n.tipo_restricao,
            descricaoClinica: n.descricao_clinica,
            laudoMedicoUrl: n.laudo_medico_url,
            anoReferencia: n.ano_referencia,
            created_at: new Date(n.created_at).getTime()
        }));
    },

    addNutritionalNeed: async (need: Omit<StudentNutritionalNeeds, 'id' | 'created_at'>): Promise<StudentNutritionalNeeds> => {
        const { data, error } = await supabase
            .from('student_nutritional_needs')
            .insert({
                aluno_id: need.alunoId,
                tipo_restricao: need.tipoRestricao,
                descricao_clinica: need.descricaoClinica,
                ano_referencia: need.anoReferencia,
                laudo_medico_url: need.laudoMedicoUrl
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-update student flag
        await studentService.updateStudent(need.alunoId, { possuiNae: true });

        return {
            id: data.id,
            alunoId: data.aluno_id,
            tipoRestricao: data.tipo_restricao,
            descricaoClinica: data.descricao_clinica,
            laudoMedicoUrl: data.laudo_medico_url,
            anoReferencia: data.ano_referencia,
            created_at: new Date(data.created_at).getTime()
        };
    },

    removeNutritionalNeed: async (id: string): Promise<void> => {
        // Get need to know student ID
        const { data: need } = await supabase.from('student_nutritional_needs').select('aluno_id').eq('id', id).single();

        const { error } = await supabase
            .from('student_nutritional_needs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Check if student still has needs
        if (need) {
            const { count } = await supabase
                .from('alunos_nae')
                .select('*', { count: 'exact', head: true })
                .eq('aluno_id', need.aluno_id);

            if (count === 0) {
                await studentService.updateStudent(need.aluno_id, { possuiNae: false });
            }
        }
    },

    // --- HELPERS ---

    calculateAgeInMonths: (birthDateIso: string): number => {
        const birth = new Date(birthDateIso);
        const now = new Date();
        return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    }
};
