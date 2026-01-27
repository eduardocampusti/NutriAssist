-- MIGRATION: ADICIONAR COLUNA DE OBSERVAÇÕES NA TABELA SCHOOLS
-- Garante que a coluna 'observacoes' existe

ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

COMMENT ON COLUMN schools.observacoes IS 'Observações técnicas, de cozinha ou infraestrutura';

SELECT 'Coluna observacoes adicionada com sucesso!' as status;
