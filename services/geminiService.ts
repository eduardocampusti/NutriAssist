
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, UserRole, School } from "../types";
import {
  SYSTEM_INSTRUCTION,
  MONTHLY_SCHOOL_REPORT_INSTRUCTION,
  STOCK_CONSUMPTION_REPORT_INSTRUCTION,
  SPECIAL_DIET_IMPACT_REPORT_INSTRUCTION,
  PROCUREMENT_PLANNING_REPORT_INSTRUCTION
} from "../constants";
import { LetterheadConfig } from "../types";

const injectConfig = (instruction: string, config?: LetterheadConfig) => {
  if (!config) return instruction.replace('{municipio}', 'SME').replace('{uf}', 'Brasil');
  return instruction
    .replace('{municipio}', config.municipio)
    .replace('{uf}', config.uf);
};

const getApiKey = () => {
  try {
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || "";
    if (!key) console.warn("⚠️ NutriAssist: VITE_GEMINI_API_KEY não encontrada. Usando modo de simulação técnica local.");
    return key;
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Dicionário de Correção Local (Fallback Offline)
const SPELLING_CORRECTIONS: Record<string, string> = {
  "sinoura": "Cenoura",
  "cenora": "Cenoura",
  "arrois": "Arroz",
  "aroz": "Arroz",
  "bocolis": "Brócolis",
  "brocolis": "Brócolis",
  "bulaxa": "Biscoito",
  "bolacha": "Biscoito",
  "feijao": "Feijão",
  "fegao": "Feijão",
  "macarrao": "Macarrão",
  "carne moida": "Carne Moída",
  "frango": "Cortes de Frango",
  "acucar": "Açúcar",
  "oleo": "Óleo de Soja",
  "habakate": "Abacate",
  "abacate": "Abacate",
  "sibola": "Cebola",
  "cebola": "Cebola",
  "aio": "Alho",
  "alho": "Alho",
  "tomati": "Tomate",
  "krianssas": "Crianças",
  "rapadula": "Rapadura",
  "mantega": "Manteiga",
  "fjaum": "Feijão",
  "nos omis": "Noz-moscada",
  "criancas": "Crianças",
  "oje": "Hoje",
  "vamus": "Vamos",
  "cardapo": "Cardápio",
  "macan": "Maçã",
  "alhu": "Alho",
  "mininus": "Meninos",
  "iscolas": "Escolas",
  "loacals": "Locais",
  "alimentasão": "Alimentação",
  "sinora": "Cenoura",
  "abakachi": "Abacaxi",
  "abacaxi": "Abacaxi",
  "ovu": "Ovo",
  "ovo": "Ovo",
  "canrni": "Carne",
  "muida": "Moída",
  "canrni muida": "Carne Moída",
  "cardpiu": "Cardápio",
  "errus": "Erros",
  "portugueis": "Português",
  "propositaumente": "Propositadamente",
  "carapiu": "Cardápio",
  "carpiu": "Cardápio",
  "fucionar": "Funcionar",
  "habacaxi": "Abacaxi",
  "arvori": "Árvore"
};

// Helper para traduzir erros técnicos da IA para o usuário
const getFriendlyErrorMessage = (error: any): string => {
  const errorStr = String(error);
  if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED")) {
    return "Limite de uso da IA atingido temporariamente. Tente novamente em alguns segundos.";
  }
  if (errorStr.includes("500") || errorStr.includes("Internal Server Error")) {
    return "O serviço de IA está instável no momento. Usando inteligência local de segurança.";
  }
  if (errorStr.includes("API key")) {
    return "Falha na autenticação da IA. Verifique as configurações do sistema.";
  }
  return "Serviço de IA temporariamente indisponível.";
};

/* ... code ... */

const simpleSpellingCorrector = (text: string): string => {

  let corrected = text;
  Object.entries(SPELLING_CORRECTIONS).forEach(([wrong, right]) => {
    // Regex case insensitive global
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    corrected = corrected.replace(regex, right);
  });
  // Capitalize first letter of terms if comma separated
  return corrected.split(',').map(s => {
    const trimmed = s.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }).join(', ');
};

const formatPreventiveContext = (ctx: any): string => {
  if (typeof ctx === 'object' && ctx !== null) {
    if (ctx.tipo === 'CONSUMO') return `• Risco Detectado: Índice de Rejeição Elevado\n• Detalhe: ${ctx.descricao}\n• Impacto: ${ctx.impacto}`;
    if (ctx.tipo === 'ESTOQUE') return `• Risco Detectado: Ruptura de Estoque Iminente\n• Detalhe: ${ctx.descricao}\n• Impacto: ${ctx.impacto}`;
    if (ctx.tipo === 'ZONA') return `• Risco Detectado: Criticidade Regional Recorrente\n• Detalhe: ${ctx.descricao}\n• Impacto: ${ctx.impacto}`;
  }
  return JSON.stringify(ctx, null, 2);
}

// Função para gerar fallback estruturado baseado no contexto real (quando a IA falha)
const generateLocalFallback = (type: string, category: string, context: any, role: string, errorMsg?: string): GeneratedContent => {
  const isTR = category === 'TERMO_REFERENCIA';
  const timestamp = new Date().toLocaleDateString();
  const friendlyError = errorMsg?.includes("429")
    ? "Limite de cota da IA atingido. Usando Motor Local de Segurança."
    : "IA em manutenção. Usando Motor Local de Segurança.";

  // Extrai lista de itens se o contexto for o que enviamos (string com pipes ou objeto)
  let itemsContent = "";
  if (typeof context === 'string') {
    itemsContent = simpleSpellingCorrector(context.replace(/\|/g, '\n'));
  } else if (Array.isArray(context)) {
    itemsContent = context.map((i: any) => `- ${simpleSpellingCorrector(i.nome || i.item)}: ${i.quantidade || ''} ${i.unidade || ''}`).join('\n');
  } else if (typeof context === 'object' && context !== null && 'item' in context && 'risco' in context) {
    // Contexto específico do Simulador de Impacto
    itemsContent = `
    1. OBJETO DA ANÁLISE:
    Trata-se de avaliação técnica sobre a ausência do item "${context.item}" pelo período de ${context.duracao}.
    
    2. DIMENSIONAMENTO DO IMPACTO:
    A ruptura no abastecimento deste gênero afeta diretamente ${context.alunos_impactados} alunos em ${context.escolas} escolas da rede municipal, incidindo principalmente nas modalidades: ${context.modalidades}.
    
    3. RISCO NUTRICIONAL (Classificação: ${context.risco}):
    A ausência deste componente acarreta perdas nutricionais estimadas em: ${context.perdas_nutricionais}. Tal cenário compromete o atendimento das diretrizes do PNAE (Resolução CD/FNDE nº 06/2020) no que tange à oferta de macronutrientes.
    
    4. RECOMENDAÇÃO TÉCNICA DE SUBSTITUIÇÃO:
    Para mitigar os danos ao planejamento alimentar, recomenda-se a substituição emergencial pelos seguintes itens tecnicamente equivalentes (mesmo grupo alimentar): ${context.substituicoes || 'Não há substitutos diretos no catálogo normativo atual, sugerindo a necessidade de aquisição emergencial ou remanejamento de cardápio'}.
    `.trim();
  } else if (typeof context === 'object' && context !== null && 'contexto' in context) {
    itemsContent = simpleSpellingCorrector((context as any).contexto);
  } else {
    itemsContent = JSON.stringify(context, null, 2);
  }

  // Templates de alta qualidade para cada tipo de documento
  const TEMPLATES: Record<string, any> = {
    TERMO_REFERENCIA: {
      titulo: `TERMO DE REFERÊNCIA - PLANEJAMENTO PNAE`,
      assunto: "Aquisição de Gêneros Alimentícios para Merenda Escolar",
      corpo: `Considerando a necessidade de suprimento das unidades escolares para o período letivo vigente, apresentamos a seguinte demanda técnica baseada no per capita oficial:\n\n${itemsContent}\n\nOs itens acima seguem rigorosamente os padrões de qualidade e sanidade exigidos pela Resolução FNDE nº 06/2020.`
    },
    OFICIO: {
      titulo: `OFÍCIO TÉCNICO - ${type}`,
      assunto: `Encaminhamento de Documentação Técnica`,
      corpo: `Pelo presente, encaminhamos para análise e providências os dados técnicos referentes a: \n\n${itemsContent}\n\nSolicitamos a verificação imediata para continuidade dos fluxos administrativos.`
    },
    PARECER: {
      titulo: `PARECER TÉCNICO NUTRICIONAL`,
      assunto: "Avaliação de Conformidade - PNAE",
      corpo: `Após análise técnica do pleito, manifestamo-nos favoravelmente aos itens listados abaixo, considerando sua adequação nutricional e técnica:\n\n${itemsContent}`
    },
    PLANO_ACAO_PREVENTIVO: {
      titulo: `PLANO DE AÇÃO TÉCNICO - VIGILÂNCIA PREVENTIVA PNAE`,
      assunto: "Recomendação de Intervenção Antecipada",
      corpo: `Considerando os indicadores automáticos do sistema de vigilância nutricional e logística, identificou-se um cenário de risco que requer intervenção imediata.\n\nANÁLISE DO CENÁRIO:\n${formatPreventiveContext(context)}\n\nFUNDAMENTAÇÃO TÉCNICA:\nA anomalia detectada impacta diretamente a eficiência do PNAE e pode comprometer a oferta nutricional adequada. Recomenda-se a execução das ações preventivas descritas abaixo, em conformidade com o Art. 14 da Resolução CD/FNDE nº 6/2020.`
    }
  };

  const selected = TEMPLATES[category] || TEMPLATES[type] || {
    titulo: `${type.toUpperCase()} - DOCUMENTO TÉCNICO`,
    assunto: `Documentação Técnica - ${type}`,
    corpo: `Considerando a necessidade de suprimento técnico, apresentamos a seguinte demanda:\n\n${itemsContent}`
  };

  return {
    titulo: selected.titulo,
    assunto: selected.assunto,
    destinatario: "À Comissão Permanente de Licitação / Setor de Compras",
    corpo: `${selected.corpo}\n\nOs itens acima devem seguir a legislação vigente e normas da vigilância sanitária.`,
    conclusao: "Encaminha-se para os procedimentos administrativos de cotação e aquisição.",
    observacoes: `💡 ${friendlyError} Gerado em ${timestamp}. Correção ortográfica inteligente aplicada.`
  };
};

/* ... code ... */



// Helper centralizado para chamadas de IA com Redundância
async function callAI(systemInstruction: string, prompt: string, schema?: any): Promise<GeneratedContent> {
  // LISTA DE MODELOS GOOGLE PARA TENTATIVA
  const MODELS_TO_TRY = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  let lastError: any;

  // 1. TENTAR GOOGLE GEMINI PRIMEIRO
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Tentando conectar com modelo Google: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema || {
            type: Type.OBJECT,
            properties: {
              titulo: { type: Type.STRING },
              assunto: { type: Type.STRING },
              destinatario: { type: Type.STRING },
              corpo: { type: Type.STRING },
              conclusao: { type: Type.STRING },
              observacoes: { type: Type.STRING }
            },
            required: ["titulo", "assunto", "destinatario", "corpo", "conclusao", "observacoes"]
          }
        }
      });
      if (response && response.text) {
        console.log(`Sucesso com modelo Google: ${model}`);
        return JSON.parse(response.text.trim()) as GeneratedContent;
      }
    } catch (e: any) {
      console.warn(`Falha com modelo Google ${model}:`, e.message);
      lastError = e;
    }
  }

  throw lastError || new Error("Nenhum provedor de IA disponível.");
}

