-- ==============================================================================
-- MÓDULO DE DISTRIBUIÇÃO E RECEBIMENTO DIGITAL
-- ==============================================================================

-- 1. TABELA PRINCIPAL DE DISTRIBUIÇÕES (ORDENS DE DISTRIBUIÇÃO - OD)
CREATE TABLE IF NOT EXISTS distribuicoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escola_id UUID REFERENCES escolas(id) NOT NULL,
    cardapio_id UUID REFERENCES cardapios(id), -- Opcional: Vínculo com cardápio planejado
    status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO')),
    
    -- Dados de Saída (Secretaria/Logística)
    data_envio TIMESTAMP WITH TIME ZONE,
    responsavel_logistica_id UUID REFERENCES usuarios(id),
    motorista VARCHAR(255),
    placa_veiculo VARCHAR(20),
    
    -- Dados de Entrada (Escola)
    data_recebimento TIMESTAMP WITH TIME ZONE,
    responsavel_recebimento_id UUID REFERENCES usuarios(id),
    observacoes_recebimento TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ITENS DA DISTRIBUIÇÃO
CREATE TABLE IF NOT EXISTS distribuicao_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distribuicao_id UUID REFERENCES distribuicoes(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES estoque_produtos(id) NOT NULL,
    batch_id UUID, -- Referência ao lote ( estoque_lotes/InventoryBatch se existir no DB)
    quantidade_enviada DECIMAL(10,3) NOT NULL,
    quantidade_recebida DECIMAL(10,3), -- Confirmada pela escola
    observacao_item TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SEGURANÇA (RLS)
ALTER TABLE distribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribuicao_itens ENABLE ROW LEVEL SECURITY;

-- Políticas: 
-- 1. Todos os perfis administrativos (Secretaria, Nutri, Admin) veem tudo.
-- 2. Diretores e Merendeiras veem apenas o que é destinado à sua escola.

CREATE POLICY "Admin/Secretaria veem todas as distribuicoes" 
ON distribuicoes FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND perfil IN ('ADMIN', 'SECRETARIO', 'NUTRICIONISTA', 'TECNICO')
    )
);

CREATE POLICY "Escolas veem suas proprias distribuicoes" 
ON distribuicoes FOR SELECT 
USING (
    escola_id IN (
        SELECT school_id FROM usuarios WHERE id = auth.uid()
    )
);

-- Permissão para a escola confirmar o recebimento (Update limitado)
CREATE POLICY "Escolas confirmam recebimento" 
ON distribuicoes FOR UPDATE
USING (
    escola_id IN (
        SELECT school_id FROM usuarios WHERE id = auth.uid()
    )
    AND status = 'EM_TRANSITO'
)
WITH CHECK (
    status = 'ENTREGUE'
);

-- Itens seguem a visibilidade da distribuição pai
CREATE POLICY "Visibilidade de itens segue distribuicao" 
ON distribuicao_itens FOR SELECT 
USING (
    distribuicao_id IN (
        SELECT id FROM distribuicoes
    )
);

-- 4. LOGS DE AUDITORIA
CREATE TRIGGER audit_distribuicoes
AFTER INSERT OR UPDATE OR DELETE ON distribuicoes
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
