/**
 * Script para criar um aluno de teste completo
 * Vincula o aluno a uma escola e turma para testar o painel
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

async function criarAlunoTeste() {
  try {
    console.log('🎓 CRIANDO ALUNO DE TESTE...');
    
    // Primeiro, criar as tabelas necessárias se não existirem
    await criarTabelasNecessarias();
    
    // Buscar uma escola e turma existentes
    const escolaResult = await executeQuery(`
      SELECT id, nome FROM escolas LIMIT 1
    `);
    
    if (escolaResult.rows.length === 0) {
      throw new Error('Nenhuma escola encontrada. Crie uma escola primeiro.');
    }
    
    const escolaId = escolaResult.rows[0].id;
    const escolaNome = escolaResult.rows[0].nome;
    
    const turmaResult = await executeQuery(`
      SELECT id, nome FROM turmas WHERE escola_id = $1 LIMIT 1
    `, [escolaId]);
    
    if (turmaResult.rows.length === 0) {
      throw new Error('Nenhuma turma encontrada para esta escola. Crie uma turma primeiro.');
    }
    
    const turmaId = turmaResult.rows[0].id;
    const turmaNome = turmaResult.rows[0].nome;
    
    // Verificar se já existe um usuário aluno de teste
    const existingUser = await executeQuery(`
      SELECT id FROM usuarios WHERE email = 'aluno@sabiarpg.edu.br'
    `);
    
    let usuarioId;
    
    if (existingUser.rows.length > 0) {
      usuarioId = existingUser.rows[0].id;
      console.log('✅ Usuário aluno já existe:', usuarioId);
    } else {
      // Criar usuário aluno
      const hashedPassword = await bcrypt.hash('Senha@123', 10);
      
      const userResult = await executeQuery(`
        INSERT INTO usuarios (nome, email, senha, papel, ativo, criado_em)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, ['Aluno Teste', 'aluno@sabiarpg.edu.br', hashedPassword, 'aluno', true]);
      
      usuarioId = userResult.rows[0].id;
      console.log('✅ Usuário aluno criado:', usuarioId);
    }
    
    // Verificar se já existe perfil do aluno
    const existingProfile = await executeQuery(`
      SELECT id FROM perfis_aluno WHERE usuario_id = $1
    `, [usuarioId]);
    
    let perfilId;
    
    if (existingProfile.rows.length > 0) {
      perfilId = existingProfile.rows[0].id;
      console.log('✅ Perfil do aluno já existe:', perfilId);
      
      // Atualizar perfil com escola e turma
      await executeQuery(`
        UPDATE perfis_aluno 
        SET escola_id = $2, turma_id = $3, ano_serie = '6º Ano', ativo = true
        WHERE id = $1
      `, [perfilId, escolaId, turmaId]);
    } else {
      // Criar perfil do aluno
      const profileResult = await executeQuery(`
        INSERT INTO perfis_aluno (
          usuario_id, escola_id, turma_id, ano_serie, 
          xp_total, nivel, ativo, criado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [usuarioId, escolaId, turmaId, '6º Ano', 0, 1, true]);
      
      perfilId = profileResult.rows[0].id;
      console.log('✅ Perfil do aluno criado:', perfilId);
    }
    
    // Criar algumas conquistas básicas se não existirem
    await criarConquistasBasicas();
    
    console.log('\n🎯 ALUNO DE TESTE CRIADO COM SUCESSO!');
    console.log('=======================================');
    console.log(`👤 Nome: Aluno Teste`);
    console.log(`📧 Email: aluno@sabiarpg.edu.br`);
    console.log(`🔑 Senha: Senha@123`);
    console.log(`🏫 Escola: ${escolaNome}`);
    console.log(`🎓 Turma: ${turmaNome}`);
    console.log(`📊 XP: 0 | Nível: 1`);
    console.log('=======================================');
    
  } catch (error) {
    console.error('❌ Erro ao criar aluno de teste:', error);
    throw error;
  }
}

async function criarTabelasNecessarias() {
  try {
    console.log('🔧 Verificando e criando tabelas necessárias...');
    
    // Adicionar campos necessários à tabela progresso_aluno se não existirem
    await executeQuery(`
      DO $$ 
      BEGIN
        -- Adicionar campos para triagem diagnóstica
        BEGIN
          ALTER TABLE progresso_aluno ADD COLUMN tipo VARCHAR(20) DEFAULT 'missao';
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE progresso_aluno ADD COLUMN data_avaliacao TIMESTAMP DEFAULT NOW();
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE progresso_aluno ADD COLUMN nivel_detectado INTEGER;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE progresso_aluno ADD COLUMN areas_fortes TEXT[];
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE progresso_aluno ADD COLUMN areas_fracas TEXT[];
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        -- Adicionar campos à tabela perfis_aluno se não existirem
        BEGIN
          ALTER TABLE perfis_aluno ADD COLUMN ultima_triagem TIMESTAMP;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE perfis_aluno ADD COLUMN xp_total INTEGER DEFAULT 0;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        -- Adicionar campo aluno_id à tabela trilhas se não existir
        BEGIN
          ALTER TABLE trilhas ADD COLUMN aluno_id UUID REFERENCES perfis_aluno(id);
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        -- Adicionar campos à tabela missoes se não existirem
        BEGIN
          ALTER TABLE missoes ADD COLUMN area VARCHAR(50);
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN dificuldade INTEGER DEFAULT 1;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN xp_reward INTEGER DEFAULT 50;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN tempo_estimado INTEGER DEFAULT 30;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN conteudo JSONB;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN ordem INTEGER DEFAULT 1;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN ativa BOOLEAN DEFAULT true;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
      END $$;
    `);
    
    console.log('✅ Tabelas verificadas e atualizadas');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas necessárias:', error);
    throw error;
  }
}

async function criarConquistasBasicas() {
  try {
    console.log('🏆 Criando conquistas básicas...');
    
    const conquistas = [
      { nome: "Primeiro Passo", criterio: "Primeira missão concluída", icone: "🎯" },
      { nome: "Explorador", criterio: "5 missões concluídas", icone: "🗺️" },
      { nome: "Aventureiro", criterio: "10 missões concluídas", icone: "⚔️" },
      { nome: "Mestre", criterio: "25 missões concluídas", icone: "👑" },
      { nome: "Iniciante", criterio: "Nível 2 alcançado", icone: "⭐" },
      { nome: "Experiente", criterio: "Nível 5 alcançado", icone: "🌟" },
      { nome: "Especialista", criterio: "Nível 10 alcançado", icone: "💫" },
      { nome: "Colecionador de XP", criterio: "1000 XP acumulados", icone: "💎" }
    ];
    
    for (const conquista of conquistas) {
      await executeQuery(`
        INSERT INTO conquistas (nome, icone, criterio)
        VALUES ($1, $2, $3)
        ON CONFLICT (nome) DO NOTHING
      `, [conquista.nome, conquista.icone, conquista.criterio]);
    }
    
    console.log('✅ Conquistas básicas criadas');
  } catch (error) {
    console.error('❌ Erro ao criar conquistas básicas:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  criarAlunoTeste()
    .then(() => {
      console.log('✨ Script concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no script:', error);
      process.exit(1);
    });
}

export { criarAlunoTeste };