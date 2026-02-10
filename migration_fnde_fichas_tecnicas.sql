-- Migration: Fichas Técnicas Digitais
-- Description: Structure for managing reusable technical sheets (preparations).

-- 1. Table: fnde_preparacoes
CREATE TABLE IF NOT EXISTS fnde_preparacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    modo_preparo TEXT,
    rendimento_porcoes INT DEFAULT 1,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: fnde_preparacao_ingredientes
CREATE TABLE IF NOT EXISTS fnde_preparacao_ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preparacao_id UUID REFERENCES fnde_preparacoes(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES fnde_alimentos(id),
    quantidade_per_capita NUMERIC NOT NULL, -- Grams
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE fnde_preparacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fnde_preparacao_ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricionistas e Admins podem gerenciar preparações"
ON fnde_preparacoes FOR ALL
TO authenticated
USING (true); -- Simplified for MVP, adjust to specific roles if needed

CREATE POLICY "Nutricionistas e Admins podem gerenciar ingredientes das preparações"
ON fnde_preparacao_ingredientes FOR ALL
TO authenticated
USING (true);

-- 4. Function: fnde_get_preparacao_nutrientes
-- Calculates total nutrition for a preparation based on its ingredients.
CREATE OR REPLACE FUNCTION fnde_get_preparacao_nutrientes(p_preparacao_id UUID)
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
        SUM(c.ferro_mg)
    FROM calculos c;
END;
$$;

GRANT EXECUTE ON FUNCTION fnde_get_preparacao_nutrientes(UUID) TO authenticated;
