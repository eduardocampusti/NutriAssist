-- Migration: Cardápio x Preparações (Fichas Técnicas)
-- Description: Links technical sheets to menu plans with daily scheduling.

-- 1. Table: cardapio_preparacoes
-- This is the "Opção C" (Snapshot/Daily) light version approved in brainstorm.
CREATE TABLE IF NOT EXISTS cardapio_preparacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cardapio_id UUID REFERENCES cardapio_tecnico(id) ON DELETE CASCADE,
    preparacao_id UUID REFERENCES fnde_preparacoes(id) ON DELETE RESTRICT,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1:Segunda, 7:Domingo
    ordem INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Logic: Automated Calculation for Prep-based Menu
CREATE OR REPLACE FUNCTION fn_recalcular_nutrientes_cardapio_global()
RETURNS TRIGGER AS $$
DECLARE
    v_cardapio_id UUID;
    v_stats_itens RECORD;
    v_stats_preps RECORD;
BEGIN
    v_cardapio_id := COALESCE(NEW.cardapio_id, OLD.cardapio_id);

    -- 1. Soma Nutrientes dos ITENS avulsos (se existirem)
    SELECT 
        SUM(total_energia_kcal) as e, SUM(total_proteinas_g) as p,
        SUM(total_carboidratos_g) as c, SUM(total_lipidios_g) as l,
        SUM(total_fibras_g) as f, SUM(total_sodio_mg) as s,
        SUM(total_calcio_mg) as ca, SUM(total_ferro_mg) as fe,
        SUM(total_gordura_saturada_g) as gs, SUM(total_magnesio_mg) as mg,
        SUM(total_zinco_mg) as zn, SUM(total_vitamina_a_mcg) as va,
        SUM(total_vitamina_c_mg) as vc, SUM(total_gordura_trans_mg) as gt
    INTO v_stats_itens
    FROM (
        SELECT calc.*
        FROM cardapio_itens ci
        CROSS JOIN LATERAL fnde_calcular_nutrientes_por_porcao(ci.alimento_id, ci.quantidade_g) calc
        WHERE ci.cardapio_id = v_cardapio_id
    ) sub;

    -- 2. Soma Nutrientes das PREPARAÇÕES vinculadas
    SELECT 
        SUM(energia_kcal) as e, SUM(proteinas_g) as p,
        SUM(carboidratos_g) as c, SUM(lipidios_g) as l,
        SUM(fibras_g) as f, SUM(sodio_mg) as s,
        SUM(calcio_mg) as ca, SUM(ferro_mg) as fe,
        SUM(gordura_saturada_g) as gs, SUM(magnesio_mg) as mg,
        SUM(zinco_mg) as zn, SUM(vitamina_a_mcg) as va,
        SUM(vitamina_c_mg) as vc, SUM(gordura_trans_mg) as gt
    INTO v_stats_preps
    FROM cardapio_preparacoes cp
    CROSS JOIN LATERAL fnde_get_preparacao_nutrientes(cp.preparacao_id)
    WHERE cp.cardapio_id = v_cardapio_id;

    -- 3. Atualiza o Consolidado
    UPDATE cardapio_tecnico
    SET 
        total_energia_kcal = COALESCE(v_stats_itens.e, 0) + COALESCE(v_stats_preps.e, 0),
        total_proteinas_g = COALESCE(v_stats_itens.p, 0) + COALESCE(v_stats_preps.p, 0),
        total_carboidratos_g = COALESCE(v_stats_itens.c, 0) + COALESCE(v_stats_preps.c, 0),
        total_lipidios_g = COALESCE(v_stats_itens.l, 0) + COALESCE(v_stats_preps.l, 0),
        total_fibras_g = COALESCE(v_stats_itens.f, 0) + COALESCE(v_stats_preps.f, 0),
        total_sodio_mg = COALESCE(v_stats_itens.s, 0) + COALESCE(v_stats_preps.s, 0),
        total_calcio_mg = COALESCE(v_stats_itens.ca, 0) + COALESCE(v_stats_preps.ca, 0),
        total_ferro_mg = COALESCE(v_stats_itens.fe, 0) + COALESCE(v_stats_preps.fe, 0),
        total_gordura_saturada_g = COALESCE(v_stats_itens.gs, 0) + COALESCE(v_stats_preps.gs, 0),
        total_magnesio_mg = COALESCE(v_stats_itens.mg, 0) + COALESCE(v_stats_preps.mg, 0),
        total_zinco_mg = COALESCE(v_stats_itens.zn, 0) + COALESCE(v_stats_preps.zn, 0),
        total_vitamina_a_mcg = COALESCE(v_stats_itens.va, 0) + COALESCE(v_stats_preps.va, 0),
        total_vitamina_c_mg = COALESCE(v_stats_itens.vc, 0) + COALESCE(v_stats_preps.vc, 0),
        total_gordura_trans_mg = COALESCE(v_stats_itens.gt, 0) + COALESCE(v_stats_preps.gt, 0)
    WHERE id = v_cardapio_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Triggers
DROP TRIGGER IF EXISTS tr_recalcular_nutrientes_vinc ON cardapio_preparacoes;
CREATE TRIGGER tr_recalcular_nutrientes_vinc
AFTER INSERT OR UPDATE OR DELETE ON cardapio_preparacoes
FOR EACH ROW EXECUTE FUNCTION fn_recalcular_nutrientes_cardapio_global();

-- RLS
ALTER TABLE cardapio_preparacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cardapio Preparacoes Read" ON cardapio_preparacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cardapio Preparacoes Write" ON cardapio_preparacoes FOR ALL TO authenticated USING (true);
