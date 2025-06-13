import { createClient } from '@supabase/supabase-js';

// Usar DATABASE_URL diretamente - o formato correto para Supabase
const DATABASE_URL = process.env.DATABASE_URL;

// Configuração baseada no padrão funcional do projeto
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL é obrigatório');
}

// Extrair configurações do Supabase da DATABASE_URL
let supabaseUrl, supabaseKey;

// Se DATABASE_URL contém supabase, extrair configs
if (DATABASE_URL.includes('supabase.co')) {
  const urlParts = DATABASE_URL.match(/postgresql:\/\/[^@]+@([^:]+)\.supabase\.co/);
  if (urlParts) {
    const projectId = urlParts[1];
    supabaseUrl = `https://${projectId}.supabase.co`;
    // Usar uma chave anônima válida do Supabase (pode ser obtida do painel)
    supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkYWN3eHZ6dnl2bWRmd3JiYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjcyMDEsImV4cCI6MjA2NTM0MzIwMX0.VvFnQAg4lJxaD_s8E7wC_ZJ9xX8vY5kQ2pM7Nn6Fj8E';
  }
}

// Fallback para desenvolvimento
if (!supabaseUrl || !supabaseKey) {
  supabaseUrl = 'https://idacwxvzvyvmdfwrbbqn.supabase.co';
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkYWN3eHZ6dnl2bWRmd3JiYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjcyMDEsImV4cCI6MjA2NTM0MzIwMX0.VvFnQAg4lJxaD_s8E7wC_ZJ9xX8vY5kQ2pM7Nn6Fj8E';
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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