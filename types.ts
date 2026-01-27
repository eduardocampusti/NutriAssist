// ===================================
// SISTEMA NUTRIASSIST - TYPES v2.6
// Aligned with DB Schema 2026
// ===================================

export enum UserRole {
  ADMIN = 'ADMIN',
  NUTRICIONISTA = 'NUTRICIONISTA',
  SECRETARIA = 'SECRETARIA',
  DIRETOR = 'DIRETOR',
  MERENDEIRA = 'MERENDEIRA',
  TECNICO = 'TECNICO',
  COORDENADORA = 'COORDENADORA',
  SECRETARIO = 'SECRETARIO',
  NUCLEO_ESCOLAR = 'NÚCLEO ESCOLAR',
  VISUALIZADOR = 'VISUALIZADOR'
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  login?: string;
  senha?: string; // For management via RPC
  role: UserRole;
  perfil?: UserRole; // Legacy compatibility
  ativo: boolean;
  bloqueado?: boolean;
  school_id?: string;
  zona_id?: 'SEDE' | 'RURAL' | 'COCAL' | string;
  cpf?: string;
  crn?: string;
  telefone?: string;
  endereco?: string;
  foto?: string;
  schoolId?: string; // Alias for school_id
  createdAt?: number | string; // Alias for created_at
  created_at?: number | string;
  senha_provisoria?: boolean;
  data_alteracao_senha?: string | number;
}

// --- 3. NÚCLEO NORMATIVO (A Lente Legal) ---
export enum NovaClassification {
  IN_NATURA = 'in_natura',
  MINIMAMENTE_PROCESSADO = 'minimamente_processado',
  PROCESSADO = 'processado',
  ULTRAPROCESSADO = 'ultraprocessado',
  INGREDIENTE_CULINARIO = 'ingrediente_culinario'
}

export enum NormativeStatus {
  PERMITIDO = 'permitido',
  RESTRITO = 'restrito',
  PROIBIDO = 'proibido'
}

export interface NormativeFood {
  id: string;
  nome: string;
  grupo_alimentar: string;
  classificacao_nova: NovaClassification;
  idade_minima: number;
  idade_maxima: number;
  status_normativo: NormativeStatus;
  fundamentacao_legal?: string;
  observacoes_tecnicas?: string;
  versao: number;
  ativo: boolean;
  data_criacao?: string;
}

// --- 5. ESTOQUE (O Físico) ---
export interface StockProduct {
  id: string;
  alimento_normativo_id?: string;
  nome_comercial?: string;
  unidade_medida?: string;
  estoque_minimo?: number;
  saldo_atual?: number;
  ativo?: boolean;

  // Joins (Helper)
  normative_data?: NormativeFood;
}

// Compatibility Interface (InventoryItem Wrapper)
// Maps the old InventoryItem to the new Strict Model for Legacy Components
export interface InventoryItem extends StockProduct {
  // Legacy fields mapped or calculated
  nome: string; // Mapped from nome_comercial
  categoria: any; // Mapped from normative_data?

  // Nutritional Data (Now part of Normative or Extended?)
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  sodium?: number;
  iron?: number;
  vit_a?: number;
  calcium?: number;
  sugar?: number;
  fiber?: number;

  costPerUnit: number; // Mapped from recent purchase?
  correctionFactor: number;
  isUltraProcessed: boolean; // Calculated from classificacao_nova

  // Procurement
  allowed_af?: boolean;
  technicalSpecifications?: string;
  seasonality?: string[];

  // PNAE specific
  nutritional_group?: 'CARBOIDRATO' | 'PROTEINA' | 'LEGUMINOSA' | 'HORTIFRUTI' | 'OUTROS';

  prohibitedForAgeUnder3?: boolean;

  // Aliases for DB fields (snake_case)
  saldoAtual: number;
  estoqueMinimo: number;
  unidadeMedida?: string;
  saldo_atual?: number;
  estoque_minimo?: number;
  unidade_medida?: string;
  cost_per_unit?: number;
  correction_factor?: number;
  is_ultra_processed?: boolean;

