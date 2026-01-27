-- Migration for Menu Module

-- Ensure tables exist (they should from setup_database.sql, but let's be safe/consistent)

create table if not exists menu_plans (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  escola_id uuid references schools(id), 
  student_ne_id uuid references students_ne(id), 
  etapa educational_stage,
  num_alunos integer default 0,
  dias_letivos integer default 0,
  status doc_status default 'EM_ELABORACAO',
  is_special boolean default false,
  author_id uuid references profiles(id),
  nutritional_stats jsonb default '{}'::jsonb,
  estimated_cost numeric(10,2) default 0,
  stock_status text default 'OK',
  created_at timestamptz default now()
);

create table if not exists menu_dishes (
  id uuid primary key default uuid_generate_v4(),
  menu_plan_id uuid references menu_plans(id) on delete cascade,
  nome text not null,
  meal_type meal_type not null,
  dia_semana integer check (dia_semana between 1 and 7),
  ingredientes jsonb default '[]'::jsonb, 
  created_at timestamptz default now()
);

create table if not exists menu_executions (
  id uuid primary key default uuid_generate_v4(),
  menu_plan_id uuid references menu_plans(id) on delete set null,
  dish_id uuid references menu_dishes(id) on delete set null,
  data_execucao timestamptz not null default now(),
  servings_confirmed integer default 0,
  was_modified boolean default false,
  notes text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- RLS
alter table menu_plans enable row level security;
alter table menu_dishes enable row level security;
alter table menu_executions enable row level security;

-- Policies
create policy "Allow all for authenticated on menu_plans" on menu_plans for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated on menu_dishes" on menu_dishes for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated on menu_executions" on menu_executions for all using (auth.role() = 'authenticated');
