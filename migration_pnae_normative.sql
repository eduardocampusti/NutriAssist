-- Migration: PNAE Normative Layer (Resolução FNDE 06/2020)

-- 1. Create Enum for NOVA Classification
DO $$ BEGIN
    create type nova_group as enum ('IN_NATURA', 'PROCESSADO_CULINARIO', 'PROCESSADO', 'ULTRAPROCESSADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Inventory Items Table
alter table inventory_items 
add column if not exists nova_group nova_group default 'IN_NATURA',
add column if not exists prohibited_for_age_under_3 boolean default false,
add column if not exists legal_reference text,
add column if not exists technical_notes text;

-- 3. Update Menu Plans Table
alter table menu_plans
add column if not exists justifications jsonb default '{}'::jsonb,
add column if not exists compliance_status text check (compliance_status in ('COMPLIANT', 'RESTRICTED_APPROVED', 'NON_COMPLIANT')) default 'COMPLIANT';

-- 4. Update existing items based on broad assumptions (Optional - user can refine later)
-- Only safe updates. e.g. Sugar is definitely prohibited < 3
update inventory_items 
set prohibited_for_age_under_3 = true 
where nome ilike '%açúcar%' or nome ilike '%mel%' or nome ilike '%doce%';