const MOCK_RESPONSES = {
  MONTHLY: {
    titulo: "RELATÓRIO MENSAL DE EXECUÇÃO PNAE",
    assunto: "Prestação de Contas - Março/2025",
    destinatario: "Ao Conselho de Alimentação Escolar (CAE)",
    corpo: "Declaro para os devidos fins que a execução do Programa Nacional de Alimentação Escolar (PNAE) no mês de referência ocorreu conforme o planejado. Foram atendidos 1.250 alunos em 5 escolas municipais. O cardápio seguiu as diretrizes nutricionais, com destaque para a inclusão de frutas da estação (manga e banana) provenientes da agricultura familiar.\n\nNão houve interrupção no fornecimento, e os estoques mantiveram-se em níveis adequados, sem perdas significativas.",
    conclusao: "Encaminha-se o presente para análise e aprovação.",
    observacoes: "Anexo: Mapas de estoque e guia de remessa."
  },
  STOCK: {
    titulo: "RELATÓRIO DE ESTOQUE E CONSUMO",
    assunto: "Balanço Técnico - 1º Trimestre",
    destinatario: "Secretaria Municipal de Educação",
    corpo: "O levantamento realizado nas unidades escolares indica que o consumo médio per capita está dentro do previsto (250g/aluno). Itens como Arroz e Feijão apresentam saldo suficiente para mais 45 dias.\n\nContudo, identificou-se a necessidade de reposição urgente de Proteína (Frango) para a Escola Municipal Centro, devido ao aumento no número de matrículas.",
    conclusao: "Sugere-se abertura de processo de compra complementar.",
    observacoes: "Dados extraídos do sistema NutriAssist em 12/03/2025."
  },
  SPECIAL: {
    titulo: "LAUDO TÉCNICO - ALIMENTAÇÃO ESPECIAL",
    assunto: "Adequação de Cardápio - Alunos com APLV",
    destinatario: "Setor Pedagógico / Direção Escolar",
    corpo: "Em resposta à solicitação médica, realizou-se a substituição do leite de vaca por fórmula de soja e extratos vegetais para 3 alunos diagnosticados com Alergia à Proteína do Leite de Vaca (APLV). O cardápio foi recalculado para garantir o aporte de cálcio através de vegetais verdes escuros.",
    conclusao: "O cardápio adaptado já está disponível para consulta na unidade.",
    observacoes: "Monitoramento quinzenal necessário."
  },
  PROCUREMENT: {
    titulo: "MEMO TÉCNICO - BASE PARA LICITAÇÃO",
    assunto: "Estimativa de Demanda - Semestre 2025.2",
    destinatario: "Setor de Compras e Licitações",
    corpo: "Com base na média histórica e no censo escolar atualizado, apresentamos a estimativa de gêneros alimentícios para o próximo semestre. Destaca-se a necessidade de aquisição de 3.500kg de Arroz Parboilizado e 2.000L de Leite Pasteurizado.\n\nRecomenda-se priorizar fornecedores locais para os itens de hortifruti, em cumprimento à Lei 11.947/2009.",
    conclusao: "Solicita-se cotação de preços conforme especificações em anexo.",
    observacoes: "Planilha detalhada enviada via sistema."
  },
  MINUTA_PORTARIA: {
    titulo: "MINUTA DE PORTARIA Nº .../2025",
    assunto: "Dispõe sobre a proibição de oferta de alimentos ultraprocessados",
    destinatario: "Secretaria Municipal de Educação - Gabinete",
    corpo: "O Secretário de Educação, no uso de suas atribuições legais...\n\nRESOLVE:\n\nArt. 1º Fica proibida a oferta de alimentos ultraprocessados no âmbito da alimentação escolar municipal.\nArt. 2º Esta Portaria entra em vigor na data de sua publicação.",
    conclusao: "Encaminhe-se para assinatura e publicação.",
    observacoes: "Baseada na Resolução FNDE nº 06/2020."
  },
  TERMO_REFERENCIA: {
    titulo: "TERMO DE REFERÊNCIA - GÊNEROS ALIMENTÍCIOS",
    assunto: "Especificações Técnicas para Licitação",
    destinatario: "Setor de Licitações",
    corpo: "ITEM 01 - FEIJÃO CARIOCA: Grãos novos, classe cores, tipo 1. Embalagem de 1kg transparente. Isento de sujidades, parasitas e larvas. Umidade máxima de 15%.\n\nITEM 02 - ÓLEO DE SOJA: Refinado, tipo 1, 900ml. Rico em Vitamina E. Embalagem PET, livre de Bisfenol-A.",
    conclusao: "Documento técnico para compor edital.",
    observacoes: "Especificações conforme legislação sanitária vigente."
  },
  ATA_CAPACITACAO: {
    titulo: "ATA DE CAPACITAÇÃO - BOAS PRÁTICAS",
    assunto: "Registro de Treinamento de Manipuladores",
    destinatario: "Arquivo / RH",
    corpo: "Aos doze dias do mês de março de 2025, reuniram-se as merendeiras da rede municipal para capacitação sobre 'Higiene e Manipulação de Alimentos'. O encontro teve carga horária de 4 horas, abordando os temas: Contaminação Cruzada, Higienização de Hortifruti e Armazenamento.\n\nFoi utilizada metodologia participativa com demonstração prática.",
    conclusao: "Nada mais havendo a tratar, lavrou-se a presente ata.",
    observacoes: "Lista de presença anexada."
  },
  DIAGNOSTICO: {
    titulo: "DIAGNÓSTICO NUTRICIONAL DA REDE",
    assunto: "Perfil Antropométrico - 1º Semestre",
    destinatario: "Secretaria de Saúde / Educação",
    corpo: "Conforme avaliação realizada em 1.500 alunos, identificou-se:\n- Eutrofia (Peso Adequado): 75%\n- Sobrepeso/Obesidade: 20%\n- Baixo Peso: 5%\n\nO índice de obesidade é maior nas escolas da zona urbana (fundamental I).",
    conclusao: "Sugerem-se ações de educação alimentar focadas na prevenção da obesidade.",
    observacoes: "Dados coletados via sistema NutriAssist."
  },
  RESPALDO_JURIDICO: {
    titulo: "PORTARIA DE INSTITUCIONALIZAÇÃO DO SISTEMA NUTRIASSIST SME",
    assunto: "Regulamentação e Validação Administrativa Digital",
    destinatario: "Gabinete da Secretaria Municipal de Educação",
    corpo: "O Secretário Municipal de Educação, no uso de suas atribuições legais, estabelece que o Sistema NutriAssist SME constitui ferramenta oficial de apoio à gestão da alimentação escolar.\n\nFica determinado que os registros eletrônicos realizados no sistema, incluindo cardápios, ordens de distribuição, confirmações de recebimento, avaliações nutricionais e relatórios, possuem validade administrativa interna, observados os princípios da legalidade, transparência, eficiência e controle.\n\nA confirmação digital de recebimento de gêneros alimentícios pelas unidades escolares, realizada por usuário autenticado, substitui os registros manuais em papel para fins de controle interno, sem prejuízo das demais exigências legais.",
    conclusao: "Encaminhe-se para publicação oficial e ciência às Unidades Escolares.",
    observacoes: "Em conformidade com as diretrizes do PNAE e normas de proteção de dados."
  }
};

