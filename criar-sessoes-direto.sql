-- Criar tabela de sessões para tracking de engajamento
CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  iniciada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalizada_em TIMESTAMP WITH TIME ZONE,
  ip TEXT,
  user_agent TEXT,
  ativa BOOLEAN DEFAULT true,
  duracao_minutos INTEGER
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_iniciada_em ON sessoes(iniciada_em);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativa ON sessoes(ativa);

-- Inserir algumas sessões de teste para demonstrar o sistema
INSERT INTO sessoes (usuario_id, iniciada_em, ip, user_agent, ativa) 
SELECT 
  u.id,
  NOW() - INTERVAL '2 days',
  '192.168.1.100',
  'Mozilla/5.0 Test Browser',
  false
FROM usuarios u 
WHERE u.papel = 'aluno' 
LIMIT 3;

INSERT INTO sessoes (usuario_id, iniciada_em, ip, user_agent, ativa) 
SELECT 
  u.id,
  NOW() - INTERVAL '5 hours',
  '192.168.1.101',
  'Chrome Test Browser',
  true
FROM usuarios u 
WHERE u.papel = 'aluno' 
LIMIT 2;