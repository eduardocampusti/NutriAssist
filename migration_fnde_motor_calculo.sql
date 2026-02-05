-- Migration: FNDE Nutritional Calculation Engine
-- Description: Functions to calculate and aggregate nutrients from the FNDE database.

-- 1. Function: fnde_calcular_nutrientes_por_porcao
-- Calculates nutrients for a specific food item and quantity (g), scaled from 100g base.

CREATE OR REPLACE FUNCTION fnde_calcular_nutrientes_por_porcao(
    p_alimento_id UUID,
    p_quantidade_g NUMERIC
)
RETURNS TABLE (
    energia_kcal NUMERIC,
    proteinas_g NUMERIC,
    carboidratos_g NUMERIC,
    lipidios_g NUMERIC,
    fibras_g NUMERIC,
    sodio_mg NUMERIC,
    calcio_mg NUMERIC,
    ferro_mg NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_factor NUMERIC;
BEGIN
    -- Scale factor relative to 100g
    v_factor := p_quantidade_g / 100.0;

    RETURN QUERY
    SELECT 
        ROUND(c.energia_kcal * v_factor, 2),
        ROUND(c.proteinas_g * v_factor, 2),
        ROUND(c.carboidratos_g * v_factor, 2),
        ROUND(c.lipidios_g * v_factor, 2),
        ROUND(c.fibras_g * v_factor, 2),
        ROUND(c.sodio_mg * v_factor, 2),
        ROUND(c.calcio_mg * v_factor, 2),
        ROUND(c.ferro_mg * v_factor, 2)
    FROM fnde_composicao_nutricional c
    WHERE c.alimento_id = p_alimento_id;
END;
$$;

-- 2. Function: fnde_somar_nutrientes_cardapio
-- Aggregates nutrients for a list of food items and their respective quantities.
-- Expected input format: JSONB array of objects [{ "alimento_id": "...", "quantidade_g": 50 }, ...]

CREATE OR REPLACE FUNCTION fnde_somar_nutrientes_cardapio(
    p_lista_alimentos JSONB
)
RETURNS TABLE (
    total_energia_kcal NUMERIC,
    total_proteinas_g NUMERIC,
    total_carboidratos_g NUMERIC,
    total_lipidios_g NUMERIC,
    total_fibras_g NUMERIC,
    total_sodio_mg NUMERIC,
    total_calcio_mg NUMERIC,
    total_ferro_mg NUMERIC,
    itens_contados INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH lista_expandida AS (
        SELECT 
            (elem->>'alimento_id')::UUID as ali_id,
            (elem->>'quantidade_g')::NUMERIC as qtd
        FROM jsonb_array_elements(p_lista_alimentos) AS elem
    ),
    calculos_individuais AS (
        SELECT 
            calc.*
        FROM lista_expandida l
        CROSS JOIN LATERAL fnde_calcular_nutrientes_por_porcao(l.ali_id, l.qtd) calc
    )
    SELECT 
        SUM(energia_kcal),
        SUM(proteinas_g),
        SUM(carboidratos_g),
        SUM(lipidios_g),
        SUM(fibras_g),
        SUM(sodio_mg),
        SUM(calcio_mg),
        SUM(ferro_mg),
        COUNT(*)::INT
    FROM calculos_individuais;
END;
$$;

-- Grant permissions to authenticated users to execute these functions
GRANT EXECUTE ON FUNCTION fnde_calcular_nutrientes_por_porcao(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION fnde_somar_nutrientes_cardapio(JSONB) TO authenticated;

COMMENT ON FUNCTION fnde_calcular_nutrientes_por_porcao IS 'Calcula nutrientes escalados para uma gramatura específica baseada na tabela FNDE.';
COMMENT ON FUNCTION fnde_somar_nutrientes_cardapio IS 'Consolida o valor nutricional total de uma lista de alimentos FNDE.';
