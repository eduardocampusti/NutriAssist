-- FUNÇÃO PARA GERENCIAR PERFIL DE USUÁRIO (RPC)
-- Necessária para que o UserContext funcione corretamente e permita a troca de senha/edição.

-- PRIMEIRO: Dropar a função antiga para evitar conflitos de assinatura/defaults
DROP FUNCTION IF EXISTS manage_user_profile(uuid,text,text,uuid,text,text,text,text,text,text,text,boolean,boolean,text,boolean,timestamptz);

CREATE OR REPLACE FUNCTION manage_user_profile(
    p_id UUID,
    p_nome TEXT,
    p_role TEXT,
    p_school_id UUID,
    p_cpf TEXT,
    p_crn TEXT,
    p_telefone TEXT,
    p_endereco TEXT,
    p_foto TEXT,
    p_login TEXT,
    p_senha TEXT,
    p_ativo BOOLEAN,
    p_bloqueado BOOLEAN,
    p_zona_id TEXT,
    p_senha_provisoria BOOLEAN,
    p_data_alteracao_senha TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET
        nome = COALESCE(p_nome, nome),
        role = COALESCE(p_role::user_role, role),
        school_id = p_school_id,
        cpf = p_cpf,
        crn = p_crn,
        telefone = p_telefone,
        endereco = p_endereco,
        foto = p_foto,
        login = COALESCE(p_login, login),
        -- Atualiza a senha no banco (metadata), a autenticação é via Supabase Auth
        senha = COALESCE(p_senha, senha),
        ativo = COALESCE(p_ativo, ativo),
        bloqueado = COALESCE(p_bloqueado, bloqueado),
        zona_id = p_zona_id,
        senha_provisoria = COALESCE(p_senha_provisoria, senha_provisoria),
        data_alteracao_senha = COALESCE(p_data_alteracao_senha, data_alteracao_senha)
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
