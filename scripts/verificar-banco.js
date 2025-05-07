// scripts/verificar-banco.js
// Script para verificar a estrutura do banco de dados

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar existência das variáveis necessárias
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço (maior privilégio)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verificarBancoDados() {
  try {
    console.log('🔍 Verificando estrutura do banco de dados...');

    // 1. Listar todas as tabelas públicas
    console.log('\n📊 Listando tabelas públicas:');
    
    // Usando RPC para executar SQL diretamente para listar tabelas
    const { data: tables, error: tablesError } = await supabase.rpc(
      'execute_sql',
      { 
        sql_query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'" 
      }
    );
    
    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError.message);
      
      // Se falhar, tentar outra abordagem usando a API REST
      const { data: tablesList, error: tablesListError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesListError) {
        console.error('❌ Erro também na segunda tentativa:', tablesListError.message);
      } else if (tablesList && tablesList.length > 0) {
        console.log(`Encontradas ${tablesList.length} tabelas:`);
        tablesList.forEach((table, index) => {
          console.log(`  ${index + 1}. ${table.tablename}`);
        });
      } else {
        console.log('Nenhuma tabela encontrada no schema public.');
      }
    } else if (tables && tables.length > 0) {
      console.log(`Encontradas ${tables.length} tabelas:`);
      tables.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.tablename}`);
      });
    } else {
      console.log('Nenhuma tabela encontrada no schema public.');
    }

    // 2. Verificar se a tabela 'usuarios' existe
    console.log('\n🔎 Verificando a tabela "usuarios":');
    const { data: userTable, error: userTableError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(0);

    if (userTableError) {
      console.error('❌ Erro ao verificar tabela usuarios:', userTableError.message);
      
      if (userTableError.message.includes('does not exist')) {
        console.log('⚠️ A tabela "usuarios" não existe no banco de dados.');
        console.log('   Será necessário criar esta tabela antes de prosseguir.');
        
        // Sugerir SQL para criar a tabela
        console.log('\n📝 SQL sugerido para criar a tabela:');
        console.log(`
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    papel VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    nome_completo VARCHAR(255),
    senha_hash VARCHAR(255),
    nivel INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentário para documentação
COMMENT ON TABLE public.usuarios IS 'Armazena os usuários do sistema (alunos, professores, gestores)';
        `);
      }
    } else {
      console.log('✅ A tabela "usuarios" existe no banco de dados.');
      
      // 3. Obter estrutura da tabela usuarios
      console.log('\n📋 Estrutura da tabela "usuarios":');
      
      const { data: columns, error: columnsError } = await supabase.rpc(
        'execute_sql',
        { 
          sql_query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'usuarios'
          ORDER BY ordinal_position
          ` 
        }
      );
      
      if (columnsError) {
        console.error('❌ Erro ao obter estrutura da tabela:', columnsError.message);
      } else if (columns && columns.length > 0) {
        console.log('Colunas encontradas:');
        columns.forEach((col, index) => {
          console.log(`  ${index + 1}. ${col.column_name} (${col.data_type})${col.is_nullable === 'YES' ? ', NULLABLE' : ''}${col.column_default ? ', DEFAULT: ' + col.column_default : ''}`);
        });
      } else {
        console.log('Não foi possível obter a estrutura da tabela.');
      }
      
      // 4. Contar registros na tabela
      const { count, error: countError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('❌ Erro ao contar registros:', countError.message);
      } else {
        console.log(`\n📊 Total de registros na tabela: ${count || 0}`);
      }
    }

    // 5. Verificar se a autenticação está ativa
    console.log('\n🔐 Verificando serviço de autenticação:');
    
    try {
      // Tentando obter estatísticas do serviço de autenticação
      const { data: authStats, error: authStatsError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (authStatsError) {
        console.error('❌ Erro ao verificar autenticação:', authStatsError.message);
      } else {
        console.log('✅ Serviço de autenticação está ativo e operacional');
        console.log(`   Total de usuários autenticados: ${authStats.total || 'Não disponível'}`);
      }
    } catch (authError) {
      console.error('❌ Erro ao acessar API de administração da autenticação:', authError.message);
      console.error('   Isto pode indicar que a chave de serviço não tem permissões administrativas.');
    }

    console.log('\n✅ Verificação do banco de dados concluída.');
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a verificação
verificarBancoDados();