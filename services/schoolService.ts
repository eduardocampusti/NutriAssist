import { supabase } from './supabase';
import { School } from '../types';

export const schoolService = {
    getAllSchools: async (): Promise<School[]> => {
        const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('ativo', true)
            .order('nome');

        if (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }

        // Map DB columns to Frontend Interface
        return (data || []).map(row => ({
            id: row.id,
            nome: row.nome,
            codigo_inep: row.codigo_inep || '',
            tipo_unidade: 'ESCOLA', // Default or map if exists
            localidade: 'URBANA',
            endereco: '',
            municipio: '',
            numAlunos: 0, // Need to count?
            numAlunosNE: 0,
            etapas: row.modalidades_atendidas || [],
            turnos: [],
            diretor: '',
            telefone: '',
            email: '',
            ativo: row.ativo,
            created_at: new Date(row.created_at).getTime()
        }));
    },

    getSchoolById: async (id: string): Promise<School | null> => {
        const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            nome: data.nome,
            codigo_inep: data.codigo_inep || '',
            tipo_unidade: 'ESCOLA',
            localidade: 'URBANA',
            endereco: '',
            municipio: '',
            numAlunos: 0,
            numAlunosNE: 0,
            etapas: data.modalidades_atendidas || [],
            turnos: [],
            diretor: '',
            telefone: '',
            email: '',
            ativo: data.ativo,
            created_at: new Date(data.created_at).getTime()
        };
    }
};
