-- MIGRATION: INSERIR ESCOLA PADRÃO (EMERGÊNCIA)
-- Execute se não consegue cadastrar escolas pela interface

INSERT INTO schools (
    id, 
    nome, 
    codigo_inep, 
    tipo_unidade, 
    localidade, 
    endereco, 
    municipio, 
    ativo, 
    created_at
) VALUES (
    uuid_generate_v4(), 
    'ESCOLA MUNICIPAL SEMENTE DO SABER (PADRÃO)', 
    '12345678', 
    'ESCOLA', 
    'URBANA', 
    'RUA PRINCIPAL, 100', 
    'BROTAS DE MACAÚBAS', 
    true, 
    now()
);

SELECT 'Escola Padrão Inserida com Sucesso!' as status;
