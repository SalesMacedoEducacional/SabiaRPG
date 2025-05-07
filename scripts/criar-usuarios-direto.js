// scripts/criar-usuarios-direto.js
// Este script cria usuários diretamente inserindo nas tabelas do Supabase,
// sem depender da API de autenticação que está apresentando erros.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

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

/**
 * Gera um hash seguro para a senha usando SCRYPT
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<string>} - Hash no formato "hash.salt"
 */
async function hashPassword(senha) {
  return new Promise((resolve, reject) => {
    // Gerar um salt aleatório
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Usar scrypt para gerar o hash
    crypto.scrypt(senha, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

/**
 * Gera um UUID v4 aleatório
 * @returns {string} - UUID v4
 */
function gerarUUID() {
  return crypto.randomUUID();
}

/**
 * Cria um usuário diretamente na tabela 'usuarios'
 * @param {Object} params - Parâmetros para criação do usuário
 * @returns {Promise<Object|null>} - Dados do usuário criado ou null em caso de erro
 */
async function criarUsuarioDireto(params) {
  const { email, senha, papel, nome_completo, username } = params;
  
  try {
    // Validar campos obrigatórios
    if (!email || !senha || !papel) {
      console.error('❌ Erro: email, senha e papel são campos obrigatórios');
      return null;
    }
    
    console.log(`🔄 Iniciando criação direta do usuário: ${email} (${papel})`);
    
    // Verificar se o usuário já existe na tabela
    const { data: usuarioExistente, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();
      
    if (!checkError && usuarioExistente) {
      console.log('⚠️ Usuário já existe na tabela com ID:', usuarioExistente.id);
      return usuarioExistente;
    }
    
    // Gerar um ID UUID v4 para o usuário
    const userId = gerarUUID();
    console.log('🆔 ID gerado para o usuário:', userId);
    
    // Gerar hash da senha
    const senhaHash = await hashPassword(senha);
    console.log('🔐 Hash da senha gerado com sucesso');
    
    // Preparar dados para inserção - usando apenas as colunas que realmente existem na tabela
    const dadosUsuario = {
      id: userId,
      email,
      papel,
      senha_hash: senhaHash,
      criado_em: new Date().toISOString()
    };
    
    // Inserir na tabela de usuários
    console.log('📝 Inserindo usuário na tabela...');
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert(dadosUsuario)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Erro ao inserir usuário:', insertError.message);
      console.error('   Detalhes completos:', JSON.stringify(insertError));
      return null;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📋 Dados do usuário:');
    console.log(novoUsuario);
    
    return novoUsuario;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return null;
  }
}

// Executar o script se chamado diretamente
if (process.argv[1].includes('criar-usuarios-direto.js')) {
  // Definir os usuários a serem criados
  const usuariosParaCriar = [
    {
      email: 'gestor@sabiarpg.edu.br',
      senha: 'Senha@123',
      papel: 'gestor',
      nome_completo: 'Gestor Escolar'
    },
    {
      email: 'professor@sabiarpg.edu.br',
      senha: 'Senha@123',
      papel: 'professor',
      nome_completo: 'Professor Demo'
    },
    {
      email: 'aluno@sabiarpg.edu.br',
      senha: 'Senha@123',
      papel: 'aluno',
      nome_completo: 'Aluno Demo'
    }
  ];
  
  // Criar os usuários em sequência
  async function criarUsuarios() {
    for (const usuario of usuariosParaCriar) {
      console.log(`\n=== Criando usuário: ${usuario.email} ===`);
      await criarUsuarioDireto(usuario);
      console.log('=== Fim da criação deste usuário ===\n');
    }
    
    console.log('🎉 Processo de criação de usuários concluído!');
  }
  
  criarUsuarios();
}

export { criarUsuarioDireto };