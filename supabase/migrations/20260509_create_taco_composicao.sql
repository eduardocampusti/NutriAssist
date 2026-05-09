-- Migration: Create TACO (UNICAMP) nutritional composition tables
-- Source: Tabela Brasileira de Composição de Alimentos - TACO 4ª Edição
-- Used as complementary source when FNDE fields are zero

-- 1. Version tracking (mirrors fnde_fonte_oficial pattern)
create table if not exists public.taco_fonte_oficial (
  id             uuid        primary key default uuid_generate_v4(),
  versao         text        not null unique,
  data_publicacao date        not null,
  url_fonte      text,
  observacoes    text,
  created_at     timestamptz default now()
);

-- 2. Main composition table (single table — TACO does not need alimento/composicao split)
create table if not exists public.taco_composicao (
  id                  uuid        primary key default uuid_generate_v4(),
  codigo_taco         text        not null unique,   -- sequential code from TACO spreadsheet
  descricao           text        not null,
  grupo_alimentar     text        not null default 'Não classificado',

  -- Macronutrients
  energia_kcal        numeric(7,2) not null default 0,
  proteinas_g         numeric(7,2) not null default 0,
  lipidios_g          numeric(7,2) not null default 0,
  carboidratos_g      numeric(7,2) not null default 0,
  fibras_g            numeric(7,2) not null default 0,

  -- Minerals
  calcio_mg           numeric(7,2) not null default 0,
  ferro_mg            numeric(7,2) not null default 0,
  sodio_mg            numeric(7,2) not null default 0,
  magnesio_mg         numeric(7,2) not null default 0,
  zinco_mg            numeric(7,2) not null default 0,

  -- Vitamins
  vitamina_a_mcg      numeric(7,2) not null default 0,
  vitamina_c_mg       numeric(7,2) not null default 0,

  -- Lipid fractions (from TACO supplementary table — 0 when not available)
  gordura_saturada_g  numeric(7,2) not null default 0,
  gordura_trans_g     numeric(7,2) not null default 0,

  -- Cooking correction factor (fator de cocção)
  -- 1.0 = no correction needed (raw or no water/fat change)
  -- Values < 1.0 = food loses weight during cooking (dehydration)
  -- Values > 1.0 = food absorbs weight during cooking (e.g., rice, pasta)
  fator_coccao        numeric(5,3) not null default 1.0,

  created_at          timestamptz  default now()
);

-- Indexes
create index if not exists idx_taco_composicao_descricao
  on public.taco_composicao using gin(to_tsvector('portuguese', descricao));

create index if not exists idx_taco_composicao_descricao_lower
  on public.taco_composicao (lower(descricao));

create index if not exists idx_taco_composicao_grupo
  on public.taco_composicao (grupo_alimentar);

-- Row Level Security
alter table public.taco_fonte_oficial  enable row level security;
alter table public.taco_composicao     enable row level security;

create policy "taco_fonte_select"   on public.taco_fonte_oficial  for select using (true);
create policy "taco_fonte_insert"   on public.taco_fonte_oficial  for insert with check (auth.role() in ('authenticated','service_role'));

create policy "taco_comp_select"    on public.taco_composicao     for select using (true);
create policy "taco_comp_insert"    on public.taco_composicao     for insert with check (auth.role() in ('authenticated','service_role'));
create policy "taco_comp_update"    on public.taco_composicao     for update using (auth.role() in ('authenticated','service_role'));

grant select, insert, update on public.taco_composicao, public.taco_fonte_oficial
  to authenticated, service_role;