  // Relational Extensions
  classificacaoNova?: string;
  faixaEtariaMinMeses?: number;
  faixaEtariaMaxMeses?: number;
  statusNormativo?: 'PERMITIDO' | 'RESTRITO' | 'PROIBIDO';
  fundamentacaoLegal?: string;
  observacoesTecnicas?: string;

  created_at: number; // Legacy uses number timestamp
  origemPadrao?: 'AGRICULTURA_FAMILIAR' | 'PROCESSO_LICITATORIO' | 'DISPENSA';
}

// --- 6. MOVIMENTAÇÕES ---
export interface StockMovement {
  id: string;
  produto_id: string;
  escola_id?: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE';
  quantidade: number;
  data_movimento: string;
  justificativa?: string;
  responsavel_id: string;
}

// --- 7 & 8. ALUNOS & NAE ---
export interface Student {
  id: string;
  nome: string;
  escolaId: string; // Mapped to escola_id
  dataNascimento: string;
  possuiNae: boolean;
  ativo: boolean;
  created_at: number | string;
  dados_complementares?: any;
  foto_url?: string;
  clinical?: {
    diagnosis?: string;
    cid?: string;
    specialNeeds?: string[];
    allergies?: string;
    weight?: string | number;
    height?: string | number;
  };
  guardians?: {
    name: string;
    relationship: string;
    phone: string;
    cpf?: string;
  }[];
  socialInfo?: {
    nis?: string;
    bolsaFamilia?: boolean;
  };
  address?: {
    street?: string;
    number?: string;
    district?: string;
    city?: string;
  };
}

export interface StudentNutritionalNeeds {
  id: string;
  alunoId: string;
  tipoRestricao: string;
  descricaoClinica: string;
  laudoMedicoUrl?: string;
  anoReferencia: number;
  created_at?: number | string;
  observacoes?: string;
}

// --- 9 & 10. CARDÁPIOS ---
export interface MenuPlan {
  id: string;
  // Make original fields optional to support partial frontend objects
  ano_letivo?: number;
  periodo?: string;
  modalidade?: string;
  escola_id?: string;
  faixa_etaria?: string;
  status: DocStatus;
  tipoRefeicaoPrincipal?: MealType;
  criado_por?: string;
  aprovado_por?: string;
  data_criacao?: string;
  data_aprovacao?: string;

  // Joins/UI Helpers
  itens?: Dish[];
  alertas?: Alerta[];

  // Frontend / Context Compatibility
  titulo?: string;
  escolaId?: string;
  studentNeId?: string;
  etapa?: string;
  numAlunos?: number;
  diasLetivos?: number;
  isSpecial?: boolean;
  authorId?: string;
  preparacoes?: any[]; // Or specific type
  faixaEtariaMinMeses?: number;
  faixaEtariaMaxMeses?: number;
  nutritionalStats?: any;
  estimatedCost?: number;
  stockStatus?: any;
  justificativaTecnica?: string;
  created_at?: number | string; // Helper
}

export interface MenuItemRelational {
  id: string;
  cardapio_id: string;
  alimento_id: string;
  quantidade: number;
  porcao: string;
  observacao?: string;
  data_criacao: string;
}

export enum AlertaTipo {
  INFORMATIVO = 'informativo',
  RESTRITIVO = 'restritivo',
  BLOQUEANTE = 'bloqueante'
}

export interface Alerta {
  id: string;
  cardapio_id: string;
  alimento_id: string;
  tipo_alerta: AlertaTipo;
  descricao: string;
  ativo: boolean;
  data_criacao: string;
  justificativas?: Justificativa[];
}

export interface Justificativa {
  id: string;
  alerta_id: string;
  texto: string;
  usuario_id: string;
  data_registro: string;
}

