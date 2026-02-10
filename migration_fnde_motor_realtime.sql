-- Migration: FNDE Nutritional Engine v2 (Consolidated)
-- Description: Core logic for PNAE compliance calculation across School, Zone and Municipality levels.

-- 1. Helper Function: Calculate Nutrients for a Specific Dosage
-- Uses the 'fnde_alimentos_base' table created in previous steps.
CREATE OR REPLACE FUNCTION fn_fnde_calcular_item(
    p_alimento_id UUID,
    p_quantidade_g NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'kcal', ROUND((energia_kcal * p_quantidade_g / 100.0), 2),
        'carb', ROUND((carboidratos_g * p_quantidade_g / 100.0), 2),
        'prot', ROUND((proteinas_g * p_quantidade_g / 100.0), 2),
        'lip',  ROUND((lipidios_totais_g * p_quantidade_g / 100.0), 2),
        'fib',  ROUND((fibras_alimentares_g * p_quantidade_g / 100.0), 2),
        'sod',  ROUND((sodio_mg * p_quantidade_g / 100.0), 2),
        'cal',  ROUND((calcio_mg * p_quantidade_g / 100.0), 2),
        'fer',  ROUND((ferro_mg * p_quantidade_g / 100.0), 2)
    ) INTO v_result
    FROM fnde_alimentos_base
    WHERE id = p_alimento_id;

    RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$;

-- 2. View: Item-Level Calculation
-- Flattens all menu items into calculated nutritional values.
CREATE OR REPLACE VIEW vw_fnde_itens_calculados AS
SELECT 
    ci.id as item_id,
    ci.cardapio_id,
    ct.escola_id,
    s.zona_escolar,
    ab.nome_alimento,
    ci.quantidade_g as porcao_per_capita,
    (ab.energia_kcal * ci.quantidade_g / 100.0) as kcal,
    (ab.proteinas_g * ci.quantidade_g / 100.0) as proteinas,
    (ab.carboidratos_g * ci.quantidade_g / 100.0) as carboidratos,
    (ab.fibras_alimentares_g * ci.quantidade_g / 100.0) as fibras,
    (ab.sodio_mg * ci.quantidade_g / 100.0) as sodio,
    ab.is_ultraprocessado
FROM cardapio_itens ci
JOIN cardapio_tecnico ct ON ci.cardapio_id = ct.id
JOIN fnde_alimentos_base ab ON ci.alimento_id = ab.id
JOIN schools s ON ct.escola_id = s.id;

-- 3. View: School-Level Consolidation
-- Summarizes nutrition per menu plan/period per school.
CREATE OR REPLACE VIEW vw_fnde_consolidado_escola AS
SELECT 
    escola_id,
    zona_escolar,
    cardapio_id,
    COUNT(item_id) as total_itens,
    SUM(kcal) as total_energia,
    SUM(proteinas) as total_proteinas,
    SUM(sodio) as total_sodio,
    BOOL_OR(is_ultraprocessado) as contem_ultraprocessado,
    CASE 
        WHEN SUM(kcal) BETWEEN 300 AND 500 AND SUM(sodio) < 400 THEN 'ADEQUADO'
        WHEN SUM(kcal) > 500 OR SUM(sodio) > 400 THEN 'AJUSTE'
        ELSE 'ATENCAO'
    END as status_nutricional
FROM vw_fnde_itens_calculados
GROUP BY escola_id, zona_escolar, cardapio_id;

-- 4. View: Zone-Level Governance (Used by Secretary Dashboard)
-- Aggregates compliance by school zone.
CREATE OR REPLACE VIEW vw_fnde_saude_zona AS
SELECT 
    zona_escolar,
    COUNT(DISTINCT escola_id) as total_escolas_na_zona,
    COUNT(*) FILTER (WHERE status_nutricional = 'ADEQUADO') as escolas_adequadas,
    COUNT(*) FILTER (WHERE status_nutricional = 'ATENCAO') as escolas_atencao,
    COUNT(*) FILTER (WHERE status_nutricional = 'AJUSTE') as escolas_ajuste,
    ROUND((COUNT(*) FILTER (WHERE status_nutricional = 'ADEQUADO')::NUMERIC / COUNT(*)::NUMERIC) * 100, 1) as perc_conformidade_zona
FROM vw_fnde_consolidado_escola
GROUP BY zona_escolar;

-- 5. View: Municipal Global Consolidation
-- Single row with overall city performance.
CREATE OR REPLACE VIEW vw_fnde_consolidado_municipal AS
SELECT 
    COUNT(DISTINCT escola_id) as total_escolas_atendidas,
    AVG(perc_conformidade_zona) as media_conformidade_municipal,
    SUM(escolas_ajuste) as pontos_risco_sistemico
FROM vw_fnde_saude_zona;

-- Grant access
GRANT SELECT ON vw_fnde_itens_calculados TO authenticated;
GRANT SELECT ON vw_fnde_consolidado_escola TO authenticated;
GRANT SELECT ON vw_fnde_saude_zona TO authenticated;
GRANT SELECT ON vw_fnde_consolidado_municipal TO authenticated;
