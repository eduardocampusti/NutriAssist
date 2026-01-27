
-- Tabela de Avaliações Nutricionais
CREATE TABLE IF NOT EXISTS avaliacoes_nutricionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) NOT NULL,
    nutricionista_id UUID REFERENCES usuarios(id) NOT NULL,
    
    -- Antropometria
    peso DECIMAL(5,2) NOT NULL, -- kg
    estatura DECIMAL(3,2) NOT NULL, -- metros
    imc DECIMAL(5,2) NOT NULL,
    
    -- Classificações
    classificacao_imc VARCHAR(50) NOT NULL, -- SISVAN (MAGREZA, EUTROFIA, ETC)
    percentil_imc DECIMAL(5,2), -- Opcional se for calculado
    
    -- Diagnóstico e Parecer
    condicoes_clinicas TEXT[], -- Array de tags: ['ALERGIA', 'DIABETES']
    observacoes_clinicas TEXT,
    parecer_tecnico TEXT NOT NULL,
    recomendacoes TEXT,
    
    -- Metadados
    finalidade VARCHAR(50) NOT NULL, -- VIGILANCIA, NAE, ETC
    data_afericao DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE avaliacoes_nutricionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricionistas e Admin podem gerenciar avaliacoes" 
ON avaliacoes_nutricionais 
FOR ALL 
USING (auth.role() = 'authenticated'); -- Refinar em produção para checar perfil

-- Trigger de Auditoria
CREATE TRIGGER audit_avaliacoes
AFTER INSERT OR UPDATE OR DELETE ON avaliacoes_nutricionais
FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
