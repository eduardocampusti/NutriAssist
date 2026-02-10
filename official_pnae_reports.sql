-- ==============================================================================
-- RELATÓRIOS OFICIAIS PNAE (CAE/FNDE)
-- Versão adaptada para o schema existente (escolas, inventory_movements)
-- ==============================================================================

-- 1. RELATÓRIO DE EXECUÇÃO OPERACIONAL
CREATE OR REPLACE VIEW v_report_operational_stats AS
SELECT 
    s.nome as escola,
    s.diretor,
    s.telefone,
    (SELECT COUNT(*) FROM inventory_movements im WHERE im.item_id IS NOT NULL) as total_movimentacoes_estoque -- Exemplo de uso de tabela existente
FROM escolas s;

-- 2. RELATÓRIO DE AUDITORIA DE ESTOQUE
CREATE OR REPLACE VIEW v_report_inventory_audit AS
SELECT 
    im.id as movimentacao_id,
    im.quantidade,
    im.tipo,
    im.created_at
FROM inventory_movements im;
