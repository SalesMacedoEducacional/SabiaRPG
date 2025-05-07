// scripts/criar-usuario-teste-direto.js
// Este script cria um usuário de teste diretamente na tabela, ignorando o sistema de autenticação

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Carregar variáveis de ambiente
dotenv.config();

// Obter as credenciais do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são necessárias.');
  process.exit(1);
}

// Criar cliente Supabase com chave pública (diferente da chave de serviço)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Dados do usuário de teste
const usuarioTeste = {
  email: 'teste@sabiarpg.edu.br',
  senha: 'Teste123',
  papel: 'gestor',
  nome_completo: 'Usuário de Teste'
};

/**
 * Função para criar hash simples para teste
 */
function criarHashSimples(senha) {
  return `senha_hash_simples_${senha}`;
}

/**
 * Função para inserir usuário de teste
 */
async function inserirUsuarioTeste() {
  try {
    console.log('📝 Criando usuário de teste...');
    
    // Gerar ID único
    const userId = crypto.randomUUID();
    
    // Criar hash simples para teste
    const senhaHash = criarHashSimples(usuarioTeste.senha);
    
    // Preparar dados para inserção
    const dadosUsuario = {
      id: userId,
      email: usuarioTeste.email,
      papel: usuarioTeste.papel,
      senha_hash: senhaHash,
      criado_em: new Date().toISOString()
    };
    
    // Inserir na tabela
    console.log('👉 Tentando inserir usuário na tabela...');
    const { data, error } = await supabase
      .from('usuarios')
      .insert(dadosUsuario)
      .select();
      
    if (error) {
      console.error('❌ Erro ao inserir usuário:', error.message);
      return null;
    }
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📋 Dados do usuário:');
    console.log('ID:', userId);
    console.log('Email:', usuarioTeste.email);
    console.log('Papel:', usuarioTeste.papel);
    console.log('Senha (para teste):', usuarioTeste.senha);
    console.log('Hash senha (simplificado):', senhaHash);
    
    return { id: userId, ...usuarioTeste };
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return null;
  }
}

// Executar o script
inserirUsuarioTeste()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
  })
  .catch((error) => {
    console.error('❌ Erro no processo:', error);
  });