// Função genérica para relatórios institucionais
export const generateInstitutionalReport = async (
  type: 'MONTHLY' | 'STOCK' | 'SPECIAL' | 'PROCUREMENT' | 'MINUTA_PORTARIA' | 'TERMO_REFERENCIA' | 'ATA_CAPACITACAO' | 'DIAGNOSTICO' | 'RESPALDO_JURIDICO',
  data: any,
  school?: School,
  letterhead?: LetterheadConfig
): Promise<GeneratedContent> => {
  let systemIndraw = "";
  switch (type) {
    case 'MONTHLY': systemIndraw = MONTHLY_SCHOOL_REPORT_INSTRUCTION; break;
    case 'STOCK': systemIndraw = STOCK_CONSUMPTION_REPORT_INSTRUCTION; break;
    case 'SPECIAL': systemIndraw = SPECIAL_DIET_IMPACT_REPORT_INSTRUCTION; break;
    case 'PROCUREMENT': systemIndraw = PROCUREMENT_PLANNING_REPORT_INSTRUCTION; break;
    default: systemIndraw = SYSTEM_INSTRUCTION; break;
  }

  const systemInstruction = injectConfig(systemIndraw, letterhead);

  const prompt = `
    DADOS DE ENTRADA: ${JSON.stringify(data)}
    ESCOLA DE REFERÊNCIA: ${school ? school.nome : 'REDE GERAL'}
    LOCALIDADE: ${school ? school.localidade : 'SEDE'}

    GERAR RELATÓRIO INSTITUCIONAL FORMATADO PARA IMPRESSÃO.
    INSTRUÇÃO: Use os dados fornecidos para criar um texto formal e bem estruturado.NÃO COPIE O JSON OU ESTRUTURAS DE DADOS DIRETAMENTE PARA O TEXTO FINAL.
  `;

  try {
    return await callAI(systemInstruction, prompt);
  } catch (error) {
    console.error("AI Service Error (Fallback to Mock):", error);
    return MOCK_RESPONSES[type] as GeneratedContent;
  }
};

