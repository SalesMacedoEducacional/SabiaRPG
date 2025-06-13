import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkYWN3eHZ6dnl2bWRmd3JiYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2NzQyMjEsImV4cCI6MjAzNzI1MDIyMX0.k-3a-nrCo_JKSGjJkqKJQr2jlPgTqjpDIcFQu3vr4uQ';

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
 */
export async function executeSql(sql) {
  try {
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
 */
export async function initializeDatabase(sqlContent) {
  try {
    console.log('🔄 Tentando inicializar banco de dados...');
    
    const result = await executeSql(sqlContent);
    
    if (!result.success) {
      console.log('⚠️ Não foi possível executar SQL através de RPC.');
      return false;
    }
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante a inicialização do banco de dados:', error.message);
    return false;
  }
}