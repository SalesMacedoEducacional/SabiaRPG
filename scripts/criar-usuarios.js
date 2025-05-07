// scripts/criar-usuarios.js
// Script para criar usuário com autenticação e registro na tabela "usuarios"

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar existência das variáveis necessárias
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Chave de serviço com permissões administrativas

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
  console.error('   Adicione essas variáveis ao arquivo .env ou às variáveis de ambiente do sistema');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço (maior privilégio)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Cria um usuário completo no sistema, com autenticação e registro na tabela usuarios
 * @param {Object} params - Parâmetros para criação do usuário
 * @param {string} params.email - Email do usuário (obrigatório)
 * @param {string} params.senha - Senha do usuário (obrigatório)
 * @param {string} params.papel - Papel do usuário: 'gestor', 'professor', 'aluno' (obrigatório)
 * @param {string} params.nome_completo - Nome completo do usuário (opcional)
 * @param {string} params.username - Nome de usuário (opcional)
 * @returns {Promise<Object|null>} Objeto com dados do usuário criado ou null em caso de erro
 */
async function criarUsuarioCompleto({ email, senha, papel, nome_completo, username }) {
  if (!email || !senha || !papel) {
    console.error('❌ Erro: email, senha e papel são campos obrigatórios');
    return null;
  }

  // Validar papel (role)
  const papeisValidos = ['gestor', 'professor', 'aluno', 'admin'];
  if (!papeisValidos.includes(papel)) {
    console.error(`❌ Erro: papel deve ser um dos seguintes valores: ${papeisValidos.join(', ')}`);
    return null;
  }

  try {
    console.log(`🔄 Iniciando criação de usuário: ${email} (${papel})`);

    console.log('📊 Verificando se o email já existe...');
    
    // Verificar se o email já está em uso
    const { data: existingUsers, error: checkError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .limit(1);
      
    if (checkError) {
      console.error('❌ Erro ao verificar se o email já existe:', checkError.message);
      
      // Verificar se a tabela existe
      console.log('🔍 Verificando se a tabela "usuarios" existe...');
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesError) {
        console.error('❌ Não foi possível verificar as tabelas:', tablesError.message);
      } else {
        console.log('📋 Tabelas existentes:', tables ? tables.map(t => t.tablename).join(', ') : 'Nenhuma');
      }
    } else if (existingUsers && existingUsers.length > 0) {
      console.error('❌ Email já está em uso:', email);
      return null;
    } else {
      console.log('✅ Email disponível para uso');
    }
    
    // 1. Criação no Auth do Supabase usando API administrativa
    console.log('🔑 Criando usuário no sistema de autenticação...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Marcar email como confirmado automaticamente
      user_metadata: { 
        papel,
        nome_completo: nome_completo || '',
        username: username || email.split('@')[0]
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', authError.message);
      console.error('   Detalhes completos do erro:', JSON.stringify(authError));
      
      // Verificar se é um erro de email já existente
      if (authError.message.includes('already exists')) {
        console.error('   Este email já está registrado no sistema de autenticação.');
        // Opcionalmente, pode tentar recuperar o ID existente e continuar
      }
      
      return null;
    }

    console.log('✅ Usuário criado com sucesso no Auth. ID:', authUser.user.id);
    const userId = authUser.user.id;

    // 2. Registro na tabela usuarios com o mesmo ID do Auth
    const { data: dbUser, error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        papel,
        nome_completo: nome_completo || '',
        username: username || email.split('@')[0],
        criado_em: new Date(),
        senha_hash: 'autenticado_pelo_supabase'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erro ao inserir usuário na tabela usuarios:', dbError.message);
      console.error('⚠️ Recomendação: verifique se a tabela "usuarios" existe e se tem os campos corretos');
      return null;
    }

    console.log('✅ Usuário registrado com sucesso na tabela usuarios');
    
    // 3. Retornar dados consolidados
    const usuarioCriado = {
      id: userId,
      email,
      papel,
      nome_completo: nome_completo || '',
      username: username || email.split('@')[0],
      auth_confirmado: true
    };

    console.log('✅ Processo completo! Usuário criado e registrado com sucesso');
    console.log(usuarioCriado);
    
    return usuarioCriado;
  } catch (err) {
    console.error('❌ Erro inesperado durante a criação do usuário:', err.message);
    return null;
  }
}

// Executar diretamente se este script for chamado diretamente
if (process.argv[1].includes('criar-usuarios.js')) {
  const executarExemplo = async () => {
    try {
      // Exemplo de uso - altere conforme necessário
      const novoUsuario = await criarUsuarioCompleto({
        email: 'gestor@sabiarpg.edu.br',
        senha: 'Senha@123',
        papel: 'gestor',
        nome_completo: 'Gestor Escolar'
      });

      if (novoUsuario) {
        console.log('📋 Resumo da criação:');
        console.log('- Email:', novoUsuario.email);
        console.log('- Papel:', novoUsuario.papel);
        console.log('- ID:', novoUsuario.id);
      }
      
      // Encerrar o script após a execução
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro durante a execução do exemplo:', error);
      process.exit(1);
    }
  };

  executarExemplo();
}

// Exportar a função para uso em outros módulos
export { criarUsuarioCompleto };