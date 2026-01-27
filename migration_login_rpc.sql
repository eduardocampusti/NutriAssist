-- Função segura para verificar credenciais e retornar o usuário
-- Isso permite o login sem expor a tabela 'profiles' inteira para leitura pública
CREATE OR REPLACE FUNCTION check_user_credentials(p_login text, p_senha text)
RETURNS json AS $$
DECLARE
  user_data json;
BEGIN
  SELECT row_to_json(p) INTO user_data
  FROM profiles p
  WHERE p.login = p_login AND p.senha = p_senha
  LIMIT 1;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
