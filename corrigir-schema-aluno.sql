-- Script SQL para corrigir e criar schema necessário para o fluxo do aluno

-- Adicionar campos necessários à tabela perfis_aluno
DO $$ 
BEGIN
  -- Adicionar xp_total se não existir
  BEGIN
    ALTER TABLE perfis_aluno ADD COLUMN xp_total INTEGER DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar ultima_triagem se não existir
  BEGIN
    ALTER TABLE perfis_aluno ADD COLUMN ultima_triagem TIMESTAMP;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Criar tabela progresso_aluno se não existir
CREATE TABLE IF NOT EXISTS progresso_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfis_aluno(id),
  missao_id UUID,
  tipo VARCHAR(20) DEFAULT 'missao',
  data_avaliacao TIMESTAMP DEFAULT NOW(),
  respostas JSONB,
  nivel_detectado INTEGER,
  areas_fortes TEXT[],
  areas_fracas TEXT[],
  status VARCHAR(20) DEFAULT 'pendente',
  resposta JSONB,
  feedback_ia TEXT,
  xp_ganho INTEGER DEFAULT 0,
  atualizadoEm TIMESTAMP DEFAULT NOW(),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Criar tabela trilhas se não existir
CREATE TABLE IF NOT EXISTS trilhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  disciplina VARCHAR(50),
  nivel INTEGER DEFAULT 1,
  aluno_id UUID REFERENCES perfis_aluno(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Adicionar campos necessários à tabela missoes
DO $$ 
BEGIN
  -- Adicionar área se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN area VARCHAR(50);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar dificuldade se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN dificuldade INTEGER DEFAULT 1;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar xp_reward se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN xp_reward INTEGER DEFAULT 50;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar tempo_estimado se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN tempo_estimado INTEGER DEFAULT 30;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar conteudo se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN conteudo JSONB;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar ordem se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN ordem INTEGER DEFAULT 1;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar ativa se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN ativa BOOLEAN DEFAULT true;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Adicionar trilha_id se não existir
  BEGIN
    ALTER TABLE missoes ADD COLUMN trilha_id UUID REFERENCES trilhas(id);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Criar tabela conquistas se não existir
CREATE TABLE IF NOT EXISTS conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  icone VARCHAR(10),
  criterio TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Criar tabela aluno_conquistas se não existir
CREATE TABLE IF NOT EXISTS aluno_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfis_aluno(id),
  conquista_id UUID REFERENCES conquistas(id),
  concedido_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(perfil_id, conquista_id)
);

-- Inserir conquistas básicas
INSERT INTO conquistas (nome, icone, criterio) VALUES
('Primeiro Passo', '🎯', 'Primeira missão concluída'),
('Explorador', '🗺️', '5 missões concluídas'),
('Aventureiro', '⚔️', '10 missões concluídas'),
('Mestre', '👑', '25 missões concluídas'),
('Iniciante', '⭐', 'Nível 2 alcançado'),
('Experiente', '🌟', 'Nível 5 alcançado'),
('Especialista', '💫', 'Nível 10 alcançado'),
('Colecionador de XP', '💎', '1000 XP acumulados')
ON CONFLICT (nome) DO NOTHING;

-- Inserir um aluno de teste se não existir
DO $$
DECLARE
  escola_id_var UUID;
  turma_id_var UUID;
  usuario_id_var UUID;
  perfil_id_var UUID;
  hashed_password TEXT := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; -- senha: password
BEGIN
  -- Buscar uma escola existente
  SELECT id INTO escola_id_var FROM escolas LIMIT 1;
  
  -- Buscar uma turma existente
  SELECT id INTO turma_id_var FROM turmas WHERE escola_id = escola_id_var LIMIT 1;
  
  -- Verificar se já existe usuário aluno de teste
  SELECT id INTO usuario_id_var FROM usuarios WHERE email = 'aluno@sabiarpg.edu.br';
  
  IF usuario_id_var IS NULL THEN
    -- Criar usuário aluno
    INSERT INTO usuarios (nome, email, senha, papel, criado_em)
    VALUES ('Aluno Teste', 'aluno@sabiarpg.edu.br', hashed_password, 'aluno', NOW())
    RETURNING id INTO usuario_id_var;
    
    RAISE NOTICE 'Usuário aluno criado: %', usuario_id_var;
  ELSE
    RAISE NOTICE 'Usuário aluno já existe: %', usuario_id_var;
  END IF;
  
  -- Verificar se já existe perfil do aluno
  SELECT id INTO perfil_id_var FROM perfis_aluno WHERE usuario_id = usuario_id_var;
  
  IF perfil_id_var IS NULL AND escola_id_var IS NOT NULL AND turma_id_var IS NOT NULL THEN
    -- Criar perfil do aluno
    INSERT INTO perfis_aluno (usuario_id, escola_id, turma_id, ano_serie, xp_total, nivel, criado_em)
    VALUES (usuario_id_var, escola_id_var, turma_id_var, '6º Ano', 0, 1, NOW())
    RETURNING id INTO perfil_id_var;
    
    RAISE NOTICE 'Perfil do aluno criado: %', perfil_id_var;
  ELSE
    RAISE NOTICE 'Perfil do aluno já existe ou dados incompletos';
  END IF;
  
END $$;