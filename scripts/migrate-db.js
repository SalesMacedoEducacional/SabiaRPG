/**
 * Script para migrar o banco de dados usando pg diretamente
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('Iniciando migração de banco de dados com pg...');

  // Verificar se DATABASE_URL está definido
  if (!process.env.DATABASE_URL) {
    console.error('Erro: variável de ambiente DATABASE_URL não definida');
    return false;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Executando migrations...');
    
    // Verificar tabelas existentes
    console.log('Verificando tabelas existentes...');
    const tableCheck = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tables = tableCheck.rows.map(row => row.tablename);
    console.log('Tabelas encontradas:', tables);

    console.log('Criando tabela turmas...');
    // SQL para criar as novas tabelas em partes separadas
    await pool.query(`
      -- Criação da tabela turmas se não existir
      CREATE TABLE IF NOT EXISTS turmas (
        id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome            text        NOT NULL,
        ano_letivo      text        NOT NULL,
        turno           text        NOT NULL,
        modalidade      text        NOT NULL,
        serie           text        NOT NULL,
        descricao       text,
        escola_id       uuid        REFERENCES escolas(id) ON DELETE CASCADE,
        criado_em       timestamp   DEFAULT now(),
        ativo           boolean     DEFAULT true
      );
    `);
    
    console.log('Criando tabela componentes...');
    await pool.query(`
      -- Criação da tabela componentes se não existir
      CREATE TABLE IF NOT EXISTS componentes (
        id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome            text        NOT NULL,
        turma_id        uuid        REFERENCES turmas(id) ON DELETE CASCADE,
        professor_id    uuid        REFERENCES usuarios(id),
        criado_em       timestamp   DEFAULT now(),
        ativo           boolean     DEFAULT true
      );
    `);
    
    // Verificar se a tabela 'matriculas' existe
    if (tables.includes('matriculas')) {
      console.log('Atualizando tabela matriculas...');
      await pool.query(`
        -- Atualização da tabela matriculas para incluir turma_id
        ALTER TABLE matriculas 
        ADD COLUMN IF NOT EXISTS turma_id uuid REFERENCES turmas(id),
        ADD COLUMN IF NOT EXISTS data_nascimento timestamp,
        ADD COLUMN IF NOT EXISTS email_opicional text,
        ADD COLUMN IF NOT EXISTS telefone_opicional text,
        ADD COLUMN IF NOT EXISTS status_matricula text DEFAULT 'Ativa';
      `);
    } else {
      console.log('Tabela matriculas não existe. Será criada quando necessário.');
    }
    
    // Verificar se a tabela 'usuarios' existe
    if (tables.includes('usuarios')) {
      console.log('Atualizando tabela usuarios...');
      await pool.query(`
        -- Atualização da tabela usuarios para incluir novos campos
        ALTER TABLE usuarios 
        ADD COLUMN IF NOT EXISTS nome text,
        ADD COLUMN IF NOT EXISTS telefone text,
        ADD COLUMN IF NOT EXISTS data_nascimento timestamp,
        ADD COLUMN IF NOT EXISTS perfil_foto_url text;
      `);
    } else {
      console.log('Tabela usuarios não existe. Será criada quando necessário.');
    }

    console.log('Migração concluída com sucesso!');
    await pool.end();
    return true;
  } catch (error) {
    console.error('Erro durante a migração:', error);
    await pool.end();
    return false;
  }
}

runMigration()
  .then(success => {
    if (success) {
      console.log('Processo de migração completado com sucesso.');
      process.exit(0);
    } else {
      console.error('Processo de migração falhou.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro inesperado durante migração:', error);
    process.exit(1);
  });