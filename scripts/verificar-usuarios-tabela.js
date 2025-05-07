// scripts/verificar-usuarios-tabela.js
// Este script verifica todos os usuários na tabela do Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function listarTodosUsuarios() {
  try {
    console.log('🔍 Buscando todos os usuários na tabela...');
    
    // Buscar todos os usuários na tabela
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      return;
    }
    
    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado na tabela');
      return;
    }
    
    console.log(`✅ Encontrados ${usuarios.length} usuários na tabela:`);
    usuarios.forEach((usuario, index) => {
      console.log(`\n--- Usuário ${index + 1} ---`);
      console.log('ID:', usuario.id);
      console.log('Email:', usuario.email);
      console.log('Papel:', usuario.papel);
      console.log('Criado em:', usuario.criado_em);
      // Não exibir o hash da senha por segurança
      console.log('Senha Hash: [PROTEGIDO]');
      console.log('---------------');
    });
    
    return usuarios;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Função para testes complementares
async function realizarTestesFuncionamento() {
  try {
    console.log('\n🧪 Realizando testes adicionais...');
    
    // 1. Testar inserção direta na tabela
    const usuarioTeste = {
      id: 'test-' + Date.now(),
      email: `test-${Date.now()}@example.com`,
      papel: 'aluno',
      senha_hash: 'test-hash',
      criado_em: new Date().toISOString()
    };
    
    console.log('📝 Tentando inserir usuário de teste...');
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert(usuarioTeste)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Erro ao inserir usuário de teste:', insertError.message);
    } else {
      console.log('✅ Usuário de teste inserido com sucesso!');
      console.log('ID:', novoUsuario.id);
      
      // 2. Tentar ler o usuário recém-inserido
      console.log('🔍 Tentando ler o usuário de teste...');
      const { data: usuarioLido, error: readError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', novoUsuario.id)
        .single();
        
      if (readError) {
        console.error('❌ Erro ao ler usuário de teste:', readError.message);
      } else {
        console.log('✅ Usuário de teste lido com sucesso!');
        console.log('Email:', usuarioLido.email);
      }
      
      // 3. Remover o usuário de teste
      console.log('🗑️ Removendo usuário de teste...');
      const { error: deleteError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', novoUsuario.id);
        
      if (deleteError) {
        console.error('❌ Erro ao remover usuário de teste:', deleteError.message);
      } else {
        console.log('✅ Usuário de teste removido com sucesso!');
      }
    }
    
    // 4. Verificar políticas de segurança do Supabase
    console.log('\n🔒 Verificando políticas de segurança...');
    console.log('Este pode ser o problema: as políticas RLS do Supabase podem estar bloqueando o acesso.');
    console.log('Soluções possíveis:');
    console.log('1. Desativar RLS na tabela usuarios (se for um ambiente de desenvolvimento)');
    console.log('2. Criar políticas RLS adequadas para leitura e escrita na tabela');
    console.log('3. Certificar-se de que a chave de serviço tem permissões corretas');
    
  } catch (error) {
    console.error('❌ Erro inesperado nos testes:', error.message);
  }
}

// Executar o script
async function main() {
  await listarTodosUsuarios();
  await realizarTestesFuncionamento();
  console.log('\n🎉 Verificação de usuários concluída!');
}

main();