-- MIGRATION: Atualização das funções RPC para incluir novos nutrientes
-- Data: 2026-05-08
-- Descrição: Recalcula nutrientes de preparações e cardápios incluindo as novas colunas (gordura saturada, magnésio, zinco, etc.)

-- Função 1: Recalcula nutrientes de uma preparação salva
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
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM((c.energia_kcal * i.quantidade_per_capita) / 100),
        SUM((c.proteinas_g * i.quantidade_per_capita) / 100),
        SUM((c.carboidratos_g * i.quantidade_per_capita) / 100),
        SUM((c.lipidios_g * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.fibras_g, 0) * i.quantidade_per_capita) / 100),
        SUM((c.sodio_mg * i.quantidade_per_capita) / 100),
        SUM((c.calcio_mg * i.quantidade_per_capita) / 100),
        SUM((c.ferro_mg * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.gordura_saturada_g, 0) * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.magnesio_mg, 0) * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.zinco_mg, 0) * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.vitamina_a_mcg, 0) * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.vitamina_c_mg, 0) * i.quantidade_per_capita) / 100),
        SUM((COALESCE(c.gordura_trans_mg, 0) * i.quantidade_per_capita) / 100)
    FROM fnde_preparacao_ingredientes i
    JOIN fnde_composicao_nutricional c ON c.alimento_id = i.alimento_id
    WHERE i.preparacao_id = p_preparacao_id;
END;
$$ LANGUAGE plpgsql;

-- Função 2: Calcula preview em tempo real ao montar a ficha
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
    total_gordura_trans_mg NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM((c.energia_kcal * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.proteinas_g * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.carboidratos_g * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.lipidios_g * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.fibras_g, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.sodio_mg * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.calcio_mg * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((c.ferro_mg * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.gordura_saturada_g, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.magnesio_mg, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.zinco_mg, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.vitamina_a_mcg, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.vitamina_c_mg, 0) * (item->>'quantidade_g')::NUMERIC) / 100),
        SUM((COALESCE(c.gordura_trans_mg, 0) * (item->>'quantidade_g')::NUMERIC) / 100)
    FROM jsonb_array_elements(p_lista_alimentos) AS item
    JOIN fnde_composicao_nutricional c 
        ON c.alimento_id = (item->>'alimento_id')::UUID;
END;
$$ LANGUAGE plpgsql;

-- Permissões para execução via RPC
GRANT EXECUTE ON FUNCTION public.fnde_get_preparacao_nutrientes TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fnde_somar_nutrientes_cardapio TO anon, authenticated, service_role;
