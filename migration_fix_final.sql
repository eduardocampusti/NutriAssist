-- MIGRATION: CORREÇÃO FINAL DE PERMISSÕES E ESTRUTURA
-- Execute este script no SQL Editor do Supabase para destravar o salvamento.

-- 1. Garantir que a tabela STUDENTS existe e tem as colunas
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome text NOT NULL,
    escola_id uuid,
    data_nascimento date,
    possui_nae boolean DEFAULT false,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS dados_complementares JSONB DEFAULT '{}'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Limpar Políticas de Segurança Antigas (para evitar conflitos)
DROP POLICY IF EXISTS "Auth Do It All" ON students;
DROP POLICY IF EXISTS "Auth Write" ON students;
DROP POLICY IF EXISTS "Auth Read" ON students;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON students;

-- 3. Criar Política Permissiva (Autenticados podem ler/criar/editar)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Politica de Acesso Geral" ON students
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Garantir permissões de GRANT (caso o usuário postgres/anon não tenha)
GRANT ALL ON TABLE students TO authenticated;
GRANT ALL ON TABLE students TO service_role;

-- 5. Repetir para Tabela de Necessidades (Student Nutritional Needs)
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

DROP POLICY IF EXISTS "Auth Do It All NAE" ON student_nutritional_needs;
DROP POLICY IF EXISTS "Politica de Acesso Geral NAE" ON student_nutritional_needs;

CREATE POLICY "Politica de Acesso Geral NAE" ON student_nutritional_needs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE student_nutritional_needs TO authenticated;
GRANT ALL ON TABLE student_nutritional_needs TO service_role;

-- 6. Mensagem de Sucesso
SELECT 'Correção aplicada com sucesso! Tente salvar o aluno novamente.' as status;
