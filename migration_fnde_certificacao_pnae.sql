-- Migration: FNDE Certificação Automática "Selo Escola em Conformidade Nutricional"
-- Description: Automated engine for PNAE compliance certification and history.

-- 1. Table: fnde_certificacoes
-- Stores the history of certifications per school.
CREATE TABLE IF NOT EXISTS fnde_certificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id UUID NOT NULL REFERENCES schools(id),
    periodo_referencia DATE NOT NULL, -- First day of the month/bimonth
    status TEXT NOT NULL CHECK (status IN ('CERTIFICADA', 'MONITORAMENTO', 'NAO_CERTIFICADA')),
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validade_fim DATE NOT NULL,
    pontuacao_geral NUMERIC(5,2),
    detalhes JSONB, -- Criteria breakdown
    versao INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Function: fn_fnde_processar_certificacao_automatica
-- Automated engine to evaluate eligibility based on multiple system modules.
CREATE OR REPLACE FUNCTION fn_fnde_processar_certificacao_automatica(p_periodo_referencia DATE)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_escola RECORD;
    v_tem_alertas_graves BOOLEAN;
    v_tem_estoque_irregular BOOLEAN;
    v_tem_checklist_pendente BOOLEAN;
    v_status TEXT;
    v_pontuacao NUMERIC := 100;
BEGIN
    FOR v_escola IN SELECT id, nome FROM schools LOOP
        -- Criteria 1: No critical nutritional alerts in the period
        SELECT EXISTS (
            SELECT 1 FROM cardapio_tecnico 
            WHERE escola_id = v_escola.id 
            AND periodo_inicio >= p_periodo_referencia 
            AND periodo_inicio < (p_periodo_referencia + INTERVAL '1 month')
            AND alertas_tecnicos @> '[{"nivel": "CRITICO"}]'
        ) INTO v_tem_alertas_graves;

        -- Criteria 2: Sanitary checklist must be 'EM_DIA'
        SELECT NOT EXISTS (
            SELECT 1 FROM controles_sanitarios 
            WHERE escola_id = v_escola.id 
            AND data_realizacao >= (p_periodo_referencia - INTERVAL '60 days')
        ) INTO v_tem_checklist_pendente;

        -- Logic for Status
        IF v_tem_alertas_graves OR v_tem_checklist_pendente THEN
            v_status := 'NAO_CERTIFICADA';
            v_pontuacao := 50;
        ELSIF EXISTS (SELECT 1 FROM cardapio_tecnico WHERE escola_id = v_escola.id AND alertas_tecnicos @> '[{"nivel": "ATENCAO"}]') THEN
            v_status := 'MONITORAMENTO';
            v_pontuacao := 80;
        ELSE
            v_status := 'CERTIFICADA';
            v_pontuacao := 100;
        END IF;

        -- Insert or Update certification
        INSERT INTO fnde_certificacoes (escola_id, periodo_referencia, status, validade_fim, pontuacao_geral, detalhes)
        VALUES (
            v_escola.id, 
            p_periodo_referencia, 
            v_status, 
            (p_periodo_referencia + INTERVAL '2 months')::DATE,
            v_pontuacao,
            jsonb_build_object(
                'alertas_graves', v_tem_alertas_graves,
                'checklist_pendente', v_tem_checklist_pendente
            )
        )
        ON CONFLICT (escola_id, periodo_referencia) DO UPDATE 
        SET status = EXCLUDED.status, pontuacao_geral = EXCLUDED.pontuacao_geral, detalhes = EXCLUDED.detalhes;

    END LOOP;
END;
$$;

-- 3. View: vw_fnde_escolas_certificadas_public
-- Publicly visible list of certified schools.
CREATE OR REPLACE VIEW vw_fnde_escolas_certificadas_public AS
SELECT 
    s.nome as escola_nome,
    s.localidade as zona,
    c.status,
    c.data_emissao,
    c.validade_fim
FROM fnde_certificacoes c
JOIN schools s ON c.escola_id = s.id
WHERE c.status = 'CERTIFICADA'
AND c.validade_fim >= CURRENT_DATE;

-- 4. View: vw_fnde_ranking_evolucao_interna
-- Internal management view for positive trends.
CREATE OR REPLACE VIEW vw_fnde_ranking_evolucao_interna AS
SELECT 
    s.nome as escola_nome,
    s.localidade as zona,
    c.pontuacao_geral,
    c.status,
    LAG(c.pontuacao_geral) OVER (PARTITION BY c.escola_id ORDER BY c.periodo_referencia) as pontuacao_anterior,
    (c.pontuacao_geral - LAG(c.pontuacao_geral) OVER (PARTITION BY c.escola_id ORDER BY c.periodo_referencia)) as evolucao
FROM fnde_certificacoes c
JOIN schools s ON c.escola_id = s.id
ORDER BY evolucao DESC NULLS LAST;

-- 5. Indexes and Permissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificacao_escola_periodo ON fnde_certificacoes(escola_id, periodo_referencia);
GRANT SELECT ON vw_fnde_escolas_certificadas_public TO authenticated;
GRANT SELECT ON vw_fnde_ranking_evolucao_interna TO authenticated;

COMMENT ON TABLE fnde_certificacoes IS 'Registro histórico de certificações PNAE das unidades escolares.';
COMMENT ON VIEW vw_fnde_escolas_certificadas_public IS 'Painel público de transparência - Somente escolas com selo ativo.';
