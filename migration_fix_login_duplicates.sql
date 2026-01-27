-- PASSO 1: Remover usuários duplicados (mantendo o mais recente)
-- Isso evita que duas pessoas tenham o mesmo login
DELETE FROM profiles
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY login ORDER BY created_at DESC) as rnum
        FROM profiles
        WHERE login IS NOT NULL AND login <> ''
    ) t
    WHERE t.rnum > 1
);

-- PASSO 2: Adicionar restrição de UNICIDADE no Login
-- Isso impede que, no futuro, você crie dois usuários com o mesmo login
ALTER TABLE profiles ADD CONSTRAINT profiles_login_unique UNIQUE (login);