// --- 11 & 12. LICITAÇÕES ---
export interface ProcurementProcess {
  id: string;
  ano_exercicio?: number;
  numero_processo?: string;
  tipo_processo?: 'PREGAO' | 'CHAMADA_PUBLICA' | 'DISPENSA';
  objeto?: string;
  status: 'PLANEJAMENTO' | 'PUBLICADO' | 'HOMOLOGADO' | 'CANCELADO' | DocStatus | string;
  created_at: string | number;
  items?: ProcurementItemRelational[];

  // Legacy aliases
  titulo?: string;
  anoReferencia?: number;
  itens?: any[];
  justificativaTecnica?: string;
  justificativa_tecnica?: string;
  authorId?: string;
  author_id?: string;
}

export type ProcurementPlan = ProcurementProcess;

export interface ProcurementItemRelational {
  id: string;
  licitacao_id: string;
  alimento_normativo_id: string;
  quantidade_anual: number;
  unidade_medida: string;
  especificacao_tecnica?: string;
  valor_estimado?: number;
}

// --- LEGACY ENUMS & HELPERS KEPT FOR COMPATIBILITY ---
export enum EducationalStage {
  CRECHE = 'CRECHE',
  PRE_ESCOLA = 'PRE_ESCOLA',
  FUNDAMENTAL_I = 'FUNDAMENTAL_I',
  FUNDAMENTAL_II = 'FUNDAMENTAL_II',
  EJA = 'EJA',
  ENSINO_MEDIO = 'ENSINO_MEDIO',
  INTEGRAL = 'EDUCACAO_INTEGRAL'
}

export enum MealType {
  DESJEJUM = 'DESJEJUM',
  ALMOCO = 'ALMOCO',
  LANCHE = 'LANCHE',
  REFEICAO_ESPECIAL = 'REFEICAO_ESPECIAL'
}

export enum DocStatus {
  ELABORACAO = 'EM_ELABORACAO',
  ENVIADO = 'ENVIADO',
  AJUSTE = 'EM_ELABORACAO', // Revert to elaboration or use specific AJUSTE status if DB allows? DB has: 'EM_ELABORACAO', 'ENVIADO', 'APROVADO'. 
  // Wait, DB Schema line 101: CHECK (status IN ('EM_ELABORACAO', 'ENVIADO', 'APROVADO', 'ARQUIVADO'))
  // So AJUSTE is probably just 'EM_ELABORACAO' (back to draft) or I need to add 'AJUSTE' to DB.
  // User req: "Solicitar ajustes". Logic: Back to draft? Or specific status?
  // Let's assume 'EM_ELABORACAO' for Adjustment for now to stay unsafe strict, OR add 'AJUSTE' to DB and Types.
  // The user prompt implied a specific status "DEVOLVIDO"?
  // Re-read DB Schema Line 101: status IN ('EM_ELABORACAO', 'ENVIADO', 'APROVADO', 'ARQUIVADO').
  // So 'AJUSTE' is NOT in DB. I will map Adjust to 'EM_ELABORACAO' or 'ARQUIVADO'? No.
  // I will map AJUSTE to 'EM_ELABORACAO' (Draft) + Observation.

  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  ARQUIVADO = 'ARQUIVADO',
  ANALISE = 'EM_ANALISE'
}


export enum FoodNeedType {
  ALERGIA = 'ALERGIA_ALIMENTAR',
  INTOLERANCIA = 'INTOLERANCIA_ALIMENTAR',
  CONDICAO_CLINICA = 'CONDICAO_CLINICA',
  TEA_SELETIVIDADE = 'TEA_SELETIVIDADE',
  OUTRAS = 'OUTRAS'
}

export enum InventoryCategory {
  SECO = 'SECO',
  PEREATIVEL = 'PEREATIVEL',
  HORTIFRUTI = 'HORTIFRUTI',
  CONGELADO = 'CONGELADO',
  LIMPEZA = 'PRODUTO_LIMPEZA'
}

export interface MenuIngredient {
  itemId: string;
  perCapitaGrams: number;
}

export interface Dish {
  id: string;
  nome: string;
  mealType: MealType;
  diaSemana: number;
  ingredientes: MenuIngredient[];
}

