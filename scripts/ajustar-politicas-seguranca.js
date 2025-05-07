// scripts/ajustar-politicas-seguranca.js
// Este script ajusta as políticas de segurança do Supabase para permitir acesso à tabela 'usuarios'

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { executeSql } from '../db/supabase.js';

// Carregar variáveis de ambiente
dotenv.config();

// Obter as credenciais do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias.');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function habilitarPoliticasAcesso() {
  try {
    console.log('🔒 Habilitando políticas de acesso para a tabela usuarios...');
    
    // 1. Primeira etapa: Desativar RLS (Row Level Security) para a tabela 'usuarios'
    // Isso permite acesso completo sem restrições (APENAS EM AMBIENTE DE DESENVOLVIMENTO!)
    console.log('👉 Tentando desativar RLS para a tabela usuarios...');
    
    const resultadoRLS = await executeSql(`
      ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
    `);
    
    if (resultadoRLS) {
      console.log('✅ RLS desativado com sucesso para a tabela usuarios!');
    } else {
      console.error('❌ Erro ao desativar RLS para a tabela usuarios.');
    }
    
    // 2. Segunda etapa: Criar políticas de acesso amplas em caso de falha da primeira etapa
    console.log('👉 Criando políticas de acesso para a tabela usuarios...');
    
    // Criar política para permitir qualquer pessoa ler a tabela 'usuarios'
    await executeSql(`
      DROP POLICY IF EXISTS "Permitir leitura para todos" ON usuarios;
      CREATE POLICY "Permitir leitura para todos" ON usuarios
        FOR SELECT
        USING (true);
    `);
    
    // Criar política para permitir inserção
    await executeSql(`
      DROP POLICY IF EXISTS "Permitir inserção para todos" ON usuarios;
      CREATE POLICY "Permitir inserção para todos" ON usuarios
        FOR INSERT
        WITH CHECK (true);
    `);
    
    // Criar política para permitir atualização
    await executeSql(`
      DROP POLICY IF EXISTS "Permitir atualização para todos" ON usuarios;
      CREATE POLICY "Permitir atualização para todos" ON usuarios
        FOR UPDATE
        USING (true)
        WITH CHECK (true);
    `);
    
    // Criar política para permitir exclusão
    await executeSql(`
      DROP POLICY IF EXISTS "Permitir exclusão para todos" ON usuarios;
      CREATE POLICY "Permitir exclusão para todos" ON usuarios
        FOR DELETE
        USING (true);
    `);
    
    console.log('✅ Políticas de acesso criadas com sucesso para a tabela usuarios!');
    
    // 3. Terceira etapa: Verificar se a tabela é acessível
    console.log('🔍 Verificando se a tabela usuarios é acessível...');
    
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Erro ao acessar a tabela usuarios:', error.message);
    } else if (!usuarios || usuarios.length === 0) {
      console.log('⚠️ A tabela usuarios é acessível, mas não há registros.');
    } else {
      console.log('✅ A tabela usuarios é acessível! Encontrado:', usuarios.length, 'registro(s)');
    }
    
    // Exibe os registros para debug
    if (usuarios && usuarios.length > 0) {
      console.log('📋 Primeiro registro encontrado:');
      console.log('ID:', usuarios[0].id);
      console.log('Email:', usuarios[0].email);
      console.log('Papel:', usuarios[0].papel);
    }
    
    // 4. Quarta etapa: Verificar todos os usuários novamente
    console.log('\n🔍 Verificando todos os usuários na tabela...');
    
    const { data: todosUsuarios, error: errorTodos } = await supabase
      .from('usuarios')
      .select('*');
      
    if (errorTodos) {
      console.error('❌ Erro ao buscar todos os usuários:', errorTodos.message);
    } else if (!todosUsuarios || todosUsuarios.length === 0) {
      console.log('⚠️ Não foram encontrados usuários na tabela.');
    } else {
      console.log(`✅ Encontrados ${todosUsuarios.length} usuários na tabela:`);
      todosUsuarios.forEach((usuario, index) => {
        console.log(`\n--- Usuário ${index + 1} ---`);
        console.log('ID:', usuario.id);
        console.log('Email:', usuario.email);
        console.log('Papel:', usuario.papel);
        console.log('Criado em:', usuario.criado_em);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar políticas de acesso:', error.message);
    return false;
  }
}

// Executar o script
async function main() {
  const resultado = await habilitarPoliticasAcesso();
  
  if (resultado) {
    console.log('\n🎉 Configuração das políticas de acesso concluída com sucesso!');
    console.log('Agora você deve conseguir fazer login com os usuários da tabela.');
  } else {
    console.error('\n❌ Não foi possível configurar as políticas de acesso completamente.');
    console.log('Talvez seja necessário configurar manualmente no painel do Supabase.');
  }
}

main();