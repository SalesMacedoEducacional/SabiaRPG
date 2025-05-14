/**
 * Script para desabilitar imediatamente o RLS (Row Level Security) da tabela turmas
 * Este script permite que os registros de turmas sejam visíveis e modificáveis via API do Supabase
 */

import { executeSql } from '../db/supabase.js';

async function disableRlsTurmas() {
  try {
    console.log('Iniciando desativação do RLS da tabela turmas...');
    
    // SQL para desativar o RLS na tabela turmas
    const disableRlsQuery = `
      -- Desativa o RLS para a tabela turmas
      ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
    `;
    
    // Executar o SQL
    await executeSql(disableRlsQuery);
    
    console.log('RLS desativado com sucesso para a tabela turmas!');
    
    // Verificar configuração atual de RLS
    const checkQuery = `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'turmas';
    `;
    
    const result = await executeSql(checkQuery);
    console.log('Status atual de RLS para tabela turmas:', result);
    
    return { success: true, message: 'RLS desativado com sucesso!' };
  } catch (error) {
    console.error('Erro ao desativar RLS:', error);
    return { success: false, error };
  }
}

// Auto-executar a função
disableRlsTurmas()
  .then(result => {
    console.log('Resultado:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  });