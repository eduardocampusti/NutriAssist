-- Migration: FNDE Painel Executivo do Secretário
-- Description: Aggregated views and systemic risk analysis for municipal nutritional governance.

-- 1. View: vw_fnde_saude_zona
-- Analyzes nutritional health aggregated by zone, indicating trends.
CREATE OR REPLACE VIEW vw_fnde_saude_zona AS
WITH status_escolas AS (
    SELECT 
        escola_id,
        zona_escolar,
        semana_inicio,
        media_energia,
        media_sodio,
        CASE 
            WHEN media_energia < 400 OR media_sodio > 500 THEN 'AJUSTE'
            WHEN media_energia < 450 OR media_sodio > 400 THEN 'ATENCAO'
            ELSE 'ADEQUADO'
        END as status_nutricional
    FROM vw_fnde_consolidado_escola
    WHERE semana_inicio >= (CURRENT_DATE - INTERVAL '30 days')
)
SELECT 
    zona_escolar,
    COUNT(DISTINCT escola_id) as total_escolas_na_zona,
    COUNT(*) FILTER (WHERE status_nutricional = 'ADEQUADO') as escolas_adequadas,
    COUNT(*) FILTER (WHERE status_nutricional = 'ATENCAO') as escolas_atencao,
    COUNT(*) FILTER (WHERE status_nutricional = 'AJUSTE') as escolas_ajuste,
    ROUND((COUNT(*) FILTER (WHERE status_nutricional = 'ADEQUADO')::NUMERIC / COUNT(*)::NUMERIC) * 100, 1) as perc_conformidade_zona
FROM status_escolas
GROUP BY zona_escolar;

-- 2. Function: fn_fnde_gerar_alertas_executivos
-- Strategic alerts for municipal management regarding PNAE compliance.
CREATE OR REPLACE FUNCTION fn_fnde_gerar_alertas_executivos()
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_alertas JSONB := '[]'::JSONB;
    v_perc_municipal NUMERIC;
    v_zonas_criticas INT;
BEGIN
    -- Metric: Global Municipal Compliance
    SELECT AVG(perc_conformidade_zona) INTO v_perc_municipal FROM vw_fnde_saude_zona;

    IF v_perc_municipal < 80 THEN
        v_alertas := v_alertas || jsonb_build_object(
            'tipo', 'RISCO_SISTEMICO_MUNICIPAL', 
            'mensagem', 'Alerta de conformidade: O índice municipal de adequação nutricional está abaixo de 80%. Risco potencial em auditorias PNAE.',
            'nivel', 'CRITICO'
        );
    END IF;

    -- Metric: Critical Zones (Over 30% schools needing adjustment)
    SELECT COUNT(*) INTO v_zonas_criticas FROM vw_fnde_saude_zona WHERE escolas_ajuste > (total_escolas_na_zona * 0.3);

    IF v_zonas_criticas > 0 THEN
        v_alertas := v_alertas || jsonb_build_object(
            'tipo', 'PADRAO_RECORRENTE_ZONA', 
            'mensagem', 'Identificada vulnerabilidade em micro-regiões: ' || v_zonas_criticas || ' zona(s) apresentam alta recorrência de necessidade de ajuste menu.',
            'nivel', 'ATENCAO'
        );
    END IF;

    RETURN v_alertas;
END;
$$;

-- 3. Permissions
GRANT SELECT ON vw_fnde_saude_zona TO authenticated;
GRANT EXECUTE ON FUNCTION fn_fnde_gerar_alertas_executivos() TO authenticated;

COMMENT ON VIEW vw_fnde_saude_zona IS 'Saúde nutricional agregada por zona escolar para governança executiva.';
COMMENT ON FUNCTION fn_fnde_gerar_alertas_executivos IS 'Motor de análise estratégica para tomada de decisão da Secretaria de Educação.';