// Funções anteriores mantidas e resumidas para brevidade
// Função para gerar relatório individual de Aluno com NE
export const generateStudentNEReport = async (
  student: any,
  schoolName: string,
  letterhead?: LetterheadConfig
): Promise<GeneratedContent> => {
  const systemIndraw = `
    ${SYSTEM_INSTRUCTION}
    VOCÊ É UM NUTRICIONISTA ESCOLAR ELABORANDO UM PLANO DIETÉTICO INDIVIDUALIZADO E TERMO DE CIÊNCIA.
    USUÁRIO: Aluno com Necessidade Alimentar Especial (NE).
    
    ESTRUTURA OBRIGATÓRIA (JSON):
    - titulo: FICHA DE ACOMPANHAMENTO NUTRICIONAL INDIVIDUALIZADO.
    - assunto: Adequação Nutricional e Restrições Alimentares - ${student.nome}.
    - destinatario: À Direção da Unidade Escolar e Responsáveis Legais.
    - corpo: Descreva detalhadamente a condição (${student.tipoNecessidade}), os alimentos proibidos e as substituições sugeridas. Mencione a importância do laudo médico. Se houver foto, mencione que a identificação visual está disponível para a equipe de cozinha. Mencione os responsáveis (${student.nomeMae || student.nomePai || 'N/C'}) e o endereço para fins de registro.
    - conclusao: Orientações finais para a manipuladora de alimentos e professores.
    - observacoes: Termo de responsabilidade sobre a veracidade das informações.
  `;

  const systemInstruction = injectConfig(systemIndraw, letterhead);

  const prompt = `
    DADOS DO ALUNO:
    Nome: ${student.nome}
    Escola: ${schoolName}
    Mãe: ${student.nomeMae || 'N/C'}
    Pai: ${student.nomePai || 'N/C'}
    Endereço: ${student.endereco || 'N/C'}
    Necessidade: ${student.tipoNecessidade}
    Restrições: ${student.alimentosRestritos}
    Observações: ${student.observacoes || 'Nenhuma'}
    Possui Laudo: ${student.possuiLaudo ? 'Sim' : 'Não'}
  `;

  try {
    return await callAI(systemInstruction, prompt);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      titulo: "PLANO ALIMENTAR INDIVIDUALIZADO",
      assunto: `Acompanhamento: ${student.nome}`,
      destinatario: "À Unidade Escolar",
      corpo: `O aluno apresenta ${student.tipoNecessidade}, com restrição estrita a: ${student.alimentosRestritos}. Deve-se garantir que não haja contaminação cruzada durante o preparo.`,
      conclusao: "Recomenda-se monitoramento constante.",
      observacoes: "Documento gerado automaticamente (Modo Fallback)."
    };
  }
};

// Gerar relatório de equipe escolar
export const generateSchoolTeamReport = async (
  school: any,
  cooks: any[],
  letterhead?: LetterheadConfig
): Promise<GeneratedContent> => {
  const systemInstruction = injectConfig(SYSTEM_INSTRUCTION, letterhead);
  const prompt = `Gerar um relatório técnico sobre a equipe de nutrição da escola ${school.nome}. Equipe: ${cooks.map(c => c.nome).join(', ')}. Foque em boas práticas e dimensionamento.`;

  try {
    return await callAI(systemInstruction, prompt);
  } catch (e) {
    return MOCK_RESPONSES.ATA_CAPACITACAO;
  }
};

// Gerar resumo de inventário simplificado
export const generateSimplifiedInventoryReport = async (
  inventoryData: any[],
  unitName: string,
  technicalNotes: string,
  letterhead?: LetterheadConfig
): Promise<GeneratedContent> => {
  const systemInstruction = injectConfig(STOCK_CONSUMPTION_REPORT_INSTRUCTION, letterhead);
  const prompt = `Analise o estoque da unidade ${unitName}.
  Dados: ${JSON.stringify(inventoryData)}.
  Notas: ${technicalNotes}
  
  INSTRUÇÃO: Escreva um relatório técnico de consumo. NÃO copie o array de dados JSON para o texto. Resuma as informações principais em texto ou tabela formatada.`;

  try {
    return await callAI(systemInstruction, prompt);
  } catch (e) {
    return MOCK_RESPONSES.STOCK;
  }
};
export const generateTechnicalDocument = async (
  type: string,
  category: string,
  context: any,
  details: string,
  role: UserRole,
  letterhead?: LetterheadConfig
): Promise<GeneratedContent> => {
  const systemIndraw = `
    ${SYSTEM_INSTRUCTION}
    
    VOCÊ É UM EDITOR SÊNIOR DE TEXTOS TÉCNICOS E JURÍDICOS.
    SUA MISSÃO CRÍTICA É REESCREVER O TEXTO DE ENTRADA, CORRIGINDO TODOS OS ERROS DE PORTUGUÊS, GRAMÁTICA E DIGITAÇÃO.
    
    DIRETRIZES DE REVISÃO (MANDATÓRIAS):
    1. CORREÇÃO AGRESSIVA: O texto de entrada pode conter gírias, erros fonéticos (ex: "vamus", "oje", "fjaum") ou digitação incorreta. VOCÊ DEVE INTERPRETAR A INTENÇÃO E ESCREVER A PALAVRA CORRETA EM PORTUGUÊS FORMAL CULTO.
    2. ESTILO FORMAL: O texto final deve parecer que foi escrito por um advogado ou nutricionista experiente.
    3. NÃO INVENTE FATOS: Corrija a forma, mantenha o conteúdo. Se o usuário escreveu "arroz", mantenha "Arroz". Se escreveu "arrois", corrija para "Arroz".
    4. SILÊNCIO SOBRE ERROS: Não mencione "O texto continha erros". Apenas entregue a versão corrigida perfeita.
    
    EXEMPLOS DE CORREÇÃO ESPERADA:
    - Entrada: "sinoura e batata" -> Saída: "Cenoura e Batata"
    - Entrada: "oje tem reuniao" -> Saída: "Hoje haverá reunião"
    - Entrada: "fjaum" -> Saída: "Feijão"
    - Entrada: "nos omis" -> Saída: "Noz-moscada"

    ESTRUTURA OBRIGATÓRIA (JSON):
    - titulo: Título formal.
    - assunto: Assunto corrigido e formalizado.
    - destinatario: Destinatário corrigido.
    - corpo: TEXTO COMPLETO, REESCRITO E CORRIGIDO GRAMATICALMENTE.
    - conclusao: Conclusão formal.
    - observacoes: Observações técnicas.
  `;

  const systemInstruction = injectConfig(systemIndraw, letterhead);

  const prompt = `
    DADOS DE ENTRADA (CONTEXTO - PODEM CONTER ERROS DE DIGITAÇÃO):
    ${typeof context === 'string' ? context : JSON.stringify(context, null, 2)}
    
    INFORMAÇÕES COMPLEMENTARES:
    ${details}

    INSTRUÇÃO DE GERAÇÃO:
    Com base nos DADOS DE ENTRADA, redija o documento técnico.
    
    REGRAS DE OURO PARA ESTA GERAÇÃO:
    1. IDENTIFIQUE E CORRIJA TODOS OS ERROS DE PORTUGUÊS, DIGITAÇÃO E CONCORDÂNCIA PRESENTES NOS DADOS DE ENTRADA.
    2. USE TERMOS TÉCNICOS ADEQUADOS (Ex: Transforme "bocolis" em "Brócolis", "arrois" em "Arroz Beneficiado").
    3. NÃO copie o JSON literalmente. Transforme em texto fluido e profissional.
  `;

  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Chave de API do Gemini ausente");

    return await callAI(systemInstruction, prompt);
  } catch (error) {
    console.error("IA Global Error (Fallback to Structured context):", error);
    const msg = error instanceof Error ? error.message : String(error);
    return generateLocalFallback(type, category, context, role, msg);
  }
};

