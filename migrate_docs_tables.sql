-- Migration: Add history, logs and settings for letterhead

-- History Items (Archive of generated documents/actions)
create table if not exists history_items (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz default now(),
  type text not null,
  category text, 
  title text not null,
  content jsonb not null,
  status text,
  author_role text,
  author_name text,
  profile_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- System Logs (Security and Audit)
create table if not exists system_logs (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references profiles(id),
  modulo text not null,
  acao text not null,
  dados jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Settings (Letterhead and global configs)
create table if not exists application_settings (
  id text primary key, -- 'letterhead'
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Procurements (Plano de Contratação Anual)
create table if not exists procurements (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  ano_referencia integer not null,
  status text default 'EM_ELABORACAO',
  itens jsonb default '[]'::jsonb,
  justificativa_tecnica text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- RLS
alter table history_items enable row level security;
alter table system_logs enable row level security;
alter table application_settings enable row level security;
alter table procurements enable row level security;

-- Policies
create policy "Allow all for authenticated" on history_items for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on system_logs for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on application_settings for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on procurements for all using (auth.role() = 'authenticated');
