
import { NormativeFood, NovaClassification, NormativeStatus } from '../types';

// Mock Data Source - In real app, this would be a Supabase table 'alimentos_normativos'
const MOCK_NORMATIVE_DB: NormativeFood[] = [
    {
        id: '1',
        nome: 'ARROZ BENEFICIADO (POLIDO/PARBOILIZADO/INTEGRAL)',
        grupo_alimentar: 'CEREAIS E DERIVADOS',
        classificacao_nova: NovaClassification.MINIMAMENTE_PROCESSADO,
        idade_minima: 0,
        idade_maxima: 999,
        status_normativo: NormativeStatus.PERMITIDO,
        fundamentacao_legal: 'Lei 11.947/2009, Art. 12',
        observacoes_tecnicas: 'Base da alimentação escolar.',
        versao: 1,
        ativo: true
    },
    {
        id: '2',
        nome: 'SALSICHA / EMBUTIDOS',
        grupo_alimentar: 'CARNES E OVOS',
        classificacao_nova: NovaClassification.ULTRAPROCESSADO,
        idade_minima: 60, // >= 5 years
        idade_maxima: 999,
        status_normativo: NormativeStatus.RESTRITO,
        fundamentacao_legal: 'Resolução FNDE 06/2020, Art 22',
        observacoes_tecnicas: 'Máximo 1 vez por mês para escolares. Proibido em creches.',
        versao: 1,
        ativo: true
    },
    {
        id: '3',
        nome: 'AÇÚCAR BRANCO / CRISTAL',
        grupo_alimentar: 'AÇÚCARES E DOCES',
        classificacao_nova: NovaClassification.INGREDIENTE_CULINARIO,
        idade_minima: 36, // >= 36 months
        idade_maxima: 999,
        status_normativo: NormativeStatus.RESTRITO,
        fundamentacao_legal: 'Resolução FNDE 06/2020, Art 18',
        observacoes_tecnicas: 'Proibido adição para menores de 3 anos. Moderado para demais.',
        versao: 1,
        ativo: true
    },
    {
        id: '4',
        nome: 'BISCOITO RECHEADO / WAFERS',
        grupo_alimentar: 'AÇÚCARES E DOCES',
        classificacao_nova: NovaClassification.ULTRAPROCESSADO,
        idade_minima: 60,
        idade_maxima: 999,
        status_normativo: NormativeStatus.RESTRITO,
        fundamentacao_legal: 'Guia Alimentar para a População Brasileira',
        observacoes_tecnicas: 'Uso limitado a ocorrências eventuais. Rica em gordura saturada e açúcar.',
        versao: 1,
        ativo: true
    },
    {
        id: '5',
        nome: 'FRUTAS FRESCAS (DIVERSAS)',
        grupo_alimentar: 'FRUTAS',
        classificacao_nova: NovaClassification.IN_NATURA,
        idade_minima: 0,
        idade_maxima: 999,
        status_normativo: NormativeStatus.PERMITIDO,
        fundamentacao_legal: 'Guia Alimentar para Crianças Brasileiras < 2 anos',
        observacoes_tecnicas: 'Ofertar in natura, amassada ou em pedaços. Evitar sucos antes de 1 ano.',
        versao: 1,
        ativo: true
    },
    {
        id: '6',
        nome: 'FEIJÃO (CORES)',
        grupo_alimentar: 'LEGUMINOSAS',
        classificacao_nova: NovaClassification.IN_NATURA,
        idade_minima: 0,
        idade_maxima: 999,
        status_normativo: NormativeStatus.PERMITIDO,
        fundamentacao_legal: 'PNAE',
        observacoes_tecnicas: 'Fonte de ferro e proteínas.',
        versao: 1,
        ativo: true
    },
    {
        id: '7',
        nome: 'LEITE DE VACA INTEGRAL',
        grupo_alimentar: 'LATICÍNIOS',
        classificacao_nova: NovaClassification.IN_NATURA,
        idade_minima: 12, // Introduction > 1 year usually
        idade_maxima: 999,
        status_normativo: NormativeStatus.PERMITIDO,
        fundamentacao_legal: 'Protocolos de Pediatria',
        observacoes_tecnicas: 'Não recomendado antes de 1 ano.',
        versao: 1,
        ativo: true
    },
    {
        id: '8',
        nome: 'FÓRMULA INFANTIL',
        grupo_alimentar: 'LATICÍNIOS',
        classificacao_nova: NovaClassification.ULTRAPROCESSADO, // Technically UPF but essential
        idade_minima: 0,
        idade_maxima: 12,
        status_normativo: NormativeStatus.PERMITIDO,
        fundamentacao_legal: 'Substituto do Leite Materno',
        observacoes_tecnicas: 'Apenas quando aleitamento materno não for possível.',
        versao: 1,
        ativo: true
    }
];

export const normativeService = {
    getAll: async (): Promise<NormativeFood[]> => {
        // Imitate async call
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_NORMATIVE_DB]), 300));
    },

    search: async (term: string): Promise<NormativeFood[]> => {
        const termUpper = term.toUpperCase();
        return MOCK_NORMATIVE_DB.filter(f => f.nome.includes(termUpper));
    },

    save: async (food: NormativeFood): Promise<void> => {
        // Mock Save
        const idx = MOCK_NORMATIVE_DB.findIndex(f => f.id === food.id);
        if (idx >= 0) {
            MOCK_NORMATIVE_DB[idx] = food;
        } else {
            MOCK_NORMATIVE_DB.push(food);
        }
    }
};
