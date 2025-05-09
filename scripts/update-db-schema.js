/**
 * Script para atualizar o esquema do banco de dados
 * Este script adiciona novas tabelas ao banco de dados Supabase
 */

import { executeSql } from '../db/supabase.js';

async function updateDatabaseSchema() {
  console.log('Iniciando atualização do esquema do banco de dados...');

  // SQL para criar as novas tabelas
  const sqlSchema = `
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
  `;

  try {
    // Executando o SQL para criar as tabelas
    await executeSql(sqlSchema);
    
    console.log('Esquema atualizado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar o esquema do banco de dados:', error);
    return false;
  }
}

// Executar a função de atualização
updateDatabaseSchema()
  .then(success => {
    if (success) {
      console.log('Processo de atualização concluído com sucesso.');
    } else {
      console.error('Processo de atualização falhou.');
    }
  })
  .catch(error => {
    console.error('Erro inesperado durante atualização:', error);
  });