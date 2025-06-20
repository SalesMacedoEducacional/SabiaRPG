/**
 * Script para configurar banco de dados para o fluxo do aluno
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

async function setupAlunoDatabase() {
  try {
    console.log('🔧 CONFIGURANDO BANCO PARA FLUXO DO ALUNO...');
    
    // 1. Adicionar campos necessários à tabela perfis_aluno
    console.log('📊 Atualizando tabela perfis_aluno...');
    await executeQuery(`
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE perfis_aluno ADD COLUMN xp_total INTEGER DEFAULT 0;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        
        BEGIN
          ALTER TABLE perfis_aluno ADD COLUMN ultima_triagem TIMESTAMP;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
      END $$;
    `);
    
    // 2. Criar tabela progresso_aluno
    console.log('📈 Criando tabela progresso_aluno...');
    await executeQuery(`
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
    `);
    
    // 3. Criar tabela trilhas
    console.log('🛤️ Criando tabela trilhas...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS trilhas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        disciplina VARCHAR(50),
        nivel INTEGER DEFAULT 1,
        aluno_id UUID REFERENCES perfis_aluno(id),
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 4. Atualizar tabela missoes
    console.log('🎯 Atualizando tabela missoes...');
    await executeQuery(`
      DO $$ 
      BEGIN
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
        
        BEGIN
          ALTER TABLE missoes ADD COLUMN trilha_id UUID REFERENCES trilhas(id);
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
      END $$;
    `);
    
    // 5. Criar tabela conquistas
    console.log('🏆 Criando tabela conquistas...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS conquistas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(100) UNIQUE NOT NULL,
        icone VARCHAR(10),
        criterio TEXT,
        criado_em TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 6. Criar tabela aluno_conquistas
    console.log('🎖️ Criando tabela aluno_conquistas...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS aluno_conquistas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        perfil_id UUID REFERENCES perfis_aluno(id),
        conquista_id UUID REFERENCES conquistas(id),
        concedido_em TIMESTAMP DEFAULT NOW(),
        UNIQUE(perfil_id, conquista_id)
      );
    `);
    
    // 7. Inserir conquistas básicas
    console.log('🎯 Inserindo conquistas básicas...');
    const conquistas = [
      { nome: "Primeiro Passo", icone: "🎯", criterio: "Primeira missão concluída" },
      { nome: "Explorador", icone: "🗺️", criterio: "5 missões concluídas" },
      { nome: "Aventureiro", icone: "⚔️", criterio: "10 missões concluídas" },
      { nome: "Mestre", icone: "👑", criterio: "25 missões concluídas" },
      { nome: "Iniciante", icone: "⭐", criterio: "Nível 2 alcançado" },
      { nome: "Experiente", icone: "🌟", criterio: "Nível 5 alcançado" },
      { nome: "Especialista", icone: "💫", criterio: "Nível 10 alcançado" },
      { nome: "Colecionador de XP", icone: "💎", criterio: "1000 XP acumulados" }
    ];
    
    for (const conquista of conquistas) {
      await executeQuery(`
        INSERT INTO conquistas (nome, icone, criterio) 
        VALUES ($1, $2, $3) 
        ON CONFLICT DO NOTHING
      `, [conquista.nome, conquista.icone, conquista.criterio]);
    }
    
    // 8. Criar aluno de teste
    console.log('👤 Criando aluno de teste...');
    
    // Buscar escola existente
    const escolaResult = await executeQuery(`SELECT id, nome FROM escolas LIMIT 1`);
    if (escolaResult.rows.length === 0) {
      throw new Error('Nenhuma escola encontrada');
    }
    
    const escola = escolaResult.rows[0];
    
    // Buscar turma existente
    const turmaResult = await executeQuery(`SELECT id, nome FROM turmas WHERE escola_id = $1 LIMIT 1`, [escola.id]);
    if (turmaResult.rows.length === 0) {
      throw new Error('Nenhuma turma encontrada');
    }
    
    const turma = turmaResult.rows[0];
    
    // Verificar se usuário aluno já existe
    const existingUser = await executeQuery(`SELECT id FROM usuarios WHERE email = 'aluno@sabiarpg.edu.br'`);
    
    let usuarioId;
    if (existingUser.rows.length > 0) {
      usuarioId = existingUser.rows[0].id;
      console.log('✅ Usuário aluno já existe');
    } else {
      // Criar usuário aluno
      const hashedPassword = await bcrypt.hash('Senha@123', 10);
      const userResult = await executeQuery(`
        INSERT INTO usuarios (nome, email, senha, papel, criado_em)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id
      `, ['Aluno Teste', 'aluno@sabiarpg.edu.br', hashedPassword, 'aluno']);
      
      usuarioId = userResult.rows[0].id;
      console.log('✅ Usuário aluno criado');
    }
    
    // Verificar se perfil do aluno já existe
    const existingProfile = await executeQuery(`SELECT id FROM perfis_aluno WHERE usuario_id = $1`, [usuarioId]);
    
    if (existingProfile.rows.length > 0) {
      console.log('✅ Perfil do aluno já existe');
      
      // Atualizar perfil
      await executeQuery(`
        UPDATE perfis_aluno 
        SET escola_id = $2, turma_id = $3, xp_total = 0, nivel = 1
        WHERE usuario_id = $1
      `, [usuarioId, escola.id, turma.id]);
    } else {
      // Criar perfil do aluno
      await executeQuery(`
        INSERT INTO perfis_aluno (usuario_id, escola_id, turma_id, xp_total, nivel, criado_em)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [usuarioId, escola.id, turma.id, 0, 1]);
      
      console.log('✅ Perfil do aluno criado');
    }
    
    console.log('\n🎯 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=======================================');
    console.log(`👤 Aluno: Aluno Teste`);
    console.log(`📧 Email: aluno@sabiarpg.edu.br`);
    console.log(`🔑 Senha: Senha@123`);
    console.log(`🏫 Escola: ${escola.nome}`);
    console.log(`🎓 Turma: ${turma.nome}`);
    console.log('=======================================');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAlunoDatabase()
    .then(() => {
      console.log('✨ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro:', error);
      process.exit(1);
    });
}

export { setupAlunoDatabase };