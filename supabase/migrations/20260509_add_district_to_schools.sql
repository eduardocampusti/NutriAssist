-- Migration: Add district column to schools table
-- Fixes error: "column schools_1.district does not exist"
-- Source: services/replenishmentService.ts queries schools(id, nome, district)

alter table public.schools
  add column if not exists district text;

comment on column public.schools.district is
  'Distrito/bairro da escola, usado em relatórios de auditoria de estoque';
