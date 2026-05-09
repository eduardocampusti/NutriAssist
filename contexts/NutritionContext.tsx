import React, { createContext, useContext, useState, useEffect } from 'react';
import { NutritionalEvaluation, TrainingSession } from '../types';
import { supabase } from '../services/supabase';
import { useDocuments } from './DocumentContext';
import { useAuth } from './AuthContext';

import { generateId } from '../utils/id';

interface NutritionContextType {
    evaluations: NutritionalEvaluation[];
    trainings: TrainingSession[];
    addEvaluation: (evaluation: Omit<NutritionalEvaluation, 'id' | 'created_at' | 'authorId'>, authorId: string) => Promise<void>;
    addTraining: (training: Omit<TrainingSession, 'id' | 'created_at' | 'authorId'>, authorId: string) => Promise<void>;
    isLoading: boolean;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [evaluations, setEvaluations] = useState<NutritionalEvaluation[]>([]);
    const [trainings, setTrainings] = useState<TrainingSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addLog } = useDocuments();
    const { user } = useAuth();

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const { data: dbEvals, error: eErr } = await supabase.from('nutritional_evaluations').select('*').order('created_at', { ascending: false });
                const { data: dbTrainings, error: tErr } = await supabase.from('trainings').select('*').order('created_at', { ascending: false });

                if (eErr) throw eErr;
                if (tErr) throw tErr;

                if (dbEvals.length === 0) {
                    const localEvals = JSON.parse(localStorage.getItem('nutriassist_evaluations') || '[]') as NutritionalEvaluation[];
                    if (localEvals.length > 0) {
                        const toInsert = localEvals.map(e => ({
                            id: e.id,
                            iniciais_aluno: e.iniciaisAluno,
                            idade_anos: e.idadeAnos,
                            escola_id: e.escolaId,
                            etapa: e.etapa,
                            peso: e.peso,
                            estatura: e.estatura,
                            imc: e.imc,
                            sexo: e.sexo,
                            serie: e.serie || null,
                            professor: e.professor || null,
                            contato_responsaveis: e.contatoResponsaveis || null,
                            risco_identificado: e.riscoIdentificado,
                            diagnostico_descritivo: e.diagnosticoDescritivo,
                            author_id: e.authorId || null,
                            created_at: new Date(e.created_at).toISOString()
                        }));
                        await supabase.from('nutritional_evaluations').insert(toInsert);
                        setEvaluations(localEvals);
                    }
                } else {
                    setEvaluations(dbEvals.map(e => ({
                        id: e.id,
                        iniciaisAluno: e.iniciais_aluno,
                        idadeAnos: e.idade_anos,
                        escolaId: e.escola_id,
                        etapa: e.etapa,
                        peso: Number(e.peso),
                        estatura: Number(e.estatura),
                        imc: Number(e.imc),
                        sexo: e.sexo || 'F', // Default to F if missing
                        serie: e.serie,
                        professor: e.professor,
                        contatoResponsaveis: e.contato_responsaveis,
                        riscoIdentificado: e.risco_identificado,
                        diagnosticoDescritivo: e.diagnostico_descritivo,
                        authorId: e.author_id,
                        created_at: new Date(e.created_at).getTime()
                    })));
                }

                if (dbTrainings.length === 0) {
                    const localTrainings = JSON.parse(localStorage.getItem('nutriassist_trainings') || '[]') as TrainingSession[];
                    if (localTrainings.length > 0) {
                        const toInsert = localTrainings.map(t => ({
                            id: t.id,
                            tema: t.tema,
                            data_realizacao: new Date(t.data).toISOString().split('T')[0],
                            escolas_participantes_ids: t.escolasParticipantesIds,
                            cooks_participantes_ids: t.cooksParticipantesIds || [],
                            num_participantes: t.numParticipantes,
                            carga_horaria: t.cargaHoraria,
                            conteudo_programatico: t.conteudoProgramatico,
                            metodologia: t.metodologia,
                            observacoes: t.observacoes,
                            material_urls: t.materialUrls || [],
                            author_id: t.authorId || null,
                            created_at: new Date(t.created_at).toISOString()
                        }));
                        await supabase.from('trainings').insert(toInsert);
                        setTrainings(localTrainings);
                    }
                } else {
                    setTrainings(dbTrainings.map(t => ({
                        id: t.id,
                        tema: t.tema,
                        data: new Date(t.data_realizacao || t.created_at).getTime(),
                        escolasParticipantesIds: t.escolas_participantes_ids,
                        cooksParticipantesIds: t.cooks_participantes_ids,
                        numParticipantes: t.num_participantes,
                        cargaHoraria: t.carga_horaria,
                        conteudoProgramatico: t.conteudo_programatico,
                        metodologia: t.metodologia,
                        observacoes: t.observacoes,
                        materialUrls: t.material_urls || [],
                        authorId: t.author_id,
                        created_at: new Date(t.created_at).getTime()
                    })));
                }

            } catch (error) {
                console.error("Falha ao carregar dados de nutrição do Supabase:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addEvaluation = async (e: Omit<NutritionalEvaluation, 'id' | 'created_at' | 'authorId'>, authorId: string) => {
        const newEval: NutritionalEvaluation = {
            ...e,
            id: generateId(),
            created_at: Date.now(),
            authorId
        };

        const { error } = await supabase.from('nutritional_evaluations').insert({
            id: newEval.id,
            iniciais_aluno: newEval.iniciaisAluno,
            idade_anos: newEval.idadeAnos,
            escola_id: newEval.escolaId,
            etapa: newEval.etapa,
            peso: newEval.peso,
            estatura: newEval.estatura,
            imc: newEval.imc,
            sexo: newEval.sexo,
            serie: newEval.serie || null,
            professor: newEval.professor || null,
            contato_responsaveis: newEval.contatoResponsaveis || null,
            risco_identificado: newEval.riscoIdentificado,
            diagnostico_descritivo: newEval.diagnosticoDescritivo,
            author_id: authorId || null,
            created_at: new Date(newEval.created_at).toISOString()
        });

        if (!error) {
            setEvaluations(prev => [newEval, ...prev]);
            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'NUTRICAO',
                acao: 'AVALIACAO_ALUNO',
                dados: { id: newEval.id, aluno: newEval.iniciaisAluno }
            });
        }
    };

    const addTraining = async (t: Omit<TrainingSession, 'id' | 'created_at' | 'authorId'>, authorId: string) => {
        const newTraining: TrainingSession = {
            ...t,
            id: generateId(),
            created_at: Date.now(),
            authorId
        };

        const { error } = await supabase.from('trainings').insert({
            id: newTraining.id,
            tema: newTraining.tema,
            data_realizacao: new Date(newTraining.data).toISOString().split('T')[0],
            escolas_participantes_ids: newTraining.escolasParticipantesIds,
            cooks_participantes_ids: newTraining.cooksParticipantesIds || [],
            num_participantes: newTraining.numParticipantes,
            carga_horaria: newTraining.cargaHoraria,
            conteudo_programatico: newTraining.conteudoProgramatico,
            metodologia: newTraining.metodologia,
            observacoes: newTraining.observacoes,
            material_urls: newTraining.materialUrls || [],
            author_id: authorId || null,
            created_at: new Date(newTraining.created_at).toISOString()
        });

        if (!error) {
            setTrainings(prev => [...prev, newTraining]);
            await addLog({
                usuario_id: user?.id || 'system',
                modulo: 'CAPACITACAO',
                acao: 'REGISTRO_TREINAMENTO',
                dados: { id: newTraining.id, tema: newTraining.tema }
            });
        }
    };

    return (
        <NutritionContext.Provider value={{
            evaluations, trainings,
            addEvaluation, addTraining,
            isLoading
        }}>
            {children}
        </NutritionContext.Provider>
    );
};

export const useNutrition = () => {
    const context = useContext(NutritionContext);
    if (context === undefined) {
        throw new Error('useNutrition must be used within a NutritionProvider');
    }
    return context;
};
