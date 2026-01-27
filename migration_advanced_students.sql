-- Migration: Advanced Student Data
-- Date: 2026-01-22
-- Description: Adds columns for rich student data (address, guardians, clinical) using JSONB.

-- 1. Add 'dados_complementares' (JSONB) for flexible schema (guardians, address, clinical_details)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS dados_complementares JSONB DEFAULT '{}'::jsonb;

-- 2. Add 'foto_url' for student profile picture
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 3. Update RLS to ensure these new columns are writable (existing policy "Auth Write" covers ALL columns usually, but good to verify)
-- (Existing policy: CREATE POLICY "Auth Write" ON students FOR ALL TO authenticated USING (true); -- Covers updates)

-- 4. Comment on columns for documentation
COMMENT ON COLUMN students.dados_complementares IS 'Stores structured data: address, guardians, clinical_history, documents meta-data';
COMMENT ON COLUMN students.foto_url IS 'Public URL or storage path for student photo';
