-- Remove a restrição que obriga todo perfil a ter um usuário no auth.users
-- Isso permite criar usuários apenas na tabela de perfis (para o sistema customizado)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
