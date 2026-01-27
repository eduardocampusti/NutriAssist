-- Migration to Implement Strict Relational Model (NutriAssist SME)
-- Maps to user request while maintaining English naming convention for code compatibility.

-- 1. USERS (Mapeamento: 'usuarios')
-- Existing 'profiles' table covers this. Adding 'email' for explicit mapping.
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. SCHOOLS (Mapeamento: 'escolas')
-- Existing 'schools' table covers this.
-- Ensure 'modalidade_atendida' concepts exist (etapas).

-- 3. STUDENTS (Mapeamento: 'alunos')
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome text NOT NULL,
    escola_id uuid REFERENCES schools(id),
    data_nascimento date,
    possui_nae boolean DEFAULT false,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. STUDENTS NAE (Mapeamento: 'alunos_nae')
CREATE TABLE IF NOT EXISTS student_nutritional_needs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id uuid REFERENCES students(id) ON DELETE CASCADE,
    tipo_restricao text, -- food_need_type enum can be used
    descricao_clinica text,
    laudo_medico_url text,
    observacoes text,
    ano_referencia integer, -- To track history
    created_at timestamptz DEFAULT now()
);

-- 5. NORMATIVE FOODS + STOCK (Mapeamento: 'alimentos_normativos' & 'estoque_produtos')
-- Extending 'inventory_items' to include normative data.
DO $$ BEGIN
    CREATE TYPE normative_status AS ENUM ('PERMITIDO', 'RESTRITO', 'PROIBIDO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS classificacao_nova text, -- Already have novaGroup enum, ensuring text sync or mapping
ADD COLUMN IF NOT EXISTS faixa_etaria_min_meses integer,
ADD COLUMN IF NOT EXISTS faixa_etaria_max_meses integer,
ADD COLUMN IF NOT EXISTS status_normativo normative_status DEFAULT 'PERMITIDO',
ADD COLUMN IF NOT EXISTS fundamentacao_legal text,
ADD COLUMN IF NOT EXISTS observacoes_tecnicas text;

-- 6. MENUS (Mapeamento: 'cardapios')
-- 'menu_plans' already exists.
ALTER TABLE menu_plans
ADD COLUMN IF NOT EXISTS faixa_etaria_min_meses integer,
ADD COLUMN IF NOT EXISTS faixa_etaria_max_meses integer,
ADD COLUMN IF NOT EXISTS periodo text CHECK (periodo IN ('SEMANAL', 'MENSAL')),
ADD COLUMN IF NOT EXISTS justificativa_tecnica text;

-- 7. MENU ITEMS (Mapeamento: 'cardapio_itens')
-- Relational breakdown for strict validation
CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardapio_id uuid REFERENCES menu_plans(id) ON DELETE CASCADE,
    alimento_id uuid REFERENCES inventory_items(id),
    tipo_refeicao text, -- meal_type
    quantidade numeric(10,3), -- g/per capita
    status_validacao text CHECK (status_validacao IN ('PERMITIDO', 'RESTRITO', 'BLOQUEADO')),
    justificativa_restricao text,
    created_at timestamptz DEFAULT now()
);

-- 8 & 9. STOCK (Covered by inventory_items and inventory_movements)

-- 10. PROCUREMENT (Mapeamento: 'licitacoes')
-- 'procurement_processes' exists.
ALTER TABLE procurement_processes
ADD COLUMN IF NOT EXISTS tipo_processo text; -- 'PREGAO', 'CHAMADA_PUBLICA' map to modes

-- 11. PROCUREMENT ITEMS (Mapeamento: 'licitacao_itens')
CREATE TABLE IF NOT EXISTS procurement_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    licitacao_id uuid REFERENCES procurement_processes(id) ON DELETE CASCADE,
    alimento_id uuid REFERENCES inventory_items(id),
    quantidade_anual numeric(10,3),
    unidade_medida text,
    created_at timestamptz DEFAULT now()
);

-- 12. DOCUMENTS (Covered by 'formal_documents')

-- 13. AUDIT LOGS (Mapeamento: 'logs_auditoria')
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id uuid REFERENCES profiles(id),
    acao text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'APPROVE'
    entidade text NOT NULL, -- Table name
    entidade_id uuid,
    data_hora timestamptz DEFAULT now(),
    observacao text,
    detalhes jsonb -- Extra data for diffs
);

-- RLS POLICIES
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_nutritional_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policy: Allow Authenticated (Can be refined for specific roles)
CREATE POLICY "Auth Read" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Write" ON students FOR ALL TO authenticated USING (true); -- Refine later

CREATE POLICY "Auth Read" ON student_nutritional_needs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Write" ON student_nutritional_needs FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth Read" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Write" ON menu_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth Read" ON procurement_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Write" ON procurement_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth Read" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- AUTOMATIC LOGGING TRIGGERS (Function)
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_id uuid;
BEGIN
    user_id := auth.uid();
    
    INSERT INTO audit_logs (usuario_id, acao, entidade, entidade_id, data_hora, detalhes)
    VALUES (
        user_id, 
        TG_OP, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        now(), 
        jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
    return NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers to Key Tables
DROP TRIGGER IF EXISTS audit_menus ON menu_plans;
CREATE TRIGGER audit_menus
AFTER INSERT OR UPDATE ON menu_plans
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

DROP TRIGGER IF EXISTS audit_procurement ON procurement_processes;
CREATE TRIGGER audit_procurement
AFTER INSERT OR UPDATE ON procurement_processes
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- BLOCKING GATEKEEPER TRIGGER (Constraint or Trigger)
-- "Bloquear aprovação de cardápios com itens status 'bloqueado'"
CREATE OR REPLACE FUNCTION check_menu_approval_compliance()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to APPROVED
    IF NEW.status = 'APROVADO' AND OLD.status != 'APROVADO' THEN
        -- Check if any item is BLOQUEADO
        IF EXISTS (SELECT 1 FROM menu_items WHERE cardapio_id = NEW.id AND status_validacao = 'BLOQUEADO') THEN
            RAISE EXCEPTION 'Não é possível aprovar cardápio com itens BLOQUEADOS.';
        END IF;
        
        -- Check if any item is RESTRITO without Justification
        IF EXISTS (SELECT 1 FROM menu_items WHERE cardapio_id = NEW.id AND status_validacao = 'RESTRITO' AND (justificativa_restricao IS NULL OR justificativa_restricao = '')) THEN
             RAISE EXCEPTION 'Itens RESTRITOS exigem justificativa técnica.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gatekeeper_menu_approval ON menu_plans;
CREATE TRIGGER gatekeeper_menu_approval
BEFORE UPDATE ON menu_plans
FOR EACH ROW EXECUTE FUNCTION check_menu_approval_compliance();
