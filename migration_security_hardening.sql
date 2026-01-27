-- MIGRATION: SECURITY HARDENING (FIXED)
-- Description: Drops insecure RPCs and enforces RLS policies safely (checking if tables exist).
-- Author: Security Auditor Agent

-- 1. DROP VULNERABLE FUNCTIONS (Safe to run always)
DROP FUNCTION IF EXISTS check_user_credentials(text, text);

-- 2. DYNAMICALLY APPLY POLICIES
DO $$
BEGIN

    -------------------------------------------------------------------------
    -- TABLE: students
    -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'students') THEN
        
        -- Drop old policies if they exist
        DROP POLICY IF EXISTS "Auth Read" ON students;
        DROP POLICY IF EXISTS "Auth Write" ON students;
        DROP POLICY IF EXISTS "RBAC Read Students" ON students;
        DROP POLICY IF EXISTS "RBAC Write Students" ON students;

        -- Create READ policy
        EXECUTE 'CREATE POLICY "RBAC Read Students" ON students FOR SELECT TO authenticated USING (true)';

        -- Create WRITE policy (Admin/Nutri only)
        EXECUTE 'CREATE POLICY "RBAC Write Students" ON students FOR ALL TO authenticated USING (
            (auth.jwt() ->> ''user_metadata'')::jsonb ->> ''role'' IN (''ADMIN'', ''NUTRICIONISTA'') 
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''ADMIN'', ''NUTRICIONISTA''))
        )';
        
    END IF;

    -------------------------------------------------------------------------
    -- TABLE: student_nutritional_needs
    -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'student_nutritional_needs') THEN

        DROP POLICY IF EXISTS "Auth Read" ON student_nutritional_needs;
        DROP POLICY IF EXISTS "Auth Write" ON student_nutritional_needs;
        DROP POLICY IF EXISTS "RBAC Read NAE" ON student_nutritional_needs;
        DROP POLICY IF EXISTS "RBAC Write NAE" ON student_nutritional_needs;

        EXECUTE 'CREATE POLICY "RBAC Read NAE" ON student_nutritional_needs FOR SELECT TO authenticated USING (true)';
        
        EXECUTE 'CREATE POLICY "RBAC Write NAE" ON student_nutritional_needs FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''ADMIN'', ''NUTRICIONISTA''))
        )';

    END IF;

    -------------------------------------------------------------------------
    -- TABLE: menu_items
    -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'menu_items') THEN

        DROP POLICY IF EXISTS "Auth Read" ON menu_items;
        DROP POLICY IF EXISTS "Auth Write" ON menu_items;
        DROP POLICY IF EXISTS "RBAC Read Menu" ON menu_items;
        DROP POLICY IF EXISTS "RBAC Write Menu" ON menu_items;

        EXECUTE 'CREATE POLICY "RBAC Read Menu" ON menu_items FOR SELECT TO authenticated USING (true)';
        
        EXECUTE 'CREATE POLICY "RBAC Write Menu" ON menu_items FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''ADMIN'', ''NUTRICIONISTA''))
        )';

    END IF;

    -------------------------------------------------------------------------
    -- TABLE: audit_logs
    -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'audit_logs') THEN

        -- Drop potential restrictive policies to avoid conflicts before recreating
        DROP POLICY IF EXISTS "Immutable Audit Logs" ON audit_logs;
        DROP POLICY IF EXISTS "No Delete Audit Logs" ON audit_logs;
        DROP POLICY IF EXISTS "Auth Write" ON audit_logs;

        -- Deny Updates
        EXECUTE 'CREATE POLICY "Immutable Audit Logs" ON audit_logs FOR UPDATE TO authenticated USING (false)';
        
        -- Deny Deletes
        EXECUTE 'CREATE POLICY "No Delete Audit Logs" ON audit_logs FOR DELETE TO authenticated USING (false)';

    END IF;

END
$$;
