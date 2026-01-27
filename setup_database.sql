-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. ENUMS (Safe creation)
DO $$ BEGIN
    create type user_role as enum ('ADMIN', 'NUTRICIONISTA', 'TECNICO', 'VISUALIZADOR', 'DIRETOR', 'MERENDEIRA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type doc_status as enum ('EM_ELABORACAO', 'EM_ANALISE_TECNICA', 'DEVOLVIDO_PARA_AJUSTES', 'APROVADO', 'ARQUIVADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type educational_stage as enum ('CRECHE', 'PRE_ESCOLA', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'EJA', 'ENSINO_MEDIO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type food_need_type as enum ('ALERGIA_ALIMENTAR', 'INTOLERANCIA_ALIMENTAR', 'CONDICAO_CLINICA', 'TEA_SELETIVIDADE', 'OUTRAS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type meal_type as enum ('DESJEJUM', 'ALMOCO', 'LANCHE', 'REFEICAO_ESPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type inventory_category as enum ('SECO', 'PEREATIVEL', 'HORTIFRUTI', 'CONGELADO', 'PRODUTO_LIMPEZA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type movement_type as enum ('ENTRADA', 'SAIDA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type document_category as enum ('OFICIO', 'PARECER', 'RELATORIO', 'CAPACITACAO', 'LICITACAO', 'CARDAPIO', 'ESTOQUE', 'MENSAL', 'CADASTRO', 'SAUDE', 'INSTITUCIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SCHOOLS (Escolas)
create table if not exists schools (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  codigo_inep text,
  tipo_unidade text check (tipo_unidade in ('ESCOLA', 'CRECHE', 'ANEXO', 'OUTROS')),
  localidade text check (localidade in ('URBANA', 'RURAL')),
  endereco text,
  municipio text default 'BROTAS DE MACAÚBAS - BA',
  num_alunos integer default 0,
  num_alunos_ne integer default 0,
  etapas text[], 
  turnos text[], 
  diretor text,
  telefone text,
  email text,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 3. PROFILES (Perfis de Usuário linked to Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role user_role default 'VISUALIZADOR',
  school_id uuid references schools(id),
  
  -- New Fields for Full Management
  cpf text,
  crn text,
  telefone text,
  endereco text,
  foto text, -- Base64
  login text,
  senha text,

  ativo boolean default true,
  bloqueado boolean default false,
  created_at timestamptz default now()
);

-- 4. COOKS (Merendeiras/Cozinheiras)
create table if not exists cooks (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text,
  data_nascimento date,
  email text,
  matricula text,
  escola_id uuid references schools(id),
  funcao text check (funcao in ('MERENDEIRA', 'AUXILIAR', 'COZINHEIRA')),
  turno text check (turno in ('MANHA', 'TARDE', 'INTEGRAL')),
  telefone text,
  vinculo text check (vinculo in ('EFETIVA', 'CONTRATADA', 'ESTAGIARIA', 'OUTROS')),
  situacao text check (situacao in ('ATIVA', 'AFASTADA', 'INATIVA')),
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 5. STUDENTS_NE (Alunos com Necessidades Especiais)
create table if not exists students_ne (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  escola_id uuid references schools(id),
  etapa educational_stage,
  turno text,
  tipo_necessidade food_need_type,
  alimentos_restritos text,
  alimentos_aceitos text,
  necessita_adaptacao boolean default true,
  possui_laudo boolean default false,
  observacoes text,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 6. INVENTORY_ITEMS (Estoque - Cadastro)
create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  categoria inventory_category not null,
  
  -- PNAE SPECIFIC GROUPING
  nutritional_group text check (nutritional_group in ('CARBOIDRATO', 'PROTEINA', 'LEGUMINOSA', 'HORTIFRUTI', 'OUTROS')),
  
  saldo_atual numeric(10,3) default 0,
  estoque_minimo numeric(10,3) default 0,
  unidade_medida text not null check (unidade_medida in ('KG', 'L', 'UN', 'PCT', 'DZ')),
  origem_padrao text check (origem_padrao in ('LICITACAO', 'AGRICULTURA_FAMILIAR')),
  
  -- Nutritional Fields (Standard 100g)
  kcal numeric(10,2) default 0,
  protein numeric(10,2) default 0,
  carbs numeric(10,2) default 0,
  fats numeric(10,2) default 0,
  sodium numeric(10,2) default 0,
  sugar numeric(10,2) default 0,
  fiber numeric(10,2) default 0,
  iron numeric(10,2) default 0,      -- Ferro (mg)
  calcium numeric(10,2) default 0,   -- Calcio (mg)
  vit_a numeric(10,2) default 0,     -- Vitamina A (ug)
  vit_c numeric(10,2) default 0,     -- Vitamina C (mg)
  
  -- PNAE Calculation Fields
  correction_factor numeric(5,2) default 1.0, -- IPC/FC
  cost_per_unit numeric(10,2) default 0,      -- Est. Cost per Unit (KG/L/etc) -> cost_kg in user request
  is_ultra_processed boolean default false,

  -- PURCHASING & FAMILY AGRICULTURE
  allowed_af boolean default false, -- Permitido para Agricultura Familiar?
  seasonality text[], -- Meses disponíveis: ["JAN", "FEV", ...]
  priority integer default 3, -- 1 (Baixa) a 5 (Crítica)

  ativo boolean default true,
  created_at timestamptz default now()
);

-- 14. SUPPLIERS (Fornecedores)
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo text check (tipo in ('AGRICULTURA_FAMILIAR', 'FORNECEDOR_COMUM')), 
  documento text, -- CPF (DAP/CAF) ou CNPJ
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 15. PURCHASES (Pedidos de Compra)
create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  data_pedido date not null default CURRENT_DATE,
  supplier_id uuid references suppliers(id),
  total_value numeric(10,2) default 0,
  
  -- PNAE COMPLIANCE
  agriculture_family_percent numeric(5,2) default 0, -- % calculated
  status text check (status in ('PLANEJADO', 'EM_COTACAO', 'COMPRADO', 'ENTREGUE')),
  
  -- LEGAL & PROCUREMENT LINKS
  procurement_process_id uuid, -- Linked later via alter table to avoid circular deps if needed
  legal_reference text, 

  notes text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- 17. PROCUREMENT_MODES (Modalidades de Licitação)
create table if not exists procurement_modes (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique, -- "DISPENSA", "PREGAO", "CHAMADA_PUBLICA_AF"
  legal_basis text not null, -- "Lei 14.133/2021 Art. 75", "Resolução FNDE 06/2020"
  max_value numeric(10,2), -- Limit for Dispensa
  requires_bidding boolean default true,
  created_at timestamptz default now()
);

-- 18. PROCUREMENT_PROCESSES (Processos Administrativos)
create table if not exists procurement_processes (
  id uuid primary key default uuid_generate_v4(),
  year integer not null,
  protocol_number text, -- "001/2025"
  mode_id uuid references procurement_modes(id),
  object text not null, -- "Aquisição de Gêneros Alimentícios..."
  estimated_value numeric(10,2) default 0,
  
  status text check (status in ('PLANEJAMENTO', 'EM_ANDAMENTO', 'ADJUDICADO', 'HOMOLOGADO', 'CANCELADO')),
  af_required boolean default false, -- Is PNAE Family Ag focus?
  
  created_at timestamptz default now()
);

-- 19. BIDS (Vínculo Processo <-> Fornecedor)
create table if not exists bids (
  id uuid primary key default uuid_generate_v4(),
  procurement_id uuid references procurement_processes(id),
  supplier_id uuid references suppliers(id),
  proposal_value numeric(10,2),
  documents_ok boolean default false,
  status text check (status in ('VENCEDOR', 'PERDEDOR', 'DESCLASSIFICADO')),
  created_at timestamptz default now()
);

-- 20. CONTRACTS (Contratos)
create table if not exists contracts (
  id uuid primary key default uuid_generate_v4(),
  procurement_id uuid references procurement_processes(id),
  supplier_id uuid references suppliers(id),
  contract_number text,
  start_date date,
  end_date date,
  total_value numeric(10,2),
  balance_remaining numeric(10,2),
  status text check (status in ('ATIVO', 'VENCIDO', 'RESCINDIDO', 'CONCLUIDO')),
  created_at timestamptz default now()
);

-- ADD FK TO PURCHASES
DO $$ BEGIN
    alter table purchases add constraint fk_purchases_procurement foreign key (procurement_process_id) references procurement_processes(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 16. PURCHASE_ITEMS (Itens do Pedido)
create table if not exists purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid references purchases(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id),
  
  quantity_kg numeric(10,3) default 0,
  unit_cost numeric(10,2) default 0,
  total_cost numeric(10,2) default 0,
  
  created_at timestamptz default now()
);

-- 6.3 GLOBAL SETTINGS (Configurações Gerais PNAE)
create table if not exists global_settings (
  id uuid primary key default uuid_generate_v4(),
  age_range text not null unique, -- ex: "6-10"
  daily_kcal_reference numeric(10,2) not null, -- ex: 1800
  max_cost_per_student numeric(10,2) default 3.50,
  min_iron numeric(10,2) default 2.0, -- Meta de ferro por ref.
  updated_at timestamptz default now()
);

-- 6.1 SCHOOL_CLASSES (Turmas)
create table if not exists school_classes (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id) on delete cascade,
  nome text not null, -- "Turma A", "Jardim I"
  students_count integer default 0,
  age_range text, -- "4-5 anos"
  shift text check (shift in ('MATUTINO', 'VESPERTINO', 'INTEGRAL', 'NOTURNO')),
  created_at timestamptz default now()
);

-- 6.2 MEAL_CONFIGURATIONS (Configurações de Refeição PNAE)
create table if not exists meal_configurations (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- "Almoço Padrão", "Lanche Simples"
  pnae_percent numeric(5,2) not null, -- 20, 30, 70
  created_at timestamptz default now()
);

-- 7. INVENTORY_MOVEMENTS (Estoque - Movimentações)
create table if not exists inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references inventory_items(id),
  tipo movement_type not null,
  quantidade numeric(10,3) not null,
  data_movimento timestamptz default now(),
  school_id uuid references schools(id), 
  author_id uuid references profiles(id),
  finalidade text,
  referencia text,
  lote text,
  validade date,
  observacao text,
  created_at timestamptz default now()
);

-- 8. MENU_PLANS (Cardápios - Cabeçalho)
create table if not exists menu_plans (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  escola_id uuid references schools(id), 
  student_ne_id uuid references students_ne(id), 
  
  -- Associations for Automation
  school_class_id uuid references school_classes(id),
  meal_config_id uuid references meal_configurations(id),
  
  etapa educational_stage,
  num_alunos integer default 0,
  dias_letivos integer default 0,
  
  -- Calculated Totals
  total_kcal numeric(10,2) default 0,
  total_cost numeric(10,2) default 0,
  
  status doc_status default 'EM_ELABORACAO',
  is_special boolean default false,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- 9. MENU_DISHES (Pratos do Cardápio)
-- This table acts as "menu_items" in the user's logic, storing dish/preparation data.
-- Since a dish has multiple ingredients, we might need to distribute costs at ingredient level
-- or treat the Dish as the "Item" if it's a single food. 
-- For strict mapping to user's "menu_items" (Food relation), we should use the JSONB or a new table.
-- Given the current app structure, Ingredientes are inside JSONB. 
-- To support the "Collection" logic 1:1, we will add a new table `menu_items_detailed` 
-- that can be populated by the automation, OR extend this table if the app treats Dish = Composition.

-- LET'S EXTEND THE JSONB STRUCTURE IN TYPESCRIPT RATHER THAN SQL TO AVOID COMPLEXITY
-- BUT FOR SQL COMPLETENESS AS REQUESTED:
create table if not exists menu_ingredients_calc (
  id uuid primary key default uuid_generate_v4(),
  menu_plan_id uuid references menu_plans(id) on delete cascade,
  dish_id uuid references menu_dishes(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id),
  
  grams_per_student numeric(10,3) default 0,
  grams_total numeric(10,3) default 0,
  purchase_quantity numeric(10,3) default 0,
  cost numeric(10,2) default 0,
  
  created_at timestamptz default now()
);

-- 9. MENU_DISHES (Original Structure Kept for App Compatibility)
create table if not exists menu_dishes (
  id uuid primary key default uuid_generate_v4(),
  menu_plan_id uuid references menu_plans(id) on delete cascade,
  nome text not null,
  meal_type meal_type not null,
  dia_semana integer check (dia_semana between 1 and 7),
  ingredientes jsonb default '[]'::jsonb, 
  created_at timestamptz default now()
);

-- 10. MENU_EXECUTIONS (Execução do Cardápio)
create table if not exists menu_executions (
  id uuid primary key default uuid_generate_v4(),
  menu_plan_id uuid references menu_plans(id),
  dish_id uuid references menu_dishes(id),
  data_execucao date not null,
  servings_confirmed integer default 0,
  was_modified boolean default false,
  notes text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- 11. FORMAL_DOCUMENTS (Documentos Oficiais)
create table if not exists formal_documents (
  id uuid primary key default uuid_generate_v4(),
  document_type document_category not null,
  titulo text not null,
  status doc_status default 'EM_ELABORACAO',
  responsavel_id uuid references profiles(id),
  school_id uuid references schools(id),
  content jsonb not null, 
  is_deleted boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- 12. NUTRITIONAL_EVALUATIONS (Avaliações Antropométricas)
create table if not exists nutritional_evaluations (
  id uuid primary key default uuid_generate_v4(),
  iniciais_aluno text not null,
  idade_anos integer,
  escola_id uuid references schools(id),
  etapa educational_stage,
  peso numeric(5,2),
  estatura numeric(5,2),
  imc numeric(5,2),
  risco_identificado boolean default false,
  diagnostico_descritivo text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- 13. TRAININGS (Capacitações)
create table if not exists trainings (
  id uuid primary key default uuid_generate_v4(),
  tema text not null,
  data_realizacao date,
  escolas_participantes_ids uuid[], 
  cooks_participantes_ids uuid[], 
  num_participantes integer default 0,
  carga_horaria integer,
  conteudo_programatico text,
  metodologia text,
  observacoes text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table schools enable row level security;
alter table profiles enable row level security;
alter table cooks enable row level security;
alter table students_ne enable row level security;
alter table inventory_items enable row level security;
alter table inventory_movements enable row level security;
alter table menu_plans enable row level security;
alter table menu_dishes enable row level security;
alter table menu_executions enable row level security;
alter table formal_documents enable row level security;
alter table nutritional_evaluations enable row level security;
alter table trainings enable row level security;

-- Policies (Dropping first to avoid errors on run)
drop policy if exists "Allow all for authenticated" on schools;
create policy "Allow all for authenticated" on schools for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on profiles;
create policy "Allow all for authenticated" on profiles for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on cooks;
create policy "Allow all for authenticated" on cooks for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on students_ne;
create policy "Allow all for authenticated" on students_ne for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on inventory_items;
create policy "Allow all for authenticated" on inventory_items for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on inventory_movements;
create policy "Allow all for authenticated" on inventory_movements for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on menu_plans;
create policy "Allow all for authenticated" on menu_plans for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on menu_dishes;
create policy "Allow all for authenticated" on menu_dishes for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on menu_executions;
create policy "Allow all for authenticated" on menu_executions for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on formal_documents;
create policy "Allow all for authenticated" on formal_documents for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on nutritional_evaluations;
create policy "Allow all for authenticated" on nutritional_evaluations for all using (auth.role() = 'authenticated');

drop policy if exists "Allow all for authenticated" on trainings;
create policy "Allow all for authenticated" on trainings for all using (auth.role() = 'authenticated');
