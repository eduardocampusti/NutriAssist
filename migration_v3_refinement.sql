-- ==============================================================================
-- SISTEMA NUTRIASSIST SME - REFINAMENTO DE MODELO (V3.0)
-- Objetivo: Simplicidade, Auditoria e Rastreabilidade Relacional
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    perfil VARCHAR(50) CHECK (perfil IN ('nutricionista', 'secretaria', 'diretor', 'merendeira', 'tecnico')),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA: alimentos
CREATE TABLE IF NOT EXISTS alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    grupo_alimentar VARCHAR(100),
    classificacao_nova VARCHAR(50) CHECK (classificacao_nova IN ('in_natura', 'minimamente_processado', 'processado', 'ultraprocessado', 'ingrediente_culinario')),
    idade_minima INTEGER DEFAULT 0,
    idade_maxima INTEGER DEFAULT 999,
    status_normativo VARCHAR(50) CHECK (status_normativo IN ('permitido', 'restrito', 'proibido')),
    fundamentacao_legal TEXT,
    versao INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: cardapios
CREATE TABLE IF NOT EXISTS cardapios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ano_letivo INTEGER NOT NULL,
    periodo VARCHAR(50),
    modalidade VARCHAR(50),
    escola_id UUID, -- Referência à tabela de escolas (pode ser null se for rede geral)
    faixa_etaria VARCHAR(50),
    status VARCHAR(50) DEFAULT 'em_elaboracao',
    criado_por UUID REFERENCES usuarios(id),
    aprovado_por UUID REFERENCES usuarios(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_aprovacao TIMESTAMP WITH TIME ZONE
);

-- 5. TABELA: cardapio_itens
CREATE TABLE IF NOT EXISTS cardapio_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardapio_id UUID REFERENCES cardapios(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id),
    quantidade DECIMAL(10,3),
    porcao VARCHAR(50),
    observacao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA: alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardapio_id UUID REFERENCES cardapios(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id),
    tipo_alerta VARCHAR(50) CHECK (tipo_alerta IN ('informativo', 'restritivo', 'bloqueante')),
    descricao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA: justificativas
CREATE TABLE IF NOT EXISTS justificativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID REFERENCES alertas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA: documentos
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_documento VARCHAR(50),
    referencia_id UUID,
    arquivo TEXT, -- URL ou link para o storage
    data_geracao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- SEGURANÇA (RLS) E AUDITORIA
-- ==============================================================================

-- Habilitar RLS em todas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificativas ENABLE ROW LEVEL SECURITY;

-- Política MVP: Permitir tudo para usuários autenticados (Ajustar em produção)
DROP POLICY IF EXISTS "Acesso total autenticados" ON usuarios;
CREATE POLICY "Acesso total autenticados" ON usuarios FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acesso total autenticados" ON alimentos;
CREATE POLICY "Acesso total autenticados" ON alimentos FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acesso total autenticados" ON cardapios;
CREATE POLICY "Acesso total autenticados" ON cardapios FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acesso total autenticados" ON alertas;
CREATE POLICY "Acesso total autenticados" ON alertas FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acesso total autenticados" ON justificativas;
CREATE POLICY "Acesso total autenticados" ON justificativas FOR ALL USING (auth.role() = 'authenticated');