export interface School {
  id: string;
  nome: string;
  codigo_inep: string;
  tipo_unidade: 'ESCOLA' | 'CRECHE' | 'ANEXO' | 'OUTROS';
  localidade: string;
  zona?: 'SEDE' | 'RURAL' | 'COCAL' | string;
  zona_id?: string;
  endereco: string;
  municipio: string;
  numAlunos: number;
  numAlunosNE: number;
  etapas: EducationalStage[];
  turnos: string[];
  diretor: string;
  telefone: string;
  email: string;
  ativo: boolean;
  created_at: number;
  observacoes?: string;
  prioridade_score?: number;
  prioridade_nivel?: 'ALTA' | 'MÉDIA' | 'BAIXA';
  ultima_priorizacao_data?: string;
}

// Additional Interfaces for completeness if needed by existing components...
export interface LetterheadConfig {
  municipio: string;
  showMunicipio: boolean;
  uf: string;
  orgao: string;
  showOrgao: boolean;
  secretaria: string;
  showSecretaria: boolean;
  setor: string;
  showSetor: boolean;
  textoPersonalizado: string;
  showTextoPersonalizado: boolean;
  rodapeTexto: string;
  showRodapeTexto: boolean;
  logoEmoji: string;
  primaryColor: string;
  sidebarColor: string;
  accentColor: string;
  sistemaVersao: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
  responsavelSME: string;
  prefeitoNome?: string;
  secretariaNome?: string;
  nutricionistaNome?: string;
  nutricionistaCrn?: string;
  onboardingComplete: boolean;
  headerImage?: string;
  footerImage?: string;
  loginImage?: string;
  loginBackground?: string;
}

export interface GeneratedContent {
  titulo: string;
  assunto: string;
  destinatario: string;
  corpo: string;
  conclusao: string;
  observacoes: string;
}

// Consolidation: ProcurementPlan is now an alias for ProcurementProcess above

export interface ProcurementMapItem {
  inventoryItemId: string;
  inventoryItemName: string;
  totalQuantity: number;
  averageCost: number;
  totalCost: number;
  isAF: boolean;
  technicalSpec: string;
}

// --- LEGACY COMPATIBILITY ---
export interface HistoryItem {
  id: string;
  date: number;
  action: string;
  user: string;
  details: string;
  // Extras
  timestamp?: number;
  type?: string;
  category?: string;
  title?: string;
  content?: any;
  status?: string;
  authorRole?: string;
  authorName?: string;
  profileId?: string;
}

export interface Cook {
  id: string;
  nome: string;
  escolaId: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  created_at?: number | string;
}

export interface StudentNE {
  id: string;
  nome: string;
  escolaId: string;
  turma?: string;
  etapa?: EducationalStage;
  turno?: string;
  tipoNecessidade: FoodNeedType;
  alimentosRestritos: string;
  alimentosAceitos?: string;
  necessitaAdaptacao: boolean;
  possuiLaudo: boolean;
  nomePai?: string;
  nomeMae?: string;
  endereco?: string;
  foto?: string;
  ativo: boolean;
  observacoes?: string;
  created_at?: number | string;
}

export interface FormalDocument {
  id: string;
  document_type: string;
  titulo: string;
  status: DocStatus;
  responsavel_id: string;
  created_at: number;
  content: GeneratedContent;
  isDeleted?: boolean;
  // Extras
  school_id?: string;
  deletedAt?: number;
}

export interface SystemLog {
  id: string;
  timestamp?: number;
  level?: 'INFO' | 'WARN' | 'ERROR';
  message?: string;
  userId?: string;
  metadata?: any;
  // Joins/Supabase Fields
  usuario_id?: string;
  modulo?: string;
  acao?: string;
  dados?: any;
  created_at?: number | string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: MovementType | string;
  quantity: number;
  date: number;
  authorId: string;
  batchId?: string; // Optional linkage to a specific batch
  supplierId?: string; // Optional linkage
  schoolId?: string;
  finalidade?: string | MovementPurpose;
  observacao?: string;
  valuePerUnit?: number;

