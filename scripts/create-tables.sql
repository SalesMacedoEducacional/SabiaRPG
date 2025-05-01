-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(100) NOT NULL,
  perfil VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de matrículas
CREATE TABLE IF NOT EXISTS matriculas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  curso_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativa',
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  progresso INTEGER DEFAULT 0,
  nota DECIMAL(4,2)
);

-- Inserir dados de exemplo
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES 
  ('João Silva', 'joao@example.com', 'senha_criptografada', 'estudante'),
  ('Maria Professora', 'maria@example.com', 'senha_criptografada', 'professor');

INSERT INTO matriculas (usuario_id, curso_id, status, progresso)
VALUES
  (1, 101, 'ativa', 35),
  (2, 102, 'ativa', 75);