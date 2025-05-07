// scripts/registrar-usuarios-auth.js
// Script para registrar usuários existentes na tabela 'usuarios' no sistema de autenticação do Supabase

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

// Criar cliente Supabase com chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Função principal para registrar usuário no sistema de autenticação
 */
async function registrarUsuarioAuth(usuarioTabela) {
  try {
    const { id, email, papel, senha } = usuarioTabela;
    
    console.log(`🔄 Tentando registrar usuário no Auth: ${email} (${id})`);
    
    // Verificar se o usuário já existe no Auth
    try {
      const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(id);
      
      if (!getUserError && authUser && authUser.user) {
        console.log('✅ Usuário já existe no Auth. ID:', authUser.user.id);
        return authUser.user;
      }
    } catch (getUserErr) {
      console.log('⚠️ Erro ao verificar usuário no Auth:', getUserErr.message);
    }
    
    // Tenta criar o usuário no Auth do Supabase com o mesmo UUID
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: senha || 'Senha@123', // Senha padrão se não for fornecida
      email_confirm: true,
      user_metadata: { papel },
      // Importante: usar o mesmo UUID da tabela usuarios
      id
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário no Auth:', error.message);
      
      // Se o erro indica que o usuário já existe, tentar atualizar
      if (error.message.includes('already exists')) {
        console.log('⚠️ O email já está em uso. Tentando atualizar...');
        
        // Tentar encontrar o usuário por email
        const { data: userByEmail, error: emailError } = await supabase.auth.admin.listUsers();
        
        if (!emailError && userByEmail && userByEmail.users) {
          const existingUser = userByEmail.users.find(u => u.email === email);
          
          if (existingUser) {
            console.log('✅ Encontrado usuário pelo email. ID:', existingUser.id);
            
            // Tentar atualizar o ID para coincidir com a tabela usuarios
            // (isso pode ser impossível em alguns provedores)
            try {
              const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { user_metadata: { papel } }
              );
              
              if (updateError) {
                console.error('❌ Erro ao atualizar metadados:', updateError.message);
              } else {
                console.log('✅ Metadados atualizados com sucesso');
              }
            } catch (updateErr) {
              console.error('❌ Erro ao atualizar usuário:', updateErr.message);
            }
            
            return existingUser;
          }
        }
      }
      
      return null;
    }
    
    console.log('✅ Usuário criado com sucesso no Auth. ID:', data.user.id);
    return data.user;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return null;
  }
}

/**
 * Função principal que busca usuários da tabela e os registra no Auth
 */
async function registrarTodosUsuarios() {
  try {
    console.log('🔍 Buscando usuários da tabela...');
    
    // Buscar usuários na tabela 'usuarios'
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
    
    console.log(`✅ Encontrados ${usuarios.length} usuários na tabela`);
    
    // Para cada usuário, tentar registrar no Auth
    for (const usuario of usuarios) {
      console.log(`\n=== Processando usuário: ${usuario.email} ===`);
      
      // Definir uma senha padrão para o usuário
      // Obs: em um ambiente real, seria melhor gerar senhas aleatórias e notificar o usuário
      // ou implementar um fluxo de redefinição de senha
      const usuarioComSenha = {
        ...usuario,
        senha: 'Senha@123'
      };
      
      await registrarUsuarioAuth(usuarioComSenha);
      
      console.log('=== Fim do processamento deste usuário ===');
    }
    
    console.log('\n🎉 Processo concluído!');
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a função principal
registrarTodosUsuarios();