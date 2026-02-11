-- Migration: PNAE Expansion & Maranhão Report Parity
-- Description: Adds nutritional support for micronutrients and PNAE classifications.

-- 1. Expand fnde_preparacoes with classifications
ALTER TABLE fnde_preparacoes 
ADD COLUMN IF NOT EXISTS categoria_cardapio TEXT CHECK (categoria_cardapio IN ('CRECHE', 'ENSINO')),
ADD COLUMN IF NOT EXISTS etapa_ensino TEXT,
ADD COLUMN IF NOT EXISTS modalidade_ensino TEXT,
ADD COLUMN IF NOT EXISTS faixa_etaria TEXT;

-- 2. Expand fnde_composicao_nutricional with missing micronutrients
ALTER TABLE fnde_composicao_nutricional
ADD COLUMN IF NOT EXISTS gordura_saturada_g NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS magnesio_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS zinco_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamina_a_mcg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamina_c_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gordura_trans_mg NUMERIC DEFAULT 0;

-- 3. Add Correction Factor to fnde_alimentos
ALTER TABLE fnde_alimentos
ADD COLUMN IF NOT EXISTS fator_correcao NUMERIC DEFAULT 1.0;

-- 4. Update Engine: fnde_calcular_nutrientes_por_porcao
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
    ferro_mg NUMERIC,
    gordura_saturada_g NUMERIC,
    magnesio_mg NUMERIC,
    zinco_mg NUMERIC,
    vitamina_a_mcg NUMERIC,
    vitamina_c_mg NUMERIC,
    gordura_trans_mg NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_factor NUMERIC;
BEGIN
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
        ROUND(c.ferro_mg * v_factor, 2),
        ROUND(COALESCE(c.gordura_saturada_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.magnesio_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.zinco_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.vitamina_a_mcg, 0) * v_factor, 2),
        ROUND(COALESCE(c.vitamina_c_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.gordura_trans_mg, 0) * v_factor, 2)
    FROM fnde_composicao_nutricional c
    WHERE c.alimento_id = p_alimento_id;
END;
$$;

-- 5. Update Engine: fnde_somar_nutrientes_cardapio
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
    total_gordura_saturada_g NUMERIC,
    total_magnesio_mg NUMERIC,
    total_zinco_mg NUMERIC,
    total_vitamina_a_mcg NUMERIC,
    total_vitamina_c_mg NUMERIC,
    total_gordura_trans_mg NUMERIC,
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
        SUM(gordura_saturada_g),
        SUM(magnesio_mg),
        SUM(zinco_mg),
        SUM(vitamina_a_mcg),
        SUM(vitamina_c_mg),
        SUM(gordura_trans_mg),
        COUNT(*)::INT
    FROM calculos_individuais;
END;
$$;
-- 6. Expand cardapio_tecnico for 14 nutrients
ALTER TABLE cardapio_tecnico
ADD COLUMN IF NOT EXISTS total_gordura_saturada_g NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_magnesio_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_zinco_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_vitamina_a_mcg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_vitamina_c_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_gordura_trans_mg NUMERIC DEFAULT 0;

-- 7. Update fnde_get_preparacao_nutrientes for 14 nutrients
CREATE OR REPLACE FUNCTION fnde_get_preparacao_nutrientes(p_preparacao_id UUID)
RETURNS TABLE (
    energia_kcal NUMERIC,
    proteinas_g NUMERIC,
    carboidratos_g NUMERIC,
    lipidios_g NUMERIC,
    fibras_g NUMERIC,
    sodio_mg NUMERIC,
    calcio_mg NUMERIC,
    ferro_mg NUMERIC,
    gordura_saturada_g NUMERIC,
    magnesio_mg NUMERIC,
    zinco_mg NUMERIC,
    vitamina_a_mcg NUMERIC,
    vitamina_c_mg NUMERIC,
    gordura_trans_mg NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH lista_ingredientes AS (
        SELECT 
            alimento_id,
            quantidade_per_capita as quantidade_g
        FROM fnde_preparacao_ingredientes
        WHERE preparacao_id = p_preparacao_id
    ),
    calculos AS (
        SELECT 
            calc.*
        FROM lista_ingredientes l
        CROSS JOIN LATERAL fnde_calcular_nutrientes_por_porcao(l.alimento_id, l.quantidade_g) calc
    )
    SELECT 
        SUM(c.energia_kcal),
        SUM(c.proteinas_g),
        SUM(c.carboidratos_g),
        SUM(c.lipidios_g),
        SUM(c.fibras_g),
        SUM(c.sodio_mg),
        SUM(c.calcio_mg),
        SUM(c.ferro_mg),
        SUM(c.gordura_saturada_g),
        SUM(c.magnesio_mg),
        SUM(c.zinco_mg),
        SUM(c.vitamina_a_mcg),
        SUM(c.vitamina_c_mg),
        SUM(c.gordura_trans_mg)
    FROM calculos c;
END;
$$;