  // DB Aliases
  item_id?: string;
  batch_id?: string;
  supplier_id?: string;
  school_id?: string;
  tipo?: string;
  quantidade?: number;
  data_movimento?: string;
  responsavel_id?: string;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;

  // Alternative fields used in components
  loteCod?: string;
  validade?: number | string;
  quantidadeInicial?: number;
  saldoAtual?: number;
  valorUnitario?: number;
  dataEntrada?: number | string;
  supplierId?: string;
  ativo?: boolean;
  created_at?: number | string;
}

export interface NutritionalEvaluation {
  id: string;
  iniciaisAluno: string;
  studentId?: string;
  sexo: 'M' | 'F';
  dataNascimento?: string;
  turno?: string;
  idadeAnos: number;
  idadeMeses?: number;
  escolaId: string;
  etapa: EducationalStage | string;
  serie?: string;
  turma?: string;
  professor?: string;
  contatoResponsaveis?: string;
  peso: number;
  estatura: number;
  imc: number;
  classificacaoImc?: SisvanClassification;
  condicoesClinicas: string;
  necessidadesEspeciais: string;
  riscoIdentificado: boolean;
  diagnosticoDescritivo: string;
  authorId?: string;
  created_at: number | string;
}

export interface TrainingSession {
  id: string;
  tema: string;
  data: number;
  escolasParticipantesIds: string[];
  cooksParticipantesIds: string[];
  numParticipantes: number;
  cargaHoraria: number;
  conteudoProgramatico: string;
  metodologia: string;
  observacoes: string;
  materialUrls?: string[];
  authorId: string;
  created_at: number;
  newMaterialUrl?: string; // Added
}

export interface TrainingCertificate {
  id: string;
  trainingId: string;
  cookId: string;
  issueDate: number;
  hash: string; // For validation
}

export interface MenuExecution {
  id: string;
  menuId: string;
  dishId?: string; // Target preparation
  schoolId: string;
  date: string | number; // ISO or Timestamp
  data?: string | number; // Alias
  servingsConfirmed: number;
  studentsPresent?: number; // Alias/Legacy
  acceptanceRate?: number; // 0-100
  photoUrl?: string;
  wasModified?: boolean;
  notes?: string;
  authorId: string;
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  PERDA = 'PERDA',
  AJUSTE = 'AJUSTE'
}


export enum MovementPurpose {
  CONSUMO = 'CONSUMO',
  VALIDADE = 'VALIDADE',
  DANIFICADO = 'DANIFICADO',
  REGULAR = 'REGULAR',
  REPOSICAO = 'REPOSICAO',
  AJUSTE = 'AJUSTE',
  ESPECIAL = 'ESPECIAL'
}


export interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  documento?: string; // Alternative for cnpj/cpf
  contato?: string;
  tipo?: string | SupplierType;
  ativo: boolean;
  created_at?: number | string;
}

export enum DocumentCategory {
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  TECNICO = 'TECNICO',
  JURIDICO = 'JURIDICO',
  OUTROS = 'OUTROS',
  // Extras
  OFICIO = 'OFICIO',
  PARECER = 'PARECER',
  RELATORIO = 'RELATORIO',
  MENSAL = 'RELATORIO_MENSAL',
  ESTOQUE = 'RELATORIO_ESTOQUE',
  SAUDE = 'RELATORIO_SAUDE',
  LICITACAO = 'RELATORIO_LICITACAO'
}

export enum SupplierType {
  AGRICULTURA_FAMILIAR = 'AGRICULTURA_FAMILIAR',
  MERCADO_COMUM = 'MERCADO_COMUM',
  COOPERATIVA = 'COOPERATIVA',
  // Compatibility Aliases
  AGRICULTOR = 'AGRICULTURA_FAMILIAR',
  JURIDICA = 'MERCADO_COMUM',
  FISICA = 'AGRICULTURA_FAMILIAR'
}

