-- Migration: FNDE Painel Nutricional por Escola
-- Description: Views and functions for nutritional monitoring and trend analysis per school.

-- 1. Function: fn_fnde_get_pnae_targets
-- Returns reference values for nutritional compliance based on FNDE/PNAE standards.
CREATE OR REPLACE FUNCTION fn_fnde_get_pnae_targets(p_etapa TEXT DEFAULT 'FUNDAMENTAL_I')
RETURNS TABLE (
    ref_energia_kcal NUMERIC,
    ref_proteinas_g NUMERIC,
    ref_fibras_g NUMERIC,
    ref_sodio_mg NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    -- Simplified reference mapping (can be extended based on official PNAE tables)
    RETURN QUERY SELECT 
        CASE 
            WHEN p_etapa = 'CRECHE' THEN 500.0
            WHEN p_etapa = 'PRE_ESCOLA' THEN 450.0
            ELSE 550.0 -- FUNDAMENTAL
        END as ref_energia_kcal,
        15.0 as ref_proteinas_g,
        3.0 as ref_fibras_g,
        400.0 as ref_sodio_mg;
END;
$$;

-- 2. View: vw_fnde_consolidado_escola
-- Consolidates nutritional data from technical menus by school and week.
CREATE OR REPLACE VIEW vw_fnde_consolidado_escola AS
SELECT 
    ct.escola_id,
    s.nome as escola_nome,
    s.localidade as zona_escolar,
    date_trunc('week', ct.periodo_inicio)::DATE as semana_inicio,
    AVG(ct.total_energia_kcal) as media_energia,
    AVG(ct.total_proteinas_g) as media_proteinas,
    AVG(ct.total_fibras_g) as media_fibras,
    AVG(ct.total_sodio_mg) as media_sodio,
    COUNT(*) as num_cardapios
FROM cardapio_tecnico ct
JOIN schools s ON ct.escola_id = s.id
GROUP BY ct.escola_id, s.nome, s.localidade, date_trunc('week', ct.periodo_inicio);

-- 3. Function: fn_fnde_gerar_alertas_gerenciais
-- Detects management risks and nutritional trends.
CREATE OR REPLACE FUNCTION fn_fnde_gerar_alertas_gerenciais(p_escola_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_alertas JSONB := '[]'::JSONB;
    v_low_energy_count INT;
    v_sodium_trend_up BOOLEAN;
BEGIN
    -- Trend: Recurrent low energy (3 or more weeks in the last 5)
    SELECT COUNT(*) INTO v_low_energy_count
    FROM (
        SELECT media_energia 
        FROM vw_fnde_consolidado_escola 
        WHERE escola_id = p_escola_id 
        ORDER BY semana_inicio DESC 
        LIMIT 5
    ) sub
    WHERE media_energia < 400;

    IF v_low_energy_count >= 3 THEN
        v_alertas := v_alertas || jsonb_build_object(
            'tipo', 'RISCO_RECORRENTE', 
            'mensagem', 'Risco nutricional recorrente: Baixa oferta calórica detectada em 3 das últimas 5 semanas.',
            'nivel', 'CRITICO'
        );
    END IF;

    -- Trend: Upward sodium trend (Simplified check)
    WITH ultimas_semanas AS (
        SELECT media_sodio, ROW_NUMBER() OVER (ORDER BY semana_inicio DESC) as rn
        FROM vw_fnde_consolidado_escola
        WHERE escola_id = p_escola_id
        LIMIT 3
    )
    SELECT (w1.media_sodio > w2.media_sodio AND w2.media_sodio > w3.media_sodio) INTO v_sodium_trend_up
    FROM ultimas_semanas w1, ultimas_semanas w2, ultimas_semanas w3
    WHERE w1.rn = 1 AND w2.rn = 2 AND w3.rn = 3;

    IF v_sodium_trend_up THEN
        v_alertas := v_alertas || jsonb_build_object(
            'tipo', 'TENDENCIA_NEGATIVA', 
            'mensagem', 'Tendência de aumento nos níveis de sódio nas últimas 3 semanas.',
            'nivel', 'ATENCAO'
        );
    END IF;

    RETURN v_alertas;
END;
$$;

-- 4. Permissions
GRANT SELECT ON vw_fnde_consolidado_escola TO authenticated;
GRANT EXECUTE ON FUNCTION fn_fnde_gerar_alertas_gerenciais(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_fnde_get_pnae_targets(TEXT) TO authenticated;

COMMENT ON VIEW vw_fnde_consolidado_escola IS 'Visão consolidada de indicadores nutricionais por unidade escolar e semana.';
COMMENT ON FUNCTION fn_fnde_gerar_alertas_gerenciais IS 'Motor de análise de tendências e riscos gerenciais baseado no histórico nutricional.';
