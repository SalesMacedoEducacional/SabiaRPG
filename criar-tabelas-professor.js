import { Pool } from 'pg';

async function criarTabelasProfessor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 CRIANDO TABELAS DO PAINEL DO PROFESSOR...');
    
    // Criar tabela planos_aula
    await pool.query(`
      CREATE TABLE IF NOT EXISTS planos_aula (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        turma_componente_id UUID REFERENCES turma_componentes(id) ON DELETE CASCADE,
        trimestre TEXT NOT NULL CHECK (trimestre IN ('1º', '2º', '3º')),
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela planos_aula criada');
    
    // Criar tabela missoes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        turma_componente_id UUID REFERENCES turma_componentes(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        dificuldade INTEGER NOT NULL CHECK (dificuldade BETWEEN 1 AND 5),
        xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
        tempo_estimado INTEGER NOT NULL CHECK (tempo_estimado >= 5),
        ativa BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela missoes criada');
    
    // Criar índices para performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planos_aula_turma_componente ON planos_aula(turma_componente_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planos_aula_trimestre ON planos_aula(trimestre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_missoes_turma_componente ON missoes(turma_componente_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_missoes_ativa ON missoes(ativa);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_missoes_dificuldade ON missoes(dificuldade);`);
    console.log('✅ Índices de performance criados');
    
    // Verificar tabelas criadas
    const planos = await pool.query('SELECT COUNT(*) FROM planos_aula;');
    const missoes = await pool.query('SELECT COUNT(*) FROM missoes;');
    
    console.log(`📊 Planos de aula: ${planos.rows[0].count}`);
    console.log(`📊 Missões: ${missoes.rows[0].count}`);
    
    console.log('🎯 TABELAS DO PROFESSOR CRIADAS COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas do professor:', error);
  } finally {
    await pool.end();
  }
}

criarTabelasProfessor();