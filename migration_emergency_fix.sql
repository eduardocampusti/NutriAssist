-- MIGRATION: CORREÇÃO DE EMERGÊNCIA - TABELAS DE ALUNOS
-- Executar no SQL Editor do Supabase se o script anterior falhou com erro "relation does not exist"

-- 1. Tentar renomear se existir (Segurança)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alunos') THEN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
            ALTER TABLE alunos RENAME TO students;
        END IF;
    END IF;
END $$;

-- 2. Garantir que a tabela STUDENTS exista (Criação do Zero se necessário)
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome text NOT NULL,
    escola_id uuid, -- Referência solta para não travar se escola não existir
    data_nascimento date,
    possui_nae boolean DEFAULT false,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 3. Garantir que as colunas novas existam (Idempotente)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS dados_complementares JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 4. Tentar renomear tabela secundária (Alunos NAE)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alunos_nae') THEN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_nutritional_needs') THEN
            ALTER TABLE alunos_nae RENAME TO student_nutritional_needs;
        END IF;
    END IF;
END $$;

-- 5. Garantir que a tabela STUDENTS NAE exista
CREATE TABLE IF NOT EXISTS student_nutritional_needs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id uuid REFERENCES students(id) ON DELETE CASCADE,
    tipo_restricao text,
    descricao_clinica text,
    laudo_medico_url text,
    observacoes text,
    ano_referencia integer,
    created_at timestamptz DEFAULT now()
);

-- 6. Garantir permissões básicas (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_nutritional_needs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Auth Do It All" ON students FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Auth Do It All NAE" ON student_nutritional_needs FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TABLE students IS 'Tabela oficial de alunos (Corrigida)';
