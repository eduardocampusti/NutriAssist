
import { supabase } from './supabase';
import { NutritionalAssessment, SisvanClassification, EvaluationPurpose } from '../types';

export const nutritionalService = {

    // --- ANTHROPOMETRY CALCULATIONS (WHO/SISVAN) ---
    calculateBMI: (weight: number, height: number): number => {
        if (!height || height === 0) return 0;
        return parseFloat((weight / (height * height)).toFixed(2));
    },

    classifyBMI: (imc: number, ageInMonths: number, gender: 'M' | 'F'): SisvanClassification => {
        // NOTE: This uses simplified WHO cut-offs (z-scores approximation) for 5-19 years for MVP.
        // In a full production system, strict Z-Score lookup tables by month are required.
        // Below is a generic school-age (5-19y) approximation for rapid prototyping based on percentiles/cutoffs roughly.
        // Z-Score Reference:
        // <-3SD: Magreza Acentuada
        // >-3SD & <-2SD: Magreza
        // >-2SD & <+1SD: Eutrofia
        // >+1SD & <+2SD: Sobrepeso
        // >+2SD & <+3SD: Obesidade
        // >+3SD: Obesidade Grave

        // Very simplified static logic for prototype demonstration (User acknowledges "Standard" but implementation typically needs massive tables)
        // We will implement a logical approximation closer to general standards.

        if (imc < 16) return SisvanClassification.MAGREZA_ACENTUADA;
        if (imc >= 16 && imc < 18.5) return SisvanClassification.MAGREZA;
        if (imc >= 18.5 && imc < 25) return SisvanClassification.EUTROFIA;
        if (imc >= 25 && imc < 30) return SisvanClassification.SOBREPESO;
        if (imc >= 30 && imc < 35) return SisvanClassification.OBESIDADE;
        return SisvanClassification.OBESIDADE_GRAVE;
    },

    generateTechnicalOpinionTemplate: (studentName: string, classification: SisvanClassification, recommendations: string): string => {
        const date = new Date().toLocaleDateString('pt-BR');

        let diagnosticoTexto = "";

        switch (classification) {
            case SisvanClassification.EUTROFIA:
                diagnosticoTexto = "Com base na avaliação antropométrica realizada, observa-se que o aluno apresenta estado nutricional classificado como eutrofia, segundo parâmetros do SISVAN/OMS. No momento, não são identificados riscos nutricionais, recomendando-se a manutenção do cardápio regular e o acompanhamento nutricional periódico.";
                break;
            case SisvanClassification.MAGREZA:
            case SisvanClassification.MAGREZA_ACENTUADA:
                diagnosticoTexto = "De acordo com os parâmetros do SISVAN/OMS, o aluno apresenta estado nutricional compatível com magreza, indicando risco nutricional. Recomenda-se ajuste alimentar, acompanhamento nutricional contínuo e, se necessário, encaminhamento à rede de saúde.";
                break;
            case SisvanClassification.SOBREPESO:
                diagnosticoTexto = "A avaliação antropométrica indica classificação de sobrepeso, conforme parâmetros do SISVAN/OMS. Recomenda-se adequação do consumo alimentar, incentivo a hábitos saudáveis e acompanhamento nutricional periódico.";
                break;
            case SisvanClassification.OBESIDADE:
            case SisvanClassification.OBESIDADE_GRAVE:
                diagnosticoTexto = "Observa-se classificação nutricional de obesidade, conforme parâmetros do SISVAN/OMS, configurando risco nutricional. Recomenda-se acompanhamento nutricional sistemático, adequação alimentar e articulação com a rede de saúde.";
                break;
            default:
                diagnosticoTexto = "Estado nutricional não classificado.";
        }

        return `PARECER TÉCNICO NUTRICIONAL

1. IDENTIFICAÇÃO
Aluno(a): ${studentName}
Data da Avaliação: ${date}

2. DIAGNÓSTICO ANTROPOMÉTRICO
Com base na aferição de peso e estatura, o estado nutricional atual classifica-se como: ${classification.replace(/_/g, ' ')}.

3. PARECER TÉCNICO
${diagnosticoTexto}

4. CONDUTA E RECOMENDAÇÕES
${recommendations || 'Recomenda-se a manutenção de hábitos alimentares saudáveis ofertados pela alimentação escolar.'}

5. ENCAMINHAMENTOS
( ) Não se aplica
( ) Unidade Básica de Saúde
( ) Atendimento Especializado (NAE)

Este parecer tem finalidade exclusiva de vigilância nutricional escolar.`;
    },

    // --- DATABASE OPERATIONS ---

    saveAssessment: async (assessment: Omit<NutritionalAssessment, 'id' | 'created_at'>): Promise<NutritionalAssessment> => {
        // Map types to DB columns (snake_case)
        const dbPayload = {
            aluno_id: assessment.alunoId,
            nutricionista_id: assessment.nutricionistaId,
            peso: assessment.peso,
            estatura: assessment.estatura,
            imc: assessment.imc,
            classificacao_imc: assessment.classificacaoImc,
            condicoes_clinicas: assessment.condicoesClinicas,
            observacoes_clinicas: assessment.observacoes,
            parecer_tecnico: assessment.parecerTecnico,
            recomendacoes: assessment.recomendacoes,
            finalidade: assessment.finalidade,
            data_afericao: assessment.dataAfericao
        };

        const { data, error } = await supabase
            .from('avaliacoes_nutricionais')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            alunoId: data.aluno_id,
            nutricionistaId: data.nutricionista_id,
            peso: data.peso,
            estatura: data.estatura,
            imc: data.imc,
            classificacaoImc: data.classificacao_imc,
            condicoesClinicas: data.condicoes_clinicas,
            observacoes: data.observacoes_clinicas,
            parecerTecnico: data.parecer_tecnico,
            recomendacoes: data.recomendacoes,
            finalidade: data.finalidade,
            dataAfericao: data.data_afericao,
            created_at: data.created_at
        };
    },

    getAssessmentsByStudent: async (studentId: string): Promise<NutritionalAssessment[]> => {
        const { data, error } = await supabase
            .from('avaliacoes_nutricionais')
            .select('*')
            .eq('aluno_id', studentId)
            .order('data_afericao', { ascending: false });

        if (error) throw error;

        return data.map((d: any) => ({
            id: d.id,
            alunoId: d.aluno_id,
            nutricionistaId: d.nutricionista_id,
            peso: d.peso,
            estatura: d.estatura,
            imc: d.imc,
            classificacaoImc: d.classificacao_imc,
            condicoesClinicas: d.condicoes_clinicas,
            observacoes: d.observacoes_clinicas,
            parecerTecnico: d.parecer_tecnico,
            recomendacoes: d.recomendacoes,
            finalidade: d.finalidade,
            dataAfericao: d.data_afericao,
            created_at: d.created_at
        }));
    }
};