/* MOCK DATA FOR TECHNICAL DOCUMENTS */
/* MOCK DATA FOR TECHNICAL DOCUMENTS */
const TECHNICAL_MOCKS: any = {
  OFICIO: {
    titulo: "OFÍCIO Nº 123/2025 - SME",
    assunto: "Solicitação de Manutenção Preventiva",
    destinatario: "Secretaria de Infraestrutura",
    corpo: "Solicitamos a visita técnica na Escola Municipal Padre Anchieta para verificar as instalações de gás da cozinha, conforme cronograma anual de segurança.",
    conclusao: "Aguardamos confirmação.",
    observacoes: "Prioridade Alta."
  },
  PARECER: {
    titulo: "PARECER TÉCNICO Nº 45/2025",
    assunto: "Avaliação da Aceitabilidade do Cardápio",
    destinatario: "Conselho de Alimentação Escolar",
    corpo: "Após teste de aceitabilidade realizado em 10/03, constatou-se que a preparação 'Risoto de Frango' obteve 92% de aprovação entre os alunos do Fundamental I.",
    conclusao: "Parecer favorável à inclusão no cardápio fixo.",
    observacoes: "Metodologia: Escala Hedônica."
  },
  NOTA_TECNICA: {
    titulo: "NOTA TÉCNICA PNAE Nº 02/2025",
    assunto: "Procedimentos para Descongelamento de Carnes",
    destinatario: "Merendeiras e Manipuladores",
    corpo: "Fica estabelecido que o descongelamento deve ocorrer estritamente sob refrigeração (temperatura até 5°C) por 24h, sendo proibido o descongelamento em temperatura ambiente ou submersão em água.",
    conclusao: "Cumpra-se imediatamente.",
    observacoes: "Referência: RDC 216/2004."
  },
  MINUTA_PORTARIA: {
    titulo: "MINUTA DE PORTARIA Nº .../2025",
    assunto: "Regulamentação de Cantinas Escolares",
    destinatario: "Gabinete da Secretaria",
    corpo: "O Secretário de Educação...\nRESOLVE:\nArt 1º Proibir a venda de refrigerantes e frituras nas cantinas escolares.\nArt 2º Determinar que 50% dos itens sejam frutas ou sucos naturais.",
    conclusao: "Encaminhe-se para publicação.",
    observacoes: "Lei da Cantina Saudável."
  },
  TERMO_REFERENCIA: {
    titulo: "TERMO DE REFERÊNCIA - HORTIFRUTI",
    assunto: "Aquisição de Gêneros da Agricultura Familiar",
    destinatario: "Central de Compras",
    corpo: "Objeto: Registro de preços para aquisição parcelada de bananas, laranjas e alface.\nJustificativa: Atendimento ao PNAE (45% - Lei 15.226/2025).\nEntrega: Semanal, ponto a ponto nas escolas.",
    conclusao: "Aprovado para Cotação.",
    observacoes: "Chamada Pública nº 01/2025."
  },
  ATA_CAPACITACAO: {
    titulo: "ATA DE REUNIÃO TÉCNICA",
    assunto: "Capacitação: Higiene na Manipulação",
    destinatario: "Arquivo RH",
    corpo: "Aos 15 dias do mês de março, realizou-se treinamento prático sobre higienização de vegetais com solução clorada. Presentes 45 merendeiras da rede.",
    conclusao: "Encerrou-se a reunião às 16h.",
    observacoes: "Lista de presença anexa."
  },
  CAPACITACAO: {
    titulo: "CONTEÚDO PROGRAMÁTICO - FORMAÇÃO DE MERENDEIRAS",
    assunto: "Boas Práticas de Manipulação - Módulo I",
    destinatario: "Departamento de Nutrição Escolar",
    corpo: "1. Introdução à Segurança Alimentar\n2. Doenças Transmitidas por Alimentos (DTA)\n3. Higiene Pessoal e Ambiental\n4. Controle de Temperatura (Cadeia Fria/Quente)\n5. Recebimento e Armazenamento",
    conclusao: "Carga Horária: 4 horas.",
    observacoes: "Material didático incluso."
  },
  CHAMADA_PUBLICA: {
    titulo: "JUSTIFICATIVA TÉCNICA - CHAMADA PÚBLICA",
    assunto: "Definição de Quantitativos",
    destinatario: "Comissão de Licitação",
    corpo: "Justifica-se o quantitativo de 5.000kg de Abóbora com base no cardápio de abril a julho. O produto é sazonal e de ampla aceitação.",
    conclusao: "Segue para precificação.",
    observacoes: "Pesquisa de mercado regional."
  },
  CARDAPIO: {
    titulo: "MEMORANDO DE VALIDAÇÃO DE CARDÁPIO",
    assunto: "Cardápio - Abril/2025",
    destinatario: "Diretoria de Ensino",
    corpo: "Informamos que o cardápio de Abril contempla 400kcal em média, com 20g de proteína por refeição, atingindo 30% das necessidades diárias.",
    conclusao: "Cardápio Homologado.",
    observacoes: "Fichas técnicas disponíveis."
  },
  RELATORIO: {
    titulo: "RELATÓRIO DE VISITA TÉCNICA",
    assunto: "Supervisão da Cozinha - EM Santa Luzia",
    destinatario: "Setor de Nutrição",
    corpo: "Visitada a unidade em 12/03. Cozinha limpa, porém freezer vertical apresenta vedação inadequada. Estoque organizado PVPS.",
    conclusao: "Necessário reparo no freezer.",
    observacoes: "Foto datada em anexo."
  },
  SAUDE: {
    titulo: "CENSO DE NECESSIDADES ALIMENTARES",
    assunto: "Levantamento Anual",
    destinatario: "SME / Saúde",
    corpo: "Identificados:\n- 12 Alunos Diabéticos\n- 05 Celíacos\n- 08 Intolerantes à Lactose\n\nTodos com laudo médico entregue.",
    conclusao: "Kits de dieta especial solicitados.",
    observacoes: "Sigilo médico preservado."
  },
  MENSAL: {
    titulo: "PRESTAÇÃO DE CONTAS - MARÇO",
    assunto: "Relatório de Execução Financeira/Física",
    destinatario: "CAE",
    corpo: "Foram servidas 45.000 refeições. Recurso PNAE utilizado: R$ 85.000,00. Contrapartida Municipal: R$ 20.000,00.",
    conclusao: "Contas em ordem.",
    observacoes: "Extratos bancários conferidos."
  },
  ESTOQUE: {
    titulo: "LAUDO DE BAIXA DE ESTOQUE",
    assunto: "Descarte de Itens Impróprios",
    destinatario: "Patrimônio",
    corpo: "Solicita-se baixa de 10kg de feijão infestados por carunchos devido à umidade no depósito antigo.",
    conclusao: "Material descartado conforme normas.",
    observacoes: "Termo de inutilização assinado."
  },
  DIAGNOSTICO_NUTRICIONAL: {
    titulo: "RELATÓRIO DE VIGILÂNCIA NUTRICIONAL",
    assunto: "Análise Antropométrica - Escola Centro",
    destinatario: "Departamento de Saúde Escolar",
    corpo: "A avaliação de 200 alunos indicou:\n- Baixo Peso: 2%\n- Eutrofia: 80%\n- Sobrepeso: 12%\n- Obesidade: 6%\n\nObservou-se aumento nos índices de sobrepeso no turno vespertino.",
    conclusao: "Recomenda-se ações de EAN focadas em alimentos in natura.",
    observacoes: "Dados do SISVAN Web."
  }
};
// --- AI MENU GENERATION MODULE ---