export interface Purchase {
  id: string;
  items: any[];
  totalValue: number;
  agricultureFamilyPercent: number;
  status: 'COTACAO' | 'EMPENHO' | 'ENTREGUE';
  legalReference?: string;
}

export interface AuditLog {
  id: string;
  usuario_id?: string;
  acao: string; // INSERT, UPDATE, DELETE, APPROVE
  entidade: string;
  entidade_id?: string;
  data_hora: string;
  observacao?: string;
  dados_antigos?: any;
  dados_novos?: any;
}


export interface GeneratedDocument {
  id: string;
  tipo_documento: string; // TR, ETP, PARECER
  referencia_id?: string;
  url_arquivo?: string;
  created_at: string;
}

// --- 15. AVALIAÇÃO NUTRICIONAL (SISVAN) ---
export enum SisvanClassification {
  MAGREZA_ACENTUADA = 'MAGREZA_ACENTUADA',
  MAGREZA = 'MAGREZA',
  EUTROFIA = 'EUTROFIA',
  SOBREPESO = 'SOBREPESO',
  OBESIDADE = 'OBESIDADE',
  OBESIDADE_GRAVE = 'OBESIDADE_GRAVE'
}

export enum EvaluationPurpose {
  VIGILANCIA = 'VIGILANCIA_NUTRICIONAL',
  ACOMPANHAMENTO = 'ACOMPANHAMENTO',
  ATENDIMENTO_NAE = 'ATENDIMENTO_NAE',
  RELATORIO_INSTITUCIONAL = 'RELATORIO_INSTITUCIONAL',
  ENCAMINHAMENTO = 'ENCAMINHAMENTO_SAUDE'
}

export interface NutritionalAssessment {
  id: string;
  alunoId: string;
  nutricionistaId: string;

  // Antropometria
  peso: number;
  estatura: number;
  imc: number;

  // Classificação
  classificacaoImc: SisvanClassification;

  // Diagnóstico
  condicoesClinicas: string[];
  observacoes?: string;
  parecerTecnico: string;
  recomendacoes?: string;

  // Meta
  finalidade: EvaluationPurpose;
  dataAfericao: string;
  created_at: string;

  // Joins
  aluno?: Student;
}

// Appending missing types
export interface MenuAdaptedResult { [key: string]: any; }
export interface DocumentAiDraft { [key: string]: any; }
export interface DocumentTypeConfig { [key: string]: any; }
export interface StructuredContext { [key: string]: any; }
export interface StockAnalysisResult { [key: string]: any; }
export interface SpecialNeedsRegistryResult { [key: string]: any; }
export interface MenuAutomationResult { [key: string]: any; }
export interface MonthlyReportResult { [key: string]: any; }
export interface Contract { [key: string]: any; }
export interface ProcessStatus { [key: string]: any; }
export interface ContractStatus { [key: string]: any; }


// --- 17. ALERTAS INTELIGENTES ---
export enum AlertType {
  INFORMATIVO = 'INFORMATIVO',
  ATENCAO = 'ATENCAO',
  CRITICO = 'CRITICO'
}

export enum AlertCategory {
  ESTOQUE_BAIXO = 'ESTOQUE_BAIXO',
  ESTOQUE_ESGOTANDO = 'ESTOQUE_ESGOTANDO',
  CARDAPIO_INVIAVEL = 'CARDAPIO_INVIAVEL',
  RECEBIMENTO_NAO_CONFIRMADO = 'RECEBIMENTO_NAO_CONFIRMADO',
  AUDITORIA_ATRASADA = 'AUDITORIA_ATRASADA',
  CONSUMO_EXCESSIVO = 'CONSUMO_EXCESSIVO',
  SOLICITACAO_REPETIDA = 'SOLICITACAO_REPETIDA',
  INATIVIDADE_USUARIO = 'INATIVIDADE_USUARIO',
  ALTERACAO_SENSIVEL = 'ALTERACAO_SENSIVEL',
  USO_PERFIL_INVALIDO = 'USO_PERFIL_INVALIDO',
  OUTROS = 'OUTROS'
}

