-- Migration: Create FNDE Base Module
-- Description: Official FNDE/PNAE food composition tables with RLS and Auditing.
-- Author: Antigravity

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS fnde_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_fnde TEXT,
    descricao TEXT NOT NULL,
    grupo_alimentar TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fnde_composicao_nutricional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alimento_id UUID REFERENCES fnde_alimentos(id) ON DELETE CASCADE,
    energia_kcal NUMERIC,
    proteinas_g NUMERIC,
    carboidratos_g NUMERIC,
    lipidios_g NUMERIC,
    fibras_g NUMERIC,
    sodio_mg NUMERIC,
    calcio_mg NUMERIC,
    ferro_mg NUMERIC,
    gordura_saturada_g NUMERIC DEFAULT 0,
    magnesio_mg NUMERIC DEFAULT 0,
    zinco_mg NUMERIC DEFAULT 0,
    vitamina_a_mcg NUMERIC DEFAULT 0,
    vitamina_c_mg NUMERIC DEFAULT 0,
    gordura_trans_mg NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fnde_fonte_oficial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    versao_planilha TEXT,
    data_publicacao DATE,
    url_fonte TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE fnde_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fnde_composicao_nutricional ENABLE ROW LEVEL SECURITY;
ALTER TABLE fnde_fonte_oficial ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Admin/System profiles or users can manage data. All authenticated users can read.
DO $$
BEGIN
    -- Ensure 'SYSTEM' value exists in user_role enum if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SYSTEM';
        EXCEPTION
            WHEN others THEN NULL; -- Ignore if it already exists or can't be added in this context
        END;
    END IF;

    -- fnde_alimentos
    DROP POLICY IF EXISTS "FNDE Alimentos Read" ON fnde_alimentos;
    DROP POLICY IF EXISTS "FNDE Alimentos Write" ON fnde_alimentos;
    EXECUTE 'CREATE POLICY "FNDE Alimentos Read" ON fnde_alimentos FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "FNDE Alimentos Write" ON fnde_alimentos FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role::text = ''ADMIN'' OR role::text = ''SYSTEM''))
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND (perfil = ''ADMIN'' OR perfil = ''SYSTEM'' OR perfil = ''TECNICO''))
    )';

    -- fnde_composicao_nutricional
    DROP POLICY IF EXISTS "FNDE Composicao Read" ON fnde_composicao_nutricional;
    DROP POLICY IF EXISTS "FNDE Composicao Write" ON fnde_composicao_nutricional;
    EXECUTE 'CREATE POLICY "FNDE Composicao Read" ON fnde_composicao_nutricional FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "FNDE Composicao Write" ON fnde_composicao_nutricional FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role::text = ''ADMIN'' OR role::text = ''SYSTEM''))
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND (perfil = ''ADMIN'' OR perfil = ''SYSTEM'' OR perfil = ''TECNICO''))
    )';

    -- fnde_fonte_oficial
    DROP POLICY IF EXISTS "FNDE Fonte Read" ON fnde_fonte_oficial;
    DROP POLICY IF EXISTS "FNDE Fonte Write" ON fnde_fonte_oficial;
    EXECUTE 'CREATE POLICY "FNDE Fonte Read" ON fnde_fonte_oficial FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "FNDE Fonte Write" ON fnde_fonte_oficial FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role::text = ''ADMIN'' OR role::text = ''SYSTEM''))
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND (perfil = ''ADMIN'' OR perfil = ''SYSTEM'' OR perfil = ''TECNICO''))
    )';
END
$$;

-- 4. Audit Triggers
-- Using the existing trigger_audit_log function
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_audit_log') THEN
        DROP TRIGGER IF EXISTS audit_fnde_alimentos ON fnde_alimentos;
        CREATE TRIGGER audit_fnde_alimentos
        AFTER INSERT OR UPDATE OR DELETE ON fnde_alimentos
        FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

        DROP TRIGGER IF EXISTS audit_fnde_composicao ON fnde_composicao_nutricional;
        CREATE TRIGGER audit_fnde_composicao
        AFTER INSERT OR UPDATE OR DELETE ON fnde_composicao_nutricional
        FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

        DROP TRIGGER IF EXISTS audit_fnde_fonte ON fnde_fonte_oficial;
        CREATE TRIGGER audit_fnde_fonte
        AFTER INSERT OR UPDATE OR DELETE ON fnde_fonte_oficial
        FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
    END IF;
END
$$;
