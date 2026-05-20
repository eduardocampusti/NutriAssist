-- =====================================================================
-- MIGRATION: 20260520_db_unification_and_security.sql
-- Objetivo: Unificação do Schema (Inglês), Hardening RLS (LGPD/PNAE)
--           e Otimização Relacional por Índices.
-- =====================================================================

-- ---------------------------------------------------------------------
-- FASE 1: DESVINCULAR TABELAS DE DISTRIBUIÇÃO DAS REPETIÇÕES EM PORTUGUÊS
-- ---------------------------------------------------------------------

-- Remover restrições antigas da tabela public.distribuicoes
ALTER TABLE public.distribuicoes DROP CONSTRAINT IF EXISTS distribuicoes_escola_id_fkey;
ALTER TABLE public.distribuicoes DROP CONSTRAINT IF EXISTS distribuicoes_responsavel_logistica_id_fkey;
ALTER TABLE public.distribuicoes DROP CONSTRAINT IF EXISTS distribuicoes_responsavel_recebimento_id_fkey;
ALTER TABLE public.distribuicoes DROP CONSTRAINT IF EXISTS distribuicoes_cardapio_id_fkey;

-- Remover restrições antigas da tabela public.distribuicao_itens
ALTER TABLE public.distribuicao_itens DROP CONSTRAINT IF EXISTS distribuicao_itens_produto_id_fkey;

-- ---------------------------------------------------------------------
-- FASE 1: LIMPEZA DE TABELAS DUPLICADAS E OBSOLETAS (PORTUGUÊS)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS public.estoque_movimentacoes CASCADE;
DROP TABLE IF EXISTS public.estoque_produtos CASCADE;
DROP TABLE IF EXISTS public.cardapio_itens CASCADE;
DROP TABLE IF EXISTS public.cardapios CASCADE;
DROP TABLE IF EXISTS public.alunos CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.escolas CASCADE;

-- ---------------------------------------------------------------------
-- FASE 2: FUNÇÕES AUXILIARES DE RLS (SECURITY DEFINER)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS public.user_role
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND ativo = true;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS uuid
SECURITY DEFINER
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() AND ativo = true;
$$ LANGUAGE sql;

-- ---------------------------------------------------------------------
-- FASE 1 (CONTINUAÇÃO): VINCULAR TABELAS DE DISTRIBUIÇÃO COM TABELAS EM INGLÊS
-- ---------------------------------------------------------------------

-- Recriar as chaves estrangeiras apontando para as tabelas unificadas em inglês
ALTER TABLE public.distribuicoes 
  ADD CONSTRAINT fk_distribuicoes_school FOREIGN KEY (escola_id) REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.distribuicoes 
  ADD CONSTRAINT fk_distribuicoes_resp_log FOREIGN KEY (responsavel_logistica_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.distribuicoes 
  ADD CONSTRAINT fk_distribuicoes_resp_rec FOREIGN KEY (responsavel_recebimento_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.distribuicoes 
  ADD CONSTRAINT fk_distribuicoes_menu FOREIGN KEY (cardapio_id) REFERENCES public.menu_plans(id) ON DELETE SET NULL;

ALTER TABLE public.distribuicao_itens 
  ADD CONSTRAINT fk_distribuicao_itens_item FOREIGN KEY (produto_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------
-- FASE 2: HARDENING DE RLS (ROW LEVEL SECURITY)
-- ---------------------------------------------------------------------

-- Habilitar RLS em todas as tabelas oficiais (garantindo que esteja ativado)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students_ne ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuicao_itens ENABLE ROW LEVEL SECURITY;

-- 1. TABELA: schools
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.schools;
DROP POLICY IF EXISTS "schools_read_policy" ON public.schools;
DROP POLICY IF EXISTS "schools_write_policy" ON public.schools;

CREATE POLICY "schools_read_policy" ON public.schools
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "schools_write_policy" ON public.schools
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 2. TABELA: profiles
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_write_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_write_policy" ON public.profiles;

CREATE POLICY "profiles_read_policy" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_self_write_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_write_policy" ON public.profiles
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 3. TABELA: cooks (Merendeiras)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.cooks;
DROP POLICY IF EXISTS "cooks_read_policy" ON public.cooks;
DROP POLICY IF EXISTS "cooks_write_policy" ON public.cooks;

CREATE POLICY "cooks_read_policy" ON public.cooks
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    escola_id = public.get_auth_user_school_id()
  );

CREATE POLICY "cooks_write_policy" ON public.cooks
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 4. TABELA: students_ne (LGPD: Dados sensíveis de saúde)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.students_ne;
DROP POLICY IF EXISTS "students_ne_read_policy" ON public.students_ne;
DROP POLICY IF EXISTS "students_ne_write_policy" ON public.students_ne;

CREATE POLICY "students_ne_read_policy" ON public.students_ne
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    escola_id = public.get_auth_user_school_id()
  );

CREATE POLICY "students_ne_write_policy" ON public.students_ne
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 5. TABELA: inventory_items (Cadastro do Estoque)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_read_policy" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_write_policy" ON public.inventory_items;

CREATE POLICY "inventory_items_read_policy" ON public.inventory_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "inventory_items_write_policy" ON public.inventory_items
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 6. TABELA: inventory_movements (Movimentações de Estoque)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.inventory_movements;
DROP POLICY IF EXISTS "inventory_movements_read_policy" ON public.inventory_movements;
DROP POLICY IF EXISTS "inventory_movements_insert_policy" ON public.inventory_movements;
DROP POLICY IF EXISTS "inventory_movements_admin_write_policy" ON public.inventory_movements;

CREATE POLICY "inventory_movements_read_policy" ON public.inventory_movements
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    school_id = public.get_auth_user_school_id()
  );

