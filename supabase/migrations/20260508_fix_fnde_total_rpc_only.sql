-- MIGRATION MÍNIMA: Restauração dos cálculos nutricionais (RPC Only)
-- Data: 2026-05-08
-- Objetivo: Corrigir o Total Acumulado zerado no relatório da Ficha Técnica.

-- 1. Função auxiliar: Calcular nutrientes por porção
CREATE OR REPLACE FUNCTION public.fnde_calcular_nutrientes_por_porcao(
    p_alimento_id UUID,
    p_quantidade_g NUMERIC
)
RETURNS TABLE (
    energia_kcal NUMERIC,
    proteina_g NUMERIC,
    lipidio_g NUMERIC,
    carboidrato_g NUMERIC,
    fibra_alimentar_g NUMERIC,
    sodio_mg NUMERIC,
    ferro_mg NUMERIC,
    zinco_mg NUMERIC,
    calcio_mg NUMERIC,
    magnesio_mg NUMERIC,
    rae_mcg NUMERIC,
    vitamina_c_mg NUMERIC,
    gordura_saturada_g NUMERIC,
    gordura_trans_mg NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_factor NUMERIC;
BEGIN
    v_factor := p_quantidade_g / 100.0;
    RETURN QUERY
    SELECT 
        ROUND(COALESCE(c.energia_kcal, 0) * v_factor, 2),
        ROUND(COALESCE(c.proteina_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.lipidio_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.carboidrato_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.fibra_alimentar_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.sodio_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.ferro_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.zinco_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.calcio_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.magnesio_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.rae_mcg, 0) * v_factor, 2),
        ROUND(COALESCE(c.vitamina_c_mg, 0) * v_factor, 2),
        ROUND(COALESCE(c.gordura_saturada_g, 0) * v_factor, 2),
        ROUND(COALESCE(c.gordura_trans_mg, 0) * v_factor, 2)
    FROM fnde_composicao_nutricional c
    WHERE c.alimento_id = p_alimento_id;
END;
$$;

-- 2. RPC: Somar nutrientes do cardápio (usado no preview)
CREATE OR REPLACE FUNCTION public.fnde_somar_nutrientes_cardapio(
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
SET search_path = public
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
        SELECT calc.* FROM lista_expandida l
        CROSS JOIN LATERAL fnde_calcular_nutrientes_por_porcao(l.ali_id, l.qtd) calc
    )
    SELECT 
        SUM(energia_kcal), 
        SUM(proteina_g), 
        SUM(carboidrato_g), 
        SUM(lipidio_g), 
        SUM(fibra_alimentar_g), 
        SUM(sodio_mg), 
        SUM(calcio_mg), 
        SUM(ferro_mg),
        SUM(gordura_saturada_g), 
        SUM(magnesio_mg), 
        SUM(zinco_mg),
        SUM(rae_mcg), 
        SUM(vitamina_c_mg), 
        SUM(gordura_trans_mg),
        COUNT(*)::INT
    FROM calculos_individuais;
END;
$$;

-- 3. RPC: Obter totais da preparação (usado no relatório)
CREATE OR REPLACE FUNCTION public.fnde_get_preparacao_nutrientes(p_preparacao_id UUID)
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
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH lista_ingredientes AS (
        SELECT alimento_id, quantidade_per_capita as quantidade_g
        FROM fnde_preparacao_ingredientes
        WHERE preparacao_id = p_preparacao_id
    ),
    calculos AS (
        SELECT calc.* FROM lista_ingredientes l
        CROSS JOIN LATERAL fnde_calcular_nutrientes_por_porcao(l.alimento_id, l.quantidade_g) calc
    )
    SELECT 
        SUM(c.energia_kcal), 
        SUM(c.proteina_g), 
        SUM(c.carboidrato_g), 
        SUM(c.lipidio_g),
        SUM(c.fibra_alimentar_g), 
        SUM(c.sodio_mg), 
        SUM(c.calcio_mg), 
        SUM(c.ferro_mg),
        SUM(c.gordura_saturada_g), 
        SUM(c.magnesio_mg), 
        SUM(c.zinco_mg),
        SUM(c.rae_mcg), 
        SUM(c.vitamina_c_mg), 
        SUM(c.gordura_trans_mg)
    FROM calculos c;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.fnde_calcular_nutrientes_por_porcao TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fnde_somar_nutrientes_cardapio TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fnde_get_preparacao_nutrientes TO anon, authenticated, service_role;
