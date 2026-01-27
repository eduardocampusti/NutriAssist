-- Execute este script no Editor SQL do Supabase para atualizar a tabela de perfis

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crn text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foto text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS senha text;

-- Atualizar o cache do schema (necessário em alguns casos)
NOTIFY pgrst, 'reload config';
