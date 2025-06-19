-- Criação da tabela de sessões para tracking de engajamento
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    iniciada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip TEXT,
    user_agent TEXT,
    ativa BOOLEAN DEFAULT true
);

-- Índices para performance nas consultas de engajamento
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_iniciada_em ON sessoes(iniciada_em);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativa ON sessoes(ativa);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_iniciada ON sessoes(usuario_id, iniciada_em);

-- Comentários para documentação
COMMENT ON TABLE sessoes IS 'Tabela para tracking de sessões de usuários e cálculo de engajamento';
COMMENT ON COLUMN sessoes.usuario_id IS 'ID do usuário que iniciou a sessão';
COMMENT ON COLUMN sessoes.iniciada_em IS 'Timestamp de quando a sessão foi iniciada';
COMMENT ON COLUMN sessoes.ativa IS 'Indica se a sessão ainda está ativa';