-- Adiciona suporte a imagens nas fichas técnicas (Opção A - IA)
ALTER TABLE fnde_preparacoes ADD COLUMN IF NOT EXISTS imagem_url TEXT;

COMMENT ON COLUMN fnde_preparacoes.imagem_url IS 'URL da imagem gerada por IA ou via upload manual para o relatório Nana Banana';
