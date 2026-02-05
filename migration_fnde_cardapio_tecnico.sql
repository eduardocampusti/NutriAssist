-- Migration: FNDE Cardápio Técnico Inteligente
-- Description: Structure for technical menus using FNDE data with automated calculations and alerts.

-- 1. Table: cardapio_tecnico
CREATE TABLE IF NOT EXISTS cardapio_tecnico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    turno TEXT NOT NULL, -- Matutino, Vespertino, Integral, Noturno
    responsavel_tecnico_id UUID REFERENCES profiles(id),
    
    -- Consolidado Nutricional (Calculado via Trigger)
    total_energia_kcal NUMERIC DEFAULT 0,
    total_proteinas_g NUMERIC DEFAULT 0,
    total_carboidratos_g NUMERIC DEFAULT 0,
    total_lipidios_g NUMERIC DEFAULT 0,
    total_fibras_g NUMERIC DEFAULT 0,
    total_sodio_mg NUMERIC DEFAULT 0,
    total_calcio_mg NUMERIC DEFAULT 0,
    total_ferro_mg NUMERIC DEFAULT 0,
    
    -- Alertas Técnicos (Gerados via Trigger)
    alertas_tecnicos JSONB DEFAULT '[]'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: cardapio_itens
CREATE TABLE IF NOT EXISTS cardapio_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardapio_id UUID REFERENCES cardapio_tecnico(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES fnde_alimentos(id) ON DELETE RESTRICT,
    quantidade_g NUMERIC NOT NULL CHECK (quantidade_g > 0),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Logic: Trigger Function for Automated Calculation and Alerts
CREATE OR REPLACE FUNCTION fn_atualizar_nutrientes_cardapio()
RETURNS TRIGGER AS $$
DECLARE
    v_cardapio_id UUID;
    v_stats RECORD;
    v_alertas JSONB := '[]'::JSONB;
    v_repeticao_count INT;
BEGIN
    -- Determinar ID do cardápio afetado
    IF TG_OP = 'DELETE' THEN
        v_cardapio_id := OLD.cardapio_id;
    ELSE
        v_cardapio_id := NEW.cardapio_id;
    END IF;

    -- 1. Calcular Totais usando o Motor FNDE
    -- Converte itens do cardápio para JSONB para usar a função somar_nutrientes
    SELECT * INTO v_stats FROM fnde_somar_nutrientes_cardapio(
        (SELECT jsonb_agg(jsonb_build_object('alimento_id', alimento_id, 'quantidade_g', quantidade_g))
         FROM cardapio_itens 
         WHERE cardapio_id = v_cardapio_id)
    );

    -- 2. Gerar Alertas Técnicos (Lógica Informativa PNAE)
    IF v_stats.itens_contados > 0 THEN
        -- Alerta: Energia (Exemplo: Alerta se < 200kcal ou > 600kcal para uma refeição simples)
        IF v_stats.total_energia_kcal < 200 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'ENERGIA_BAIXA', 'mensagem', 'Densidade energética abaixo do recomendado.');
        ELSIF v_stats.total_energia_kcal > 600 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'ENERGIA_ALTA', 'mensagem', 'Atenção ao excesso calórico na refeição.');
        END IF;

        -- Alerta: Proteínas (Exemplo: < 10g)
        IF v_stats.total_proteinas_g < 8 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'PROTEINA_BAIXA', 'mensagem', 'Baixa oferta proteica detectada.');
        END IF;

        -- Alerta: Fibras (< 3g)
        IF v_stats.total_fibras_g < 3 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'FIBRAS_BAIXAS', 'mensagem', 'Recomendado aumentar oferta de alimentos com fibras.');
        END IF;

        -- Alerta: Sódio (> 400mg)
        IF v_stats.total_sodio_mg > 400 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'SODIO_ELEVADO', 'mensagem', 'Atenção: Nível de sódio acima do limite técnico sugerido.');
        END IF;

        -- Alerta: Repetição de Alimentos
        SELECT COUNT(*) INTO v_repeticao_count 
        FROM (SELECT alimento_id, COUNT(*) FROM cardapio_itens WHERE cardapio_id = v_cardapio_id GROUP BY alimento_id HAVING COUNT(*) > 1) s;
        
        IF v_repeticao_count > 0 THEN
            v_alertas := v_alertas || jsonb_build_object('tipo', 'REPETICAO', 'mensagem', 'Itens duplicados detectados no mesmo cardápio.');
        END IF;
    END IF;

    -- 3. Atualizar o Cabeçalho do Cardápio
    UPDATE cardapio_tecnico
    SET 
        total_energia_kcal = COALESCE(v_stats.total_energia_kcal, 0),
        total_proteinas_g = COALESCE(v_stats.total_proteinas_g, 0),
        total_carboidratos_g = COALESCE(v_stats.total_carboidratos_g, 0),
        total_lipidios_g = COALESCE(v_stats.total_lipidios_g, 0),
        total_fibras_g = COALESCE(v_stats.total_fibras_g, 0),
        total_sodio_mg = COALESCE(v_stats.total_sodio_mg, 0),
        total_calcio_mg = COALESCE(v_stats.total_calcio_mg, 0),
        total_ferro_mg = COALESCE(v_stats.total_ferro_mg, 0),
        alertas_tecnicos = v_alertas
    WHERE id = v_cardapio_id;

    RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply Triggers