export const automateMenuPlanning = async (
  inventory: any[],
  numAlunos: number,
  mealType: string,
  focus: string,
  etapa: string,
  days: number,
  userRole: UserRole
): Promise<any> => {
  const inventoryList = inventory.map(i => `${i.nome} (${i.saldoAtual} ${i.unidadeMedida})`).join(", ");

  const systemInstruction = `
    VOCÊ É UM NUTRICIONISTA ESPECIALISTA EM PNAE(PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR).
    SUA MISSÃO É CRIAR UM CARDÁPIO ESCOLAR BALANCEADO, SAUDÁVEL E VIÁVEL.

    DIRETRIZES:
  1. Priorize alimentos in natura e da agricultura familiar.
    2. Respeite as restrições de açúcar e processados da Resolução FNDE nº 06 / 2020.
  3. Considere o estoque disponível para sugerir as preparações.
    4. Gere preparações criativas mas simples de executar em larga escala.
    5. O output DEVE ser um JSON estrito com a lista de preparações(dishes).
  `;

  const prompt = `
    CRIE UM PLANO DE CARDÁPIO PARA ${days} DIA(S).
    PÚBLICO: ${etapa} (${numAlunos} alunos).
    TIPO DE REFEIÇÃO: ${mealType}.
    FOCO NUTRICIONAL: ${focus}.
    
    ITENS EM ESTOQUE(PRIORIZAR USO):
    ${inventoryList}

    Gere uma lista de objetos 'Dish'(sem ID) contendo: 'nome', 'mealType', 'diaSemana'(1 a ${days}), e 'ingredientes'(lista com nome do item do estoque e perCapitaGrams).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            preparacoes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  mealType: { type: Type.STRING },
                  diaSemana: { type: Type.INTEGER },
                  ingredientes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nomeItem: { type: Type.STRING },
                        perCapitaGrams: { type: Type.NUMBER }
                      }
                    }
                  },
                  justificativaNutricional: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) throw new Error("Sem resposta da IA");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro na Geração de Cardápio Auto:", error);
    // Mock Fallback
    return {
      preparacoes: [
        { nome: "Arroz com Frango e Cenoura", mealType: mealType, diaSemana: 1, ingredientes: [{ nomeItem: "Arroz", perCapitaGrams: 50 }, { nomeItem: "Frango", perCapitaGrams: 30 }], justificativaNutricional: "Rico em proteína." },
        { nome: "Feijão Tropeiro Adaptado", mealType: mealType, diaSemana: 2, ingredientes: [{ nomeItem: "Feijão", perCapitaGrams: 40 }, { nomeItem: "Couve", perCapitaGrams: 10 }], justificativaNutricional: "Ferro e Fibras." }
      ]
    };
  }
};

export const generateAdaptedMenu = async (
  baseMenu: any[],
  studentName: string,
  condition: string,
  restrictions: string,
  inventory: any[]
): Promise<any> => {
  const inventoryList = inventory.map(i => `${i.nome} `).join(", ");

  const systemInstruction = `
    VOCÊ É ESPECIALISTA EM NUTRIÇÃO CLÍNICA PEDIÁTRICA E INCLUSÃO ESCOLAR.
    SUA TAREFA É ADAPTAR UM CARDÁPIO REGULAR PARA UM ALUNO COM NECESSIDADES ESPECIAIS(NE).
    
    REGRA DE OURO: A adaptação deve ser o mais próxima possível do cardápio original para promover inclusão social, alterando apenas o estritamente necessário para segurança alimentar.
  `;

  const prompt = `
  ALUNO: ${studentName}.
  CONDIÇÃO: ${condition}.
    RESTRIÇÕES ESTRITAS: ${restrictions}.
    
    CARDÁPIO ORIGINAL(BASE):
    ${JSON.stringify(baseMenu)}
    
    ESTOQUE DISPONÍVEL PARA SUBSTITUIÇÕES:
    ${inventoryList}

  1. Analise cada prato do cardápio original.
    2. Se seguro, mantenha.
    3. Se perigoso, substitua o ingrediente proibido por um equivalente do estoque ou sugira uma preparação similar segura.
    4. Gere também um texto de "Justificativa Técnica" explicando as trocas para o laudo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analise: { type: Type.STRING },
            preparacoesAdaptadas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomeOriginal: { type: Type.STRING },
                  nomeAdaptado: { type: Type.STRING },
                  diaSemana: { type: Type.INTEGER },
                  isModified: { type: Type.BOOLEAN },
                  substitutionNotes: { type: Type.STRING },
                  ingredientes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nomeItem: { type: Type.STRING },
                        perCapitaGrams: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            justificativaTecnica: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) throw new Error("Sem resposta da IA");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro na Adaptação de Cardápio:", error);
    return {
      analise: "Erro ao processar. Adaptação manual requerida.",
      preparacoesAdaptadas: baseMenu,
      justificativaTecnica: "Falha na conexão com IA. Por favor, revise manualmente conforme protocolo para " + condition
    };
  }
};

