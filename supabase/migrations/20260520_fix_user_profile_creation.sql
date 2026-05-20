-- Ensure NutriAssist user creation has a single canonical profile target.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS zona_id text,
  ADD COLUMN IF NOT EXISTS senha_provisoria boolean,
  ADD COLUMN IF NOT EXISTS data_alteracao_senha timestamptz;

ALTER TABLE public.profiles
  ALTER COLUMN status SET DEFAULT 'ATIVO',
  ALTER COLUMN senha_provisoria SET DEFAULT false;

UPDATE public.profiles
SET
  status = CASE
    WHEN bloqueado IS TRUE THEN 'BLOQUEADO'
    WHEN ativo IS FALSE THEN 'INATIVO'
    ELSE 'ATIVO'
  END,
  email = COALESCE(email, login)
WHERE status IS NULL
   OR email IS NULL;

UPDATE public.profiles
SET senha_provisoria = false
WHERE senha_provisoria IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN senha_provisoria SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('ATIVO', 'INATIVO', 'BLOQUEADO'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
