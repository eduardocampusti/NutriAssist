-- MIGRATION: ADICIONAR COLUNAS DE ESTATÍSTICAS NA TABELA SCHOOLS
-- Garante que as colunas de alunos existem (padrão snake_case)

ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS num_alunos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS num_alunos_ne INTEGER DEFAULT 0;

COMMENT ON COLUMN schools.num_alunos IS 'Total de matrículas ativas';
COMMENT ON COLUMN schools.num_alunos_ne IS 'Total de alunos com necessidades especiais';

SELECT 'Colunas verificadas/adicionadas com sucesso!' as status;