export interface IntelligentAlert {
  id: string;
  escola_id: string;
  tipo_alerta: AlertType;
  categoria: AlertCategory;
  titulo: string;
  descricao: string;
  referencia_id?: string;
  data_geracao: string;
  resolvido: boolean;
  data_resolucao?: string;
  created_at: string;
  justificativa_admin?: string;
  encaminhado_auditoria?: boolean;
  auditado_por?: string;

  // Join helpers
  escola?: { nome: string };
}

// --- 16. DISTRIBUIÇÃO E RECEBIMENTO ---
export enum DistributionStatus {
  PENDENTE = 'PENDENTE',
  EM_TRANSITO = 'EM_TRANSITO',
  AGUARDANDO_CONFIRMACAO = 'AGUARDANDO_CONFIRMACAO',
  ENTREGUE = 'ENTREGUE',
  ENTREGUE_COM_DIVERGENCIA = 'ENTREGUE_COM_DIVERGENCIA',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO'
}

export interface Distribution {
  id: string;
  escola_id: string;
  cardapio_id?: string;
  status: DistributionStatus;
  data_envio?: string;
  responsavel_logistica_id?: string;
  motorista?: string;
  placa_veiculo?: string;
  data_recebimento?: string;
  responsavel_recebimento_id?: string;
  observacoes_recebimento?: string;
  created_at?: string;
  updated_at?: string;

  // Assinatura Digital Simples
  assinatura_digital_simples?: boolean;
  declaracao_aceite?: string;
  comprovante_url?: string;
  cargo_responsavel?: string;

  // Joins
  escola?: School;
  itens?: DistributionItem[];
}

export interface DistributionItem {
  id: string;
  distribuicao_id: string;
  produto_id: string;
  lote?: string;
  validade?: string;
  quantidade_enviada: number;
  quantidade_recebida?: number;
  observacao_item?: string;
  created_at?: string;
}


// --- 17. INTERCORRÊNCIAS OPERACIONAIS (CONTINGÊNCIA) ---
export enum OccurrenceType {
  ENTREGA_PARCIAL = 'ENTREGA_PARCIAL',
  FALTA_ALIMENTO = 'FALTA_ALIMENTO',
  DIVERGENCIA_QTD = 'DIVERGENCIA_QUANTIDADE',
  PRODUTO_IMPROPRIO = 'PRODUTO_IMPROPRIO',
  AVARIA_LOGISTICA = 'AVARIA_LOGISTICA',
  OUTROS = 'OUTROS'
}

export enum OccurrenceStatus {
  PENDENTE = 'PENDENTE_AVALIAÇÃO',
  AVALIADO = 'AVALIADO_TECNICAMENTE',
  RESOLVIDO = 'RESOLVIDO',
  CANCELADO = 'CANCELADO'
}

export interface OperationalOccurrence {
  id: string;
  escola_id: string;
  tipo: OccurrenceType;
  descricao: string;
  status: OccurrenceStatus;
  data_registro: string;
  responsavel_registro_id: string;

  // Itens afetados (Opcional)
  itens_afetados?: {
    produto_id: string;
    quantidade_afetada: number;
    motivo_especifico?: string;
  }[];

  // Evidências
  foto_url?: string;

  // Parecer Técnico (Nutricionista)
  data_avaliacao?: string;
  responsavel_avaliacao_id?: string;
  parecer_tecnico?: string;
  substituicao_alimentar_sugerida?: string;

  // Vinculação
  cardapio_afetado_id?: string;
  periodo_afetado?: string;

  created_at?: string;
  updated_at?: string;
}

// --- 18. AUDITORIA E REPOSIÇÃO DE ESTOQUE ---
export enum AuditItemStatus {
  NORMAL = 'NORMAL',
  BAIXO = 'BAIXO',
  FALTA = 'FALTA'
}

export interface StockAuditItem {
  produto_id: string;
  status_visto: AuditItemStatus;
  observacao?: string;
}

