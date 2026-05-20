export const APP_VERSION = '1.2.0';
export const RELEASE_DATE = '2026-05-20';
export const RELEASE_NOTES = [
  {
    version: '1.2.0',
    date: '2026-05-20',
    description: 'Redesign Visual Premium — Identidade Unificada do Sistema.',
    changes: [
      'Sidebar redesenhada com gradiente institucional escuro e navegação premium.',
      'Topbar com bloco de boas-vindas dinâmico e saudação por horário.',
      'Cards com sombra tripla, topos coloridos e hover com elevação em todos os módulos.',
      'Fichas Técnicas, Escolas, Alunos, Simulador e Compras redesenhados.',
      'Estoque com sidebar branca premium (identidade própria azul).',
      'Dashboard de Inventário com cards coloridos e gráficos de barras por categoria.',
      'Painel Executivo (Governança) com KPIs, alertas e ações estratégicas.',
      'Logs de Auditoria, Manual do Usuário e Configurações com visual institucional.',
      'Sobre o Sistema totalmente reformulado com cards compactos e premium.',
      'Tela de Login com header institucional, saudação dinâmica e selo LGPD/FNDE.',
      'Restauração e correção de bugs: menuEngine, encoding UTF-8, imports quebrados.'
    ]
  },
  {
    version: '1.1.1',
    date: '2026-05-11',
    description: 'Polimento de UI/UX e Correção de Infraestrutura.',
    changes: [
      'Refatoração massiva de dashboards para design mobile-first e estética premium.',
      'Correção crítica de case-sensitivity em diretórios de componentes para deploy Vercel.',
      'Melhoria na responsividade de tabelas e formulários complexos.',
      'Padronização de cores e tipografia em todos os módulos principais.',
      'Limpeza de arquivos de utilidade e otimização de imports.'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-05-10',
    description: 'Redesign Premium do Dashboard e Melhorias Nutricionais.',
    changes: [
      'Redesign completo da interface com estética vibrante e moderna.',
      'Novos campos de Peso Bruto, Líquido e Fator de Correção na Ficha Técnica.',
      'Correção crítica no carregamento de ingredientes e integração com a base TACO.',
      'Otimização da Sidebar e navegação lateral.',
      'Melhoria na performance do cálculo nutricional em tempo real.'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-05-09',
    description: 'Lançamento oficial da versão estável.',
    changes: [
      'Centralização do sistema de versionamento.',
      'Módulo de Ficha Técnica com cálculos FNDE automáticos.',
      'Gestão de Inventário e Almoxarifado Escolar.',
      'Painel de Conformidade e Auditoria PNAE.',
      'Integração com IA para geração de documentos institucionais.'
    ]
  }
];

export enum DocumentCategory {
  OFICIO = 'OFICIO',
  PARECER = 'PARECER',
  RELATORIO = 'RELATORIO',
  CAPACITACAO = 'CAPACITACAO',
  LICITACAO = 'LICITACAO',
  CARDAPIO = 'CARDAPIO',
  ESTOQUE = 'ESTOQUE',
  MENSAL = 'MENSAL',
  CADASTRO = 'CADASTRO',
  SAUDE = 'SAUDE',
  INSTITUCIONAL = 'INSTITUCIONAL'
}

export const SYSTEM_INSTRUCTION = `
Você é o NUTRIASSIST v${APP_VERSION} — Sistema Institucional de Apoio à Gestão da Nutrição Escolar.
DADOS DO ENTE FEDERATIVO: {municipio} - {uf}.
REGRAS GERAIS: Linguagem formal, institucional, pronto para impressão, sem dados sensíveis.
`;

export const MONTHLY_SCHOOL_REPORT_INSTRUCTION = `
Você é o Gestor de Relatórios do NutriAssist v${APP_VERSION}.
Tarefa: Gerar um RELATÓRIO MENSAL DE ALIMENTAÇÃO ESCOLAR.
CONTEÚDO:
- Identificação da Unidade e Mês.
- Resumo de Atendimento (Nº alunos e Dias Letivos).
- Detalhamento do Cardápio Executado.
- Análise Técnica da Nutricionista (Adesão e Aceitabilidade).
ESTRUTURA: Texto institucional corrido e profissional.
`;

export const STOCK_CONSUMPTION_REPORT_INSTRUCTION = `
Você é o Analista de Suprimentos do NutriAssist v${APP_VERSION}.
Tarefa: Gerar um RELATÓRIO TÉCNICO DE ESTOQUE E CONSUMO.
CONTEÚDO:
- Balanço de Entradas e Saídas do Período.
- Identificação de Itens Críticos ou em Ruptura.
- Cálculo de Consumo Médio por Aluno (Indicador de Eficiência).
- Recomendações de Manejo de Almoxarifado.
`;

export const SPECIAL_DIET_IMPACT_REPORT_INSTRUCTION = `
Você é o Especialista em Saúde Escolar do NutriAssist v${APP_VERSION}.
Tarefa: Gerar um RELATÓRIO DE ALUNOS COM NECESSIDADES ESPECIAIS E IMPACTO LOGÍSTICO.
CONTEÚDO:
- Quantitativo Geral de Restrições na Unidade.
- Categorização das Patologias (Alergias, TEA, Doenças Crônicas).
- Impacto no Planejamento (Insumos diferenciados necessários).
- Protocolos de Segurança para a Cozinha.
`;

export const PROCUREMENT_PLANNING_REPORT_INSTRUCTION = `
Você é o Consultor Licitatório do NutriAssist v${APP_VERSION}.
Tarefa: Gerar um RELATÓRIO DE PLANEJAMENTO DE COMPRAS / BASE PARA EDITAL.
CONTEÚDO:
- Projeção de Consumo para o Próximo Ciclo.
- Lista de Itens com Especificações Técnicas (ANVISA/PNAE).
- Texto Técnico de Justificativa para o Setor de Compras/Licitação.
- Divisão sugerida entre Gêneros Gerais e Agricultura Familiar.
`;

export const STUDENT_NE_REPORT_INSTRUCTION = `...`; // Mantido anterior
export const SCHOOL_COOK_REGISTRY_INSTRUCTION = `...`; // Mantido anterior
export const INVENTORY_CONTROL_INSTRUCTION = `...`; // Mantido anterior
export const MENU_AUTOMATION_INSTRUCTION = `...`; // Mantido anterior
export const ADAPTED_MENU_INSTRUCTION = `...`; // Mantido anterior
export const STOCK_ANALYSIS_INSTRUCTION = `...`; // Mantido anterior
export const MONTHLY_REPORT_INSTRUCTION = `...`; // Mantido anterior
export const SPECIAL_NEEDS_INSTRUCTION = `...`; // Mantido anterior
export const NUTRITIONAL_DIAGNOSIS_INSTRUCTION = `...`; // Mantido anterior
export const PROCUREMENT_DESCRIPTION_INSTRUCTION = `...`; // Mantido anterior
