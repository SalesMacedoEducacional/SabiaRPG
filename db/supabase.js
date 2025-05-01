import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Executa SQL diretamente no Supabase através da API
 * Nota: Esta é uma solução alternativa, já que o método ideal seria
 * usar migrations com drizzle-orm direto no Supabase
 */
export async function executeSql(sql) {
  try {
    // Usar o recurso de RPC para executar SQL diretamente
    // Se o Supabase não tiver uma função SQL RPC configurada, isto falhará
    // e você precisará criar a função no painel do Supabase
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado executando SQL:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Função para inicializar o banco de dados
 * Isso vai criar todas as tabelas necessárias no Supabase
 * 
 * Nota: Esta função deve ser chamada apenas uma vez para configuração inicial
 * ou então executar pelo painel administrativo do Supabase
 */
export async function initializeDatabase(sqlContent) {
  try {
    console.log('🔄 Tentando inicializar banco de dados...');
    
    // Tentar executar o SQL pelo RPC
    const result = await executeSql(sqlContent);
    
    if (!result.success) {
      console.log('⚠️ Não foi possível executar SQL através de RPC.');
      console.log('⚠️ Você precisará criar as tabelas manualmente pelo painel do Supabase ou configurar uma função RPC para executar SQL.');
      return false;
    }
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante a inicialização do banco de dados:', error.message);
    return false;
  }
}