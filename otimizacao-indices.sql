-- Índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_usuarios_papel_escola ON usuarios(papel, escola_id);
CREATE INDEX IF NOT EXISTS idx_turmas_escola_ativo ON turmas(escola_id, ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_aluno_turma ON perfis_aluno(turma_id);
CREATE INDEX IF NOT EXISTS idx_perfis_professor_escola ON perfis_professor(escola_id);
CREATE INDEX IF NOT EXISTS idx_escolas_gestor ON escolas(gestor_id);

-- View materializada para dashboard ultra-rápido
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_gestor AS
SELECT 
  e.gestor_id,
  COUNT(DISTINCT e.id) as total_escolas,
  COUNT(DISTINCT pp.usuario_id) as total_professores,
  COUNT(DISTINCT pa.usuario_id) as total_alunos,
  COUNT(DISTINCT t.id) as total_turmas,
  json_agg(DISTINCT jsonb_build_object(
    'id', e.id,
    'nome', e.nome,
    'cidade', e.cidade,
    'estado', e.estado
  )) as escolas
FROM escolas e
LEFT JOIN perfis_professor pp ON pp.escola_id = e.id
LEFT JOIN turmas t ON t.escola_id = e.id
LEFT JOIN perfis_aluno pa ON pa.turma_id = t.id
GROUP BY e.gestor_id;

-- Função para refresh automático
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_dashboard_gestor;
END;
$$ LANGUAGE plpgsql;