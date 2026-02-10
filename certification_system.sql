-- ==============================================================================
-- SISTEMA DE CERTIFICAÇÃO NUTRICIONAL PNAE (SELOS DE QUALIDADE)
-- Versão adaptada para o schema existente: escolas, cardapios, inventory_movements
-- ==============================================================================

-- 1. TABELA DE PONTUAÇÕES ANUAIS
CREATE TABLE IF NOT EXISTS certification_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
    ano_referencia INTEGER NOT NULL,
    score_alimentos NUMERIC(5,2) DEFAULT 0,
    score_agricultura NUMERIC(5,2) DEFAULT 0,
    score_monitoramento NUMERIC(5,2) DEFAULT 0,
    score_capacitacao NUMERIC(5,2) DEFAULT 0,
    total_score NUMERIC(5,2) DEFAULT 0,
    nivel_concedido VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, ano_referencia)
);

-- 2. VIEW DE PERFORMANCE ATUAL
-- Nota: Adaptada para evitar tabelas inexistentes (purchases, licitacoes)
CREATE OR REPLACE VIEW v_school_current_performance AS
SELECT 
    s.id as school_id,
    s.nome as escola_nome,
    0 as score_alimentos, -- Requer mapeamento de itens do cardápio
    0 as score_agricultura, -- Requer tabela de compras/licitações
    0 as score_monitoramento,
    0 as score_capacitacao,
    0 as total_weighted_score
FROM escolas s;

-- 3. INTERFACE DE RANKING
CREATE OR REPLACE VIEW v_nutritional_certification_ranking AS
SELECT 
    escola_nome,
    total_weighted_score,
    'EM_EVOLUCAO' as selo_nutricional
FROM v_school_current_performance;
