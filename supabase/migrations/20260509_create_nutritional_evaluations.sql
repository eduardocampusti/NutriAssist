-- Migration: Create nutritional_evaluations table
-- Fixes error: "Could not find the table 'public.nutritional_evaluations'"
-- Source: contexts/NutritionContext.tsx, types.ts (NutritionalEvaluation interface)

create table if not exists public.nutritional_evaluations (
  id                     uuid        primary key default uuid_generate_v4(),
  iniciais_aluno         text        not null,
  idade_anos             integer     not null,
  escola_id              uuid        references public.schools(id) on delete set null,
  etapa                  text,
  peso                   numeric(5,2),
  estatura               numeric(5,2),
  imc                    numeric(5,2),
  sexo                   text        check (sexo in ('M', 'F')),
  serie                  text,
  professor              text,
  contato_responsaveis   text,
  risco_identificado     boolean     default false,
  diagnostico_descritivo text,
  author_id              uuid        references public.profiles(id) on delete set null,
  created_at             timestamptz default now()
);

-- Indexes for common query patterns
create index if not exists idx_nutritional_evaluations_escola_id
  on public.nutritional_evaluations (escola_id);

create index if not exists idx_nutritional_evaluations_created_at
  on public.nutritional_evaluations (created_at desc);

create index if not exists idx_nutritional_evaluations_risco
  on public.nutritional_evaluations (risco_identificado)
  where risco_identificado = true;

-- Row Level Security
alter table public.nutritional_evaluations enable row level security;

create policy "nutritional_evaluations_select"
  on public.nutritional_evaluations for select
  using (auth.role() in ('authenticated', 'service_role'));

create policy "nutritional_evaluations_insert"
  on public.nutritional_evaluations for insert
  with check (auth.role() in ('authenticated', 'service_role'));

create policy "nutritional_evaluations_update"
  on public.nutritional_evaluations for update
  using (auth.role() in ('authenticated', 'service_role'));

grant select, insert, update on public.nutritional_evaluations
  to authenticated, service_role;