DROP TRIGGER IF EXISTS tr_atualizar_nutrientes_cardapio ON cardapio_itens;
CREATE TRIGGER tr_atualizar_nutrientes_cardapio
AFTER INSERT OR UPDATE OR DELETE ON cardapio_itens
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_nutrientes_cardapio();

-- 5. Row Level Security (RLS)
ALTER TABLE cardapio_tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio_itens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- cardapio_tecnico
    DROP POLICY IF EXISTS "Cardapio Tecnico Read" ON cardapio_tecnico;
    DROP POLICY IF EXISTS "Cardapio Tecnico Write" ON cardapio_tecnico;
    EXECUTE 'CREATE POLICY "Cardapio Tecnico Read" ON cardapio_tecnico FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Cardapio Tecnico Write" ON cardapio_tecnico FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role::text IN (''ADMIN'', ''SYSTEM'', ''NUTRICIONISTA'', ''TECNICO'')))
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND (perfil IN (''ADMIN'', ''SYSTEM'', ''NUTRICIONISTA'', ''TECNICO'')))
    )';

    -- cardapio_itens
    DROP POLICY IF EXISTS "Cardapio Itens Read" ON cardapio_itens;
    DROP POLICY IF EXISTS "Cardapio Itens Write" ON cardapio_itens;
    EXECUTE 'CREATE POLICY "Cardapio Itens Read" ON cardapio_itens FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Cardapio Itens Write" ON cardapio_itens FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role::text IN (''ADMIN'', ''SYSTEM'', ''NUTRICIONISTA'', ''TECNICO'')))
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND (perfil IN (''ADMIN'', ''SYSTEM'', ''NUTRICIONISTA'', ''TECNICO'')))
    )';
END
$$;

-- 6. Audit Triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_audit_log') THEN
        CREATE TRIGGER audit_cardapio_tecnico
        AFTER INSERT OR UPDATE OR DELETE ON cardapio_tecnico
        FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

        CREATE TRIGGER audit_cardapio_itens
        AFTER INSERT OR UPDATE OR DELETE ON cardapio_itens
        FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
    END IF;
END
$$;

COMMENT ON TABLE cardapio_tecnico IS 'Armazena o planejamento nutricional técnico baseado na Base FNDE.';
COMMENT ON TABLE cardapio_itens IS 'Itens individuais e gramaturas compossuindo o cardápio técnico.';
