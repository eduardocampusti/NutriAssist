
-- Tabela para Vigilância Preventiva
CREATE TABLE IF NOT EXISTS relatorios_preventivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_risco TEXT NOT NULL CHECK (tipo_risco IN ('ESTOQUE', 'CONSUMO', 'SIMULACAO', 'ZONA')),
    descricao TEXT NOT NULL,
    impacto_projetado TEXT,
    acoes_recomendadas TEXT,
    protocolo TEXT UNIQUE NOT NULL,
    data_geracao TIMESTAMPTZ DEFAULT NOW(),
    contexto_dados JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE relatorios_preventivos ENABLE ROW LEVEL SECURITY;

-- Políticas (Permissivas para permitir simulação e leitura pública autenticada)
CREATE POLICY "Permitir leitura para todos autenticados"
ON relatorios_preventivos FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Permitir inserção para todos autenticados e anon"
ON relatorios_preventivos FOR INSERT
TO authenticated, anon
WITH CHECK (true);
