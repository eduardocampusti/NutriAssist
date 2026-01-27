-- MIGRATION: CORREÇÃO DE TABELAS E NOVOS CAMPOS
-- Executar no SQL Editor do Supabase

-- 1. Renomear tabela 'alunos' (legado) para 'students' (padrão novo)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alunos') THEN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
            ALTER TABLE alunos RENAME TO students;
            RAISE NOTICE 'Tabela "alunos" renomeada para "students".';
        ELSE
            RAISE NOTICE 'Tabela "students" já existe. Nenhuma ação de renomeação na tabela principal.';
        END IF;
    END IF;
END $$;

-- 2. Renomear tabela 'alunos_nae' (legado) para 'student_nutritional_needs'
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alunos_nae') THEN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_nutritional_needs') THEN
            ALTER TABLE alunos_nae RENAME TO student_nutritional_needs;
            RAISE NOTICE 'Tabela "alunos_nae" renomeada para "student_nutritional_needs".';
        ELSE
             RAISE NOTICE 'Tabela "student_nutritional_needs" já existe. Nenhuma ação de renomeação na tabela secundária.';
        END IF;
    END IF;
END $$;

-- 3. Adicionar as Colunas "dados_complementares" e "foto_url" na tabela students
--    Nota: Se o passo 1 funcionou, a tabela agora se chama 'students'.
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS dados_complementares JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 4. Comentários para documentação
COMMENT ON COLUMN students.dados_complementares IS 'Armazena dados complexos: endereço, responsáveis, histórico clínico, documentos';
COMMENT ON COLUMN students.foto_url IS 'URL pública da foto do aluno';

-- FIM DA MIGRAÇÃO