export interface StockAudit {
  id: string;
  escola_id: string;
  responsavel_id: string;
  data_auditoria: string;
  itens: StockAuditItem[];
  created_at?: string;
}

export enum ReplenishmentStatus {
  PENDENTE = 'PENDENTE',
  ANALISE = 'ANALISE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  ENTREGUE = 'ENTREGUE'
}

export enum ReplenishmentPriority {
  NORMAL = 'NORMAL',
  URGENTE = 'URGENTE',
  CRITICO = 'CRITICO'
}

export interface ReplenishmentRequestItem {
  produto_id: string;
  quantidade_pedida: number;
  observacao?: string;
}

export interface ReplenishmentRequest {
  id: string;
  escola_id: string;
  solicitante_id: string;
  tecnico_id?: string;
  status: ReplenishmentStatus;
  prioridade: ReplenishmentPriority;
  itens: ReplenishmentRequestItem[];
  data_pedido: string;
  data_atendimento?: string;
  observacao_geral?: string;
  parecer_nutricional?: string;
  created_at?: string;
}

// --- 19. CONTROLE SANITÁRIO MENSAL ---
export enum SanitaryAnswer {
  SIM = 'SIM',
  NAO = 'NAO',
  NA = 'N.A'
}

export interface SanitaryItemAnswer {
  pergunta: string;
  resposta: SanitaryAnswer;
  observacao?: string;
}

export interface SanitaryChecklist {
  id: string;
  escola_id: string;
  responsavel_id: string;
  mes_referencia: number;
  ano_referencia: number;
  data_realizacao: string;
  respostas: SanitaryItemAnswer[];
  observacoes_gerais?: string;
  created_at?: string;

  // Join helpers
  escola?: School;
  responsavel?: UserProfile;
}

// --- 20. HISTÓRICO DE ATENDIMENTO (TIMELINE) ---
export enum EventType {
  ENTREGA = 'ENTREGA',
  SOLICITACAO = 'SOLICITACAO',
  OCORRENCIA = 'OCORRENCIA',
  SANITARIO = 'SANITARIO',
  AJUSTE = 'AJUSTE'
}

export interface TimelineEvent {
  id: string;
  data: string;
  tipo: EventType;
  titulo: string;
  descricao: string;
  status?: string;
  responsavel: string;
  metadata?: any; // Para links ou dados extras (ex: ID do registro original)
}

// --- 21. JUSTIFICATIVAS ADMINISTRATIVAS ---
export enum JustificationType {
  FALTA_ITEM = 'FALTA_ITEM',
  ATRASO_ENTREGA = 'ATRASO_ENTREGA',
  SUBSTITUICAO_ALIMENTO = 'SUBSTITUICAO_ALIMENTO',
  ALTERACAO_CARDAPIO = 'ALTERACAO_CARDAPIO',
  PROBLEMA_FORNECEDOR = 'PROBLEMA_FORNECEDOR',
  OUTROS = 'OUTROS'
}

export interface AdministrativeJustification {
  id: string;
  escola_id: string;
  usuario_id: string;
  tipo: JustificationType;
  descricao: string;
  data_fato: string;
  vinculo_tipo?: 'ALERTA' | 'CARGA' | 'CARDAPIO' | 'FORNECEDOR';
  vinculo_id?: string;
  created_at?: string;

  // Helpers
  escola?: School;
  usuario?: UserProfile;
}
// --- 22. PAINEL DE CONFORMIDADE (SCORES) ---
export interface ComplianceReport {
  id: string;
  escola_id: string;
  periodo: string; // Ex: "2026-01"
  score_geral: number; // 0-100
  indicadores: {
    recebimentos_on_time: number; // %
    auditorias_contagem: number; // Qtd real no mês
    divergencia_estoque: number; // % de divergência detectada
    faltas_itens: number; // Qtd de faltas registradas
    execucao_cardapio: number; // %
    pendencias_abertas: number; // Qtd
  };
  status: 'ALTA' | 'ATENCAO' | 'RISCO';
  ultima_atualizacao: string;

  // Join helpers
  escola?: School;
}
