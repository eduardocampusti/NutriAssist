-- Função segura para CRIAR ou ATUALIZAR usuários (Upsert)
-- Necessária porque o admin local não tem sessão autenticada no Supabase para passar pelo RLS
-- SECURITY DEFINER permite que a função execute com privilégios de admin do banco

CREATE OR REPLACE FUNCTION manage_user_profile(
    p_id uuid,
    p_nome text,
    p_role text, -- Recebe como text e converte
    p_school_id uuid,
    p_cpf text,
    p_crn text,
    p_telefone text,
    p_endereco text,
    p_foto text,
    p_login text,
    p_senha text,
    p_ativo boolean,
    p_bloqueado boolean
)
RETURNS json AS $$
DECLARE
    v_role user_role;
    result json;
BEGIN
    -- Cast do role
    BEGIN
        v_role := p_role::user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'VISUALIZADOR'; -- Fallback
    END;

    -- Upsert (Insert ou Update se conflitar no ID)
    INSERT INTO profiles (
        id, nome, role, school_id, cpf, crn, telefone, endereco, foto, login, senha, ativo, bloqueado
    ) VALUES (
        p_id, p_nome, v_role, p_school_id, p_cpf, p_crn, p_telefone, p_endereco, p_foto, p_login, p_senha, p_ativo, p_bloqueado
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        role = EXCLUDED.role,
        school_id = EXCLUDED.school_id,
        cpf = EXCLUDED.cpf,
        crn = EXCLUDED.crn,
        telefone = EXCLUDED.telefone,
        endereco = EXCLUDED.endereco,
        foto = EXCLUDED.foto,
        login = EXCLUDED.login,
        senha = EXCLUDED.senha,
        ativo = EXCLUDED.ativo,
        bloqueado = EXCLUDED.bloqueado;

    SELECT row_to_json(p) INTO result FROM profiles p WHERE id = p_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
