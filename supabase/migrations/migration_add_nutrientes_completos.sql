-- Migration: Adicionar nutrientes completos à tabela fnde_composicao_nutricional
-- Data: 2026-05-08
-- Descrição: Adiciona colunas faltantes e popula com dados da planilha FNDE oficial.

-- PASSO 1: Adicionar colunas
ALTER TABLE fnde_composicao_nutricional
ADD COLUMN IF NOT EXISTS gordura_saturada_g NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS magnesio_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS zinco_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamina_a_mcg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamina_c_mg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gordura_trans_mg NUMERIC DEFAULT 0;

-- PASSO 2: Atualizar registros cruzando com fnde_alimentos
-- Valores por 100g (TACO/FNDE)

UPDATE fnde_composicao_nutricional c
SET 
    gordura_saturada_g = CASE 
        WHEN a.descricao = 'Carne moída' THEN 4.38
        WHEN a.descricao = 'Farinha, de mandioca, torrada' THEN 0.07
        WHEN a.descricao = 'Alho, cru' THEN 0.04
        WHEN a.descricao = 'Pimentão, verde, cru' THEN 0.02
        WHEN a.descricao = 'Manteiga, com sal' THEN 51.37
        ELSE c.gordura_saturada_g
    END,
    vitamina_c_mg = CASE 
        WHEN a.descricao = 'Cebola, crua' THEN 4.67
        WHEN a.descricao = 'Pimentão, verde, cru' THEN 100.21
        WHEN a.descricao = 'Cheiro verde (50% cebolinha verde, 50% salsa), cru' THEN 50.1
        ELSE c.vitamina_c_mg
    END,
    vitamina_a_mcg = CASE 
        WHEN a.descricao = 'Pimentão, verde, cru' THEN 38
        WHEN a.descricao = 'Manteiga, com sal' THEN 754
        ELSE c.vitamina_a_mcg
    END
FROM fnde_alimentos a
WHERE c.alimento_id = a.id
AND a.descricao IN (
    'Carne moída',
    'Farinha, de mandioca, torrada',
    'Cebola, crua',
    'Alho, cru',
    'Pimentão, verde, cru',
    'Manteiga, com sal',
    'Cheiro verde (50% cebolinha verde, 50% salsa), cru'
);

-- PASSO 3: SELECT de conferência
SELECT 
    a.descricao,
    c.gordura_saturada_g,
    c.magnesio_mg,
    c.zinco_mg,
    c.vitamina_a_mcg,
    c.vitamina_c_mg,
    c.gordura_trans_mg
FROM fnde_composicao_nutricional c
JOIN fnde_alimentos a ON c.alimento_id = a.id
WHERE a.descricao IN (
    'Carne moída',
    'Farinha, de mandioca, torrada',
    'Cebola, crua',
    'Alho, cru',
    'Pimentão, verde, cru',
    'Manteiga, com sal',
    'Cheiro verde (50% cebolinha verde, 50% salsa), cru'
);
