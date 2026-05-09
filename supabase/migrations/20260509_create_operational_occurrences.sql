-- Migration: Create operational_occurrences table
-- Fixes error: "Could not find the table 'public.operational_occurrences'"
-- Source: services/occurrenceService.ts, types.ts (OperationalOccurrence interface)

create table if not exists public.operational_occurrences (
  id                              uuid        primary key default uuid_generate_v4(),
  escola_id                       uuid        not null references public.schools(id) on delete cascade,
  tipo                            text        not null
                                    check (tipo in (
                                      'ENTREGA_PARCIAL',
                                      'FALTA_ALIMENTO',
                                      'DIVERGENCIA_QUANTIDADE',
                                      'PRODUTO_IMPROPRIO',
                                      'AVARIA_LOGISTICA',
                                      'OUTROS'
                                    )),
  descricao                       text        not null,
  status                          text        not null default 'PENDENTE_AVALIAÇÃO'
                                    check (status in (
                                      'PENDENTE_AVALIAÇÃO',
                                      'AVALIADO_TECNICAMENTE',
                                      'RESOLVIDO',
                                      'CANCELADO'
                                    )),
  data_registro                   timestamptz not null default now(),
  responsavel_registro_id         uuid        references public.profiles(id) on delete set null,

  -- Itens afetados (array de objetos: produto_id, quantidade_afetada, motivo_especifico)
  itens_afetados                  jsonb,

  -- Evidências
  foto_url                        text,

  -- Parecer técnico (preenchido pela nutricionista)
  data_avaliacao                  timestamptz,
  responsavel_avaliacao_id        uuid        references public.profiles(id) on delete set null,
  parecer_tecnico                 text,
  substituicao_alimentar_sugerida text,

  -- Vinculação com cardápio
  cardapio_afetado_id             uuid,
  periodo_afetado                 text,

  created_at                      timestamptz default now(),
  updated_at                      timestamptz default now()
);

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger operational_occurrences_updated_at
  before update on public.operational_occurrences
  for each row execute function public.set_updated_at();

-- Indexes for common query patterns (occurrenceService.ts filters by escola_id and status)
create index if not exists idx_operational_occurrences_escola_id
  on public.operational_occurrences (escola_id);

create index if not exists idx_operational_occurrences_status
  on public.operational_occurrences (status);

create index if not exists idx_operational_occurrences_created_at
  on public.operational_occurrences (created_at desc);

create index if not exists idx_operational_occurrences_escola_status
  on public.operational_occurrences (escola_id, status);

-- Row Level Security
alter table public.operational_occurrences enable row level security;

create policy "operational_occurrences_select"
  on public.operational_occurrences for select
  using (auth.role() in ('authenticated', 'service_role'));

create policy "operational_occurrences_insert"
  on public.operational_occurrences for insert
  with check (auth.role() in ('authenticated', 'service_role'));

create policy "operational_occurrences_update"
  on public.operational_occurrences for update
  using (auth.role() in ('authenticated', 'service_role'));

grant select, insert, update on public.operational_occurrences
  to authenticated, service_role;
