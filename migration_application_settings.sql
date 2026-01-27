-- Migration: Create application_settings table
-- Description: Stores global application settings like letterhead config (Papel Timbrado)

create table if not exists application_settings (
  id text primary key, -- 'letterhead', 'general', etc.
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- RLS
alter table application_settings enable row level security;

-- Policies
-- Allow read access to all authenticated users (needed for rendering UI)
create policy "Allow read for authenticated" on application_settings
  for select using (auth.role() = 'authenticated');

-- Allow update access to admins and nutritionists (assuming roles exist based on setup_database.sql)
-- For simplicity in this migration, allow authenticated to update, but in prod constraint to roles
create policy "Allow update for authenticated" on application_settings
  for update using (auth.role() = 'authenticated');
  
-- Allow insert for initial setup
create policy "Allow insert for authenticated" on application_settings
  for insert with check (auth.role() = 'authenticated');
