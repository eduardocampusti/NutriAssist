-- Fix: replace TACO RLS policies that were blocking inserts/updates.
-- DROP IF EXISTS is required — PostgreSQL does not support CREATE POLICY IF NOT EXISTS.

-- taco_fonte_oficial
drop policy if exists "taco_fonte_select" on public.taco_fonte_oficial;
drop policy if exists "taco_fonte_insert" on public.taco_fonte_oficial;
drop policy if exists "taco_fonte_update" on public.taco_fonte_oficial;

create policy "taco_fonte_select"
  on public.taco_fonte_oficial for select
  to authenticated, anon
  using (true);

create policy "taco_fonte_insert"
  on public.taco_fonte_oficial for insert
  to authenticated
  with check (true);

create policy "taco_fonte_update"
  on public.taco_fonte_oficial for update
  to authenticated
  using (true);

-- taco_composicao
drop policy if exists "taco_comp_select" on public.taco_composicao;
drop policy if exists "taco_comp_insert" on public.taco_composicao;
drop policy if exists "taco_comp_update" on public.taco_composicao;

create policy "taco_comp_select"
  on public.taco_composicao for select
  to authenticated, anon
  using (true);

create policy "taco_comp_insert"
  on public.taco_composicao for insert
  to authenticated
  with check (true);

create policy "taco_comp_update"
  on public.taco_composicao for update
  to authenticated
  using (true);

-- Ensure service_role bypasses RLS entirely (Supabase default, but explicit is safer)
grant select, insert, update on public.taco_fonte_oficial to service_role;
grant select, insert, update on public.taco_composicao    to service_role;
