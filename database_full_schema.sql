-- ==============================================================================
-- SISTEMA NUTRIASSIST SME - SCHEMA RELACIONAL ESTRITO (V2.0)
-- Conformidade Legal: PNAE (Lei 11.947/2009) e LGPD
-- ==============================================================================

-- 1. CONFIGURAÇÕES INICIAIS
-- Habilitar extensão para IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE USUÁRIOS (Central de Acesso)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    perfil VARCHAR(50) CHECK (perfil IN ('NUTRICIONISTA', 'SECRETARIO', 'DIRETOR', 'MERENDEIRA', 'TECNICO', 'ADMIN')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE ESCOLAS (Unidades Executoras)
CREATE TABLE IF NOT EXISTS escolas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    modalidades_atendidas TEXT[], -- Array ['CRECHE', 'PRE_ESCOLA', etc]
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ALUNOS (Cadastro Base)
CREATE TABLE IF NOT EXISTS alunos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    escola_id UUID REFERENCES escolas(id) NOT NULL,
    data_nascimento DATE NOT NULL,
    possui_nae BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. NECESSIDADES ALIMENTARES ESPECIAIS (NAE)
CREATE TABLE IF NOT EXISTS alunos_nae (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    tipo_restricao VARCHAR(50) NOT NULL, -- Ex: APLV, CELIACO, DIABETES
    descricao_clinica TEXT,
    laudo_medico_url TEXT,
    ano_referencia INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ALIMENTOS NORMATIVOS (Catálogo Mestre / Lei)
-- Define o que é o alimento tecnicamente, independente de marca ou estoque.
CREATE TABLE IF NOT EXISTS alimentos_normativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_alimento VARCHAR(255) NOT NULL,
    classificacao_nova VARCHAR(50) CHECK (classificacao_nova IN ('IN_NATURA', 'MINIMAMENTE_PROCESSADO', 'PROCESSADO', 'ULTRAPROCESSADO', 'INGREDIENTE_CULINARIO')),
    faixa_etaria_min_meses INTEGER DEFAULT 0,
    faixa_etaria_max_meses INTEGER DEFAULT 999,
    status_normativo VARCHAR(50) CHECK (status_normativo IN ('PERMITIDO', 'RESTRITO', 'PROIBIDO')),
    fundamentacao_legal TEXT, -- Ex: "Proibido < 3 anos conforme Resolução 06/2020"
    observacoes_tecnicas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CARDÁPIOS (Planejamento)
CREATE TABLE IF NOT EXISTS cardapios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES escolas(id), -- Null se for para Rede Geral
    modalidade VARCHAR(50) NOT NULL, -- Ex: CRECHE
    faixa_etaria_min_meses INTEGER,
    faixa_etaria_max_meses INTEGER,
    periodo VARCHAR(20) CHECK (periodo IN ('SEMANAL', 'MENSAL')),
    status VARCHAR(20) CHECK (status IN ('EM_ELABORACAO', 'ENVIADO', 'APROVADO')),
    nutricionista_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ITENS DO CARDÁPIO (Com Validação Legal)
CREATE TABLE IF NOT EXISTS cardapio_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardapio_id UUID REFERENCES cardapios(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos_normativos(id),
    tipo_refeicao VARCHAR(50) NOT NULL, -- ALMOCO, LANCHE
    quantidade DECIMAL(10,3) NOT NULL, -- Gramas por aluno
    status_validacao VARCHAR(20) CHECK (status_validacao IN ('PERMITIDO', 'RESTRITO', 'BLOQUEADO')),
    justificativa_restricao TEXT, -- Obrigatório se RESTRITO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ESTOQUE DE PRODUTOS (Físico)
-- Vincula o produto físico (marca, licitação) ao alimento normativo.
CREATE TABLE IF NOT EXISTS estoque_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_produto VARCHAR(255) NOT NULL, -- Ex: 'Arroz Tio João'
    unidade_medida VARCHAR(20) NOT NULL, -- KG, L, UN
    classificacao_nova VARCHAR(50), -- Redundante mas solicitado para performance? Ou vínculo?
    estoque_minimo DECIMAL(10,3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES estoque_produtos(id),
    escola_id UUID REFERENCES escolas(id),
    tipo VARCHAR(20) CHECK (tipo IN ('ENTRADA', 'SAIDA', 'PERDA')),
    quantidade DECIMAL(10,3) NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    justificativa TEXT
);

-- 11. LICITAÇÕES (Compras Públicas)
CREATE TABLE IF NOT EXISTS licitacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ano INTEGER NOT NULL,
    tipo_processo VARCHAR(50) CHECK (tipo_processo IN ('PREGAO', 'CHAMADA_PUBLICA', 'DISPENSA')),
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ITENS DA LICITAÇÃO (Vínculo Jurídico)
CREATE TABLE IF NOT EXISTS licitacao_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licitacao_id UUID REFERENCES licitacoes(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos_normativos(id),
    quantidade_anual DECIMAL(10,3) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. DOCUMENTOS GERADOS
CREATE TABLE IF NOT EXISTS documentos_gerados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_documento VARCHAR(50), -- TR, ETP, PARECER
    referencia_id UUID, -- ID da Licitação, Cardápio ou Aluno
    url_arquivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID, -- Pode ser null se sistema
    acao VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, APPROVE
    entidade VARCHAR(50) NOT NULL, -- Nome da Tabela
    entidade_id UUID,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacao TEXT
);

-- ==============================================================================
-- SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_normativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapios ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política Genérica: Apenas usuários autenticados vêm tudo (MVP Simplificado)
-- Em produção, refinaríamos por Escola Id.
CREATE POLICY "Permitir acesso total a usuarios autenticados" ON usuarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir leitura de escolas" ON escolas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir leitura de alimentos" ON alimentos_normativos FOR SELECT USING (auth.role() = 'authenticated');

-- ==============================================================================
-- AUTOMAÇÃO DE AUDITORIA (TRIGGERS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs_auditoria (
        usuario_id, 
        acao, 
        entidade, 
        entidade_id, 
        data_hora,
        observacao
    )
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        NOW(),
        'Auditoria Automática via Banco de Dados'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Trigger nas tabelas críticas
CREATE TRIGGER audit_cardapios
AFTER INSERT OR UPDATE OR DELETE ON cardapios
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_licitacoes
AFTER INSERT OR UPDATE OR DELETE ON licitacoes
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