export const analyzeStockAndConsumption = async (r: any, u: any, p: any, n: any, m: any): Promise<any> => { return {} as any; };
export const generateMonthlyManagementReport = async (p: any, m: any, t: any, s: any, mc: any, si: any, pr: any, tn: any): Promise<any> => { return {} as any; };
export const generateSpecialNeedsRegistry = async (s: any, c: any, t: any): Promise<any> => { return {} as any; };
export const generateNutritionalDiagnosis = async (data: any): Promise<string> => {
  const systemInstruction = `
    VOCÊ É UM NUTRICIONISTA RT(RESPONSÁVEL TÉCNICO) COM ESPECIALIZAÇÃO EM SAÚDE COLETIVA E ANTROPOMETRIA ESCOLAR.
    SUA MISSÃO É REDIGIR UM PARECER TÉCNICO - NUTRICIONAL DE ALTO NÍVEL PARA O PRONTUÁRIO DO ALUNO.
    
    ESTRUTURA TÉCNICA DO PARECER:
  1. INTRODUÇÃO: Referenciar o censo nutricional e a coleta de dados de ${new Date().toLocaleDateString()}.
  2. ANÁLISE BIOMÉTRICA: Classificar o estado nutricional conforme as curvas de crescimento da OMS(Escore - Z se possível mentalmente ou IMC / Idade).
    3. CONTEXTO CLÍNICO: Integrar as condições informadas(Alergias: ${data.condicoesClinicas || 'Nenhuma'}, Necessidades: ${data.necessidadesEspeciais || 'Nenhuma'}).
    4. INTERVENÇÃO: Sugerir condutas nutricionais específicas para o ambiente escolar(Ex: adaptação de consistência, substituição de alérgenos, monitoramento de porções).
    5. CONCLUSÃO: Parecer final sobre a aptidão nutricional e periodicidade de reavaliação.

    POLÍTICA DE CLASSIFICAÇÃO:
    - Referencie as curvas Z-Score para Idade/Sexo da OMS (Organização Mundial da Saúde).
    - Mencione se o aluno está em Eutrofia, Baixo Peso, Sobrepeso ou Obesidade.

    REQUISITOS:
  - Linguagem formal, técnica(uso de termos como 'Eutrofia', 'Adiposidade', 'Curva de Crescimento', 'Anamnese').
    - Estilo: Texto corrido mas estruturado logicamente.
    - EXTENSÃO: De 8 a 12 linhas.
  `;

  const prompt = `ALUNO: ${data.iniciaisAluno}.SEXO: ${data.sexoLabel}.IDADE: ${data.idadeAnos} Anos.PESO: ${data.peso} kg.ESTATURA: ${data.estatura} m.IMC: ${data.imc.toFixed(2)}.ETAPA: ${data.etapa}.`;

  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key ausente");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "text/plain"
      }
    });

    return response.text || "Erro ao processar diagnóstico detalhado.";
  } catch (e) {
    console.error("Erro no diagnóstico IA:", e);
    // FALLBACK PROFISSIONAL LOCAL
    let classificacao = "Eutrofia (Estado Nutricional Adequado)";
    let recomendacao = "Manter oferta regular conforme cardápio PNAE.";

    if (data.imc >= 30) {
      classificacao = "Obesidade (Risco Metabólico)";
      recomendacao = "Recomenda-se controle de porções de carboidratos simples e monitoramento da aceitabilidade de fibras.";
    } else if (data.imc >= 25) {
      classificacao = "Sobrepeso";
      recomendacao = "Sugere-se inserção em atividades de Educação Alimentar e Nutricional (EAN) e redução de itens ultraprocessados em domicílio.";
    } else if (data.imc < 18.5) {
      classificacao = "Baixo Peso / Magreza";
      recomendacao = "Priorizar alimentos com alta densidade calórica e aporte proteico reforçado.";
    }

    return `PARECER TÉCNICO - NUTRICIONAL: Realizada avaliação antropométrica em ${new Date().toLocaleDateString()}, onde foi identificado IMC de ${data.imc.toFixed(2)}, classificando o discente em estado de ${classificacao}. ${data.condicoesClinicas ? `Considerando a condição clínica de ${data.condicoesClinicas}, ` : ""
      }o planejamento dietético deve ser rigorosamente seguido.${recomendacao} Fluxo de reavaliação sugerido: trimestral.`;
  }
};
export const generateProcurementDescription = async (
  foodName: string,
  category: 'GERAL' | 'AGRICULTURA_FAMILIAR'
): Promise<string> => {
  const systemInstruction = `
    VOCÊ É UM ESPECIALISTA EM LICITAÇÕES PARA ALIMENTAÇÃO ESCOLAR(PNAE).
    SUA MISSÃO É REDIGIR O DESCRITIVO TÉCNICO DE UM ALIMENTO PARA EDITAL.

    DIRETRIZES:
  1. Inclua características organolépticas(cor, cheiro, sabor).
    2. Específique o tipo de embalagem e rotulagem exigida.
    3. Mencione a obrigatoriedade de estar isento de sujidades e parasitas.
    4. Cite validade mínima no momento da entrega.
    5. Se for AGRICULTURA FAMILIAR, foque em produtos regionais, frescos, de produção local e preferencialmente orgânicos.
    6. Se for GERAL, foque em padrões de mercado industrial(Tipo 1, Marcas de primeira qualidade).
    
    TEXTO CURTO(máximo 4 linhas).
  `;

  const prompt = `ALIMENTO: ${foodName}.CATEGORIA: ${category === 'AGRICULTURA_FAMILIAR' ? 'Chamada Pública (Agricultura Familiar)' : 'Licitação Geral'}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "text/plain"
      }
    });

    return response.text || "Descritivo técnico não gerado pela IA.";
  } catch (e) {
    console.error("Erro no descritivo IA:", e);
    return `${foodName}: Qualidade extra, conforme padrões PNAE e legislação sanitária.`;
  }
};

/**
 * AUTO-COMPLETE INVENTORY DATA (PNAE/TBCA)
 */
export const enrichFoodData = async (foodName: string): Promise<any> => {
  // 1. CLEANUP INPUT (Accent Insensitive)
  const term = foodName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  // 2. LOCAL FALLBACK DICTIONARY (Robust Demo Mode - ASCII KEYS)
  const COMMON_FOODS: Record<string, any> = {
    'ARROZ': { kcal: 130, protein: 2.7, carbs: 28, fats: 0.3, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'FEIJAO': { kcal: 76, protein: 4.8, carbs: 13.6, fats: 0.5, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'MACARRAO': { kcal: 157, protein: 5.8, carbs: 30, fats: 0.9, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'LEITE': { kcal: 60, protein: 3.2, carbs: 4.7, fats: 3.2, correctionFactor: 1, category: 'PEREATIVEL', isUltraProcessed: false },
    'FRANGO': { kcal: 165, protein: 31, carbs: 0, fats: 3.6, correctionFactor: 1.2, category: 'CONGELADO', isUltraProcessed: false },
    'CARNE': { kcal: 250, protein: 26, carbs: 0, fats: 15, correctionFactor: 1.2, category: 'CONGELADO', isUltraProcessed: false },
    'OVO': { kcal: 155, protein: 13, carbs: 1.1, fats: 11, correctionFactor: 1, category: 'PEREATIVEL', isUltraProcessed: false },
    'MACA': { kcal: 52, protein: 0.3, carbs: 14, fats: 0.2, correctionFactor: 1.1, category: 'HORTIFRUTI', isUltraProcessed: false },
    'BANANA': { kcal: 89, protein: 1.1, carbs: 22, fats: 0.3, correctionFactor: 1.3, category: 'HORTIFRUTI', isUltraProcessed: false },
    'CENOURA': { kcal: 41, protein: 0.9, carbs: 9.6, fats: 0.2, correctionFactor: 1.15, category: 'HORTIFRUTI', isUltraProcessed: false },
    'ALFACE': { kcal: 15, protein: 1.3, carbs: 2.9, fats: 0.2, correctionFactor: 1.1, category: 'HORTIFRUTI', isUltraProcessed: false },
    'TOMATE': { kcal: 18, protein: 0.9, carbs: 3.9, fats: 0.2, correctionFactor: 1, category: 'HORTIFRUTI', isUltraProcessed: false },
    'BATATA': { kcal: 77, protein: 2, carbs: 17, fats: 0.1, correctionFactor: 1.2, category: 'HORTIFRUTI', isUltraProcessed: false },
    'ABOBORA': { kcal: 26, protein: 1, carbs: 6.5, fats: 0.1, correctionFactor: 1.3, category: 'HORTIFRUTI', isUltraProcessed: false },
    'CEBOLA': { kcal: 40, protein: 1.1, carbs: 9.3, fats: 0.1, correctionFactor: 1.15, category: 'HORTIFRUTI', isUltraProcessed: false },
    'ALHO': { kcal: 149, protein: 6.4, carbs: 33, fats: 0.5, correctionFactor: 1.1, category: 'SECO', isUltraProcessed: false },
    'OLEO': { kcal: 884, protein: 0, carbs: 0, fats: 100, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'ACUCAR': { kcal: 387, protein: 0, carbs: 100, fats: 0, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'SAL': { kcal: 0, protein: 0, carbs: 0, fats: 0, correctionFactor: 1, category: 'SECO', isUltraProcessed: false },
    'BISCOITO': { kcal: 450, protein: 7, carbs: 70, fats: 15, correctionFactor: 1, category: 'SECO', isUltraProcessed: true },
    'BOMBOM': { kcal: 500, protein: 5, carbs: 65, fats: 25, correctionFactor: 1, category: 'SECO', isUltraProcessed: true },
    'ACHOCOLATADO': { kcal: 400, protein: 4, carbs: 85, fats: 2, correctionFactor: 1, category: 'SECO', isUltraProcessed: true },
    'MARGARINA': { kcal: 717, protein: 0.5, carbs: 0.1, fats: 81, correctionFactor: 1, category: 'PEREATIVEL', isUltraProcessed: true },
    'SUCO CAIXA': { kcal: 45, protein: 0, carbs: 11, fats: 0, correctionFactor: 1, category: 'SECO', isUltraProcessed: true },
  };

  // CHECK DICTIONARY FIRST (Robust matching)
  const words = term.split(/\s+/);

  // 1. Exact Match (Highest Priority)
  if (COMMON_FOODS[term]) return COMMON_FOODS[term];

  // 2. Word Match (Avoids 'Salada' matching 'Sal')
  // We check each word of the input against the dictionary keys
  for (const word of words) {
    if (COMMON_FOODS[word]) return COMMON_FOODS[word];
  }

  // 3. AI CONFIGURATION
  let apiKey = "";
  try {
    apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).VITE_GEMINI_API_KEY || "";
  } catch (e) { /* ignore */ }

  if (!apiKey) {
    return {
      kcal: 100, protein: 5, carbs: 15, fats: 2, correctionFactor: 1.1, category: 'SECO', isUltraProcessed: false, description: "IA Offline - Usando padrão."
    };
  }

  const systemInstruction = `
    VOCÊ É UM NUTRICIONISTA ESPECIALISTA EM PNAE.
    RETORNE DADOS NUTRICIONAIS(TBCA) EM JSON ESTRITO PARA O ALIMENTO INFORMADO.
    - category: 'SECO', 'HORTIFRUTI', 'PEREATIVEL', 'CONGELADO'
    - kcal, protein, carbs, fats, correctionFactor: números decimais
      - isUltraProcessed: booleano
  `;

  try {
    const aiWithKey = new GoogleGenAI({ apiKey });

    // Implementation with Timeout to avoid "stuck" state
    const response = await Promise.race([
      aiWithKey.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `ALIMENTO: ${foodName} `,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
    ]) as any;

    if (!response.text) throw new Error("Sem resposta da API");
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("AI Enrich Error", e);
    // Dynamic Fallback based on name if everything fails
    const isFruitOrVeg = term.includes('SUCO') || term.includes('FRUTA') || term.includes('VERDURA');
    return {
      kcal: isFruitOrVeg ? 50 : 0,
      protein: 0,
      carbs: isFruitOrVeg ? 10 : 0,
      fats: 0,
      correctionFactor: 1,
      isUltraProcessed: false,
      description: "Preenchimento manual sugerido."
    };
  }
};
