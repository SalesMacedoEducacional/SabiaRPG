-- Índices compostos para máxima performance nas consultas de contagem
-- Essas otimizações reduzirão drasticamente o tempo de resposta dos cards

-- Índice para consultas de usuários por escola, papel e status ativo
CREATE INDEX IF NOT EXISTS idx_usuarios_escola_papel_ativo
  ON public.usuarios(escola_id, papel, ativo)
  WHERE escola_id IS NOT NULL AND papel IS NOT NULL AND ativo IS NOT NULL;

-- Índice para turmas por escola e status ativo
CREATE INDEX IF NOT EXISTS idx_turmas_escola_ativo
  ON public.turmas(escola_id, ativo)
  WHERE escola_id IS NOT NULL AND ativo IS NOT NULL;

-- Índice para perfis de aluno por turma (para JOIN rápido)
CREATE INDEX IF NOT EXISTS idx_perfis_aluno_turma
  ON public.perfis_aluno(turma_id)
  WHERE turma_id IS NOT NULL;

-- Índice para perfis de professor por escola (para contagem rápida)
CREATE INDEX IF NOT EXISTS idx_perfis_professor_escola
  ON public.perfis_professor(escola_id)
  WHERE escola_id IS NOT NULL;

-- Índice para consultas por gestor_id nas escolas
CREATE INDEX IF NOT EXISTS idx_escolas_gestor_id
  ON public.escolas(gestor_id)
  WHERE gestor_id IS NOT NULL;

-- Análise das tabelas para otimizar o plano de consulta
ANALYZE public.usuarios;
ANALYZE public.turmas;
ANALYZE public.perfis_aluno;
ANALYZE public.perfis_professor;
ANALYZE public.escolas;

-- Verificar se os índices foram criados corretamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('usuarios', 'turmas', 'perfis_aluno', 'perfis_professor', 'escolas')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;