CREATE POLICY "inventory_movements_insert_policy" ON public.inventory_movements
  FOR INSERT WITH CHECK (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    school_id = public.get_auth_user_school_id()
  );

CREATE POLICY "inventory_movements_admin_write_policy" ON public.inventory_movements
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 7. TABELA: menu_plans (Cabeçalho do Cardápio)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.menu_plans;
DROP POLICY IF EXISTS "menu_plans_read_policy" ON public.menu_plans;
DROP POLICY IF EXISTS "menu_plans_write_policy" ON public.menu_plans;

CREATE POLICY "menu_plans_read_policy" ON public.menu_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "menu_plans_write_policy" ON public.menu_plans
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 8. TABELA: menu_dishes (Pratos do Cardápio)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.menu_dishes;
DROP POLICY IF EXISTS "menu_dishes_read_policy" ON public.menu_dishes;
DROP POLICY IF EXISTS "menu_dishes_write_policy" ON public.menu_dishes;

CREATE POLICY "menu_dishes_read_policy" ON public.menu_dishes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "menu_dishes_write_policy" ON public.menu_dishes
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 9. TABELA: menu_executions (Lançamento de Merenda / Execuções)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.menu_executions;
DROP POLICY IF EXISTS "menu_executions_read_policy" ON public.menu_executions;
DROP POLICY IF EXISTS "menu_executions_insert_policy" ON public.menu_executions;
DROP POLICY IF EXISTS "menu_executions_admin_write_policy" ON public.menu_executions;

CREATE POLICY "menu_executions_read_policy" ON public.menu_executions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "menu_executions_insert_policy" ON public.menu_executions
  FOR INSERT WITH CHECK (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    EXISTS (
      SELECT 1 FROM public.menu_plans mp
      WHERE mp.id = menu_plan_id AND mp.escola_id = public.get_auth_user_school_id()
    )
  );

CREATE POLICY "menu_executions_admin_write_policy" ON public.menu_executions
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 10. TABELA: formal_documents
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.formal_documents;
DROP POLICY IF EXISTS "formal_documents_read_policy" ON public.formal_documents;
DROP POLICY IF EXISTS "formal_documents_write_policy" ON public.formal_documents;

CREATE POLICY "formal_documents_read_policy" ON public.formal_documents
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    school_id = public.get_auth_user_school_id()
  );

CREATE POLICY "formal_documents_write_policy" ON public.formal_documents
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 11. TABELA: nutritional_evaluations
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.nutritional_evaluations;
DROP POLICY IF EXISTS "nutritional_evaluations_read_policy" ON public.nutritional_evaluations;
DROP POLICY IF EXISTS "nutritional_evaluations_write_policy" ON public.nutritional_evaluations;

CREATE POLICY "nutritional_evaluations_read_policy" ON public.nutritional_evaluations
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    escola_id = public.get_auth_user_school_id()
  );

CREATE POLICY "nutritional_evaluations_write_policy" ON public.nutritional_evaluations
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 12. TABELA: trainings (Capacitações)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.trainings;
DROP POLICY IF EXISTS "trainings_read_policy" ON public.trainings;
DROP POLICY IF EXISTS "trainings_write_policy" ON public.trainings;

