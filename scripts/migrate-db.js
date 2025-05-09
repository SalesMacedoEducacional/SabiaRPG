/**
 * Script para migrar o banco de dados usando drizzle-orm diretamente
 * em vez de uma função RPC no Supabase
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('Iniciando migração de banco de dados com drizzle-orm...');

  // Verificar se DATABASE_URL está definido
  if (!process.env.DATABASE_URL) {
    console.error('Erro: variável de ambiente DATABASE_URL não definida');
    return false;
  }

  try {
    // Conectar ao banco de dados PostgreSQL
    const sql = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(sql);

    console.log('Executando migrations...');
    
    // Executar migrations
    await db.execute({
      sql: `
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
        
        -- Criação da tabela componentes se não existir
        CREATE TABLE IF NOT EXISTS componentes (
          id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome            text        NOT NULL,
          turma_id        uuid        REFERENCES turmas(id) ON DELETE CASCADE,
          professor_id    uuid        REFERENCES usuarios(id),
          criado_em       timestamp   DEFAULT now(),
          ativo           boolean     DEFAULT true
        );
        
        -- Atualização da tabela matriculas para incluir turma_id
        ALTER TABLE matriculas 
        ADD COLUMN IF NOT EXISTS turma_id uuid REFERENCES turmas(id),
        ADD COLUMN IF NOT EXISTS data_nascimento timestamp,
        ADD COLUMN IF NOT EXISTS email_opicional text,
        ADD COLUMN IF NOT EXISTS telefone_opicional text,
        ADD COLUMN IF NOT EXISTS status_matricula text DEFAULT 'Ativa';
        
        -- Atualização da tabela usuarios para incluir novos campos
        ALTER TABLE usuarios 
        ADD COLUMN IF NOT EXISTS nome text,
        ADD COLUMN IF NOT EXISTS telefone text,
        ADD COLUMN IF NOT EXISTS data_nascimento timestamp,
        ADD COLUMN IF NOT EXISTS perfil_foto_url text;
      `
    });

    console.log('Migração concluída com sucesso!');
    await sql.end();
    return true;
  } catch (error) {
    console.error('Erro durante a migração:', error);
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