CREATE POLICY "trainings_read_policy" ON public.trainings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "trainings_write_policy" ON public.trainings
  FOR ALL USING (public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA'));

-- 13. TABELA: distribuicoes (Ordens de Distribuição - OD)
DROP POLICY IF EXISTS "Admin/Secretaria veem todas as distribuicoes" ON public.distribuicoes;
DROP POLICY IF EXISTS "Escolas veem suas proprias distribuicoes" ON public.distribuicoes;
DROP POLICY IF EXISTS "Escolas confirmam recebimento" ON public.distribuicoes;
DROP POLICY IF EXISTS "distribuicoes_read_policy" ON public.distribuicoes;
DROP POLICY IF EXISTS "distribuicoes_insert_policy" ON public.distribuicoes;
DROP POLICY IF EXISTS "distribuicoes_update_policy" ON public.distribuicoes;
DROP POLICY IF EXISTS "distribuicoes_delete_policy" ON public.distribuicoes;

CREATE POLICY "distribuicoes_read_policy" ON public.distribuicoes
  FOR SELECT USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    escola_id = public.get_auth_user_school_id()
  );

CREATE POLICY "distribuicoes_insert_policy" ON public.distribuicoes
  FOR INSERT WITH CHECK (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO')
  );

CREATE POLICY "distribuicoes_update_policy" ON public.distribuicoes
  FOR UPDATE USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
    (escola_id = public.get_auth_user_school_id() AND status = 'EM_TRANSITO')
  );

CREATE POLICY "distribuicoes_delete_policy" ON public.distribuicoes
  FOR DELETE USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA')
  );

-- 14. TABELA: distribuicao_itens
DROP POLICY IF EXISTS "Visibilidade de itens segue distribuicao" ON public.distribuicao_itens;
DROP POLICY IF EXISTS "distribuicao_itens_read_policy" ON public.distribuicao_itens;
DROP POLICY IF EXISTS "distribuicao_itens_write_policy" ON public.distribuicao_itens;

CREATE POLICY "distribuicao_itens_read_policy" ON public.distribuicao_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.distribuicoes d
      WHERE d.id = distribuicao_id AND (
        public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO') OR
        d.escola_id = public.get_auth_user_school_id()
      )
    )
  );

CREATE POLICY "distribuicao_itens_write_policy" ON public.distribuicao_itens
  FOR ALL USING (
    public.get_auth_user_role() IN ('ADMIN', 'NUTRICIONISTA', 'TECNICO')
  );


-- ---------------------------------------------------------------------
-- FASE 4: OTIMIZAÇÃO POR ÍNDICES B-TREE (PERFORMANCE RELACIONAL)
-- ---------------------------------------------------------------------

-- schools
CREATE INDEX IF NOT EXISTS idx_schools_ativo ON public.schools(ativo);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo_role ON public.profiles(ativo, role);

-- cooks
CREATE INDEX IF NOT EXISTS idx_cooks_escola_id ON public.cooks(escola_id);
CREATE INDEX IF NOT EXISTS idx_cooks_situacao ON public.cooks(situacao);

-- students_ne
CREATE INDEX IF NOT EXISTS idx_students_ne_escola_id ON public.students_ne(escola_id);
CREATE INDEX IF NOT EXISTS idx_students_ne_ativo ON public.students_ne(ativo);

-- inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_school_id ON public.inventory_movements(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tipo_data ON public.inventory_movements(tipo, data_movimento DESC);

-- menu_plans
CREATE INDEX IF NOT EXISTS idx_menu_plans_escola_id ON public.menu_plans(escola_id);
CREATE INDEX IF NOT EXISTS idx_menu_plans_student_ne_id ON public.menu_plans(student_ne_id);
CREATE INDEX IF NOT EXISTS idx_menu_plans_status ON public.menu_plans(status);

-- menu_dishes
CREATE INDEX IF NOT EXISTS idx_menu_dishes_menu_plan_id ON public.menu_dishes(menu_plan_id);

-- menu_executions
CREATE INDEX IF NOT EXISTS idx_menu_executions_menu_plan_id ON public.menu_executions(menu_plan_id);
CREATE INDEX IF NOT EXISTS idx_menu_executions_data ON public.menu_executions(data_execucao DESC);

-- formal_documents
CREATE INDEX IF NOT EXISTS idx_formal_documents_school_id ON public.formal_documents(school_id);
CREATE INDEX IF NOT EXISTS idx_formal_documents_document_type ON public.formal_documents(document_type);

-- nutritional_evaluations
CREATE INDEX IF NOT EXISTS idx_nutritional_evaluations_escola_id ON public.nutritional_evaluations(escola_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_evaluations_created_at ON public.nutritional_evaluations(created_at DESC);

-- distribuicoes
CREATE INDEX IF NOT EXISTS idx_distribuicoes_escola_id ON public.distribuicoes(escola_id);
CREATE INDEX IF NOT EXISTS idx_distribuicoes_status ON public.distribuicoes(status);

-- distribuicao_itens
CREATE INDEX IF NOT EXISTS idx_distribuicao_itens_dist_id ON public.distribuicao_itens(distribuicao_id);
CREATE INDEX IF NOT EXISTS idx_distribuicao_itens_prod_id ON public.distribuicao_itens(produto_id);
