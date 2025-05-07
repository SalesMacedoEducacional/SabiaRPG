// scripts/criar-usuario-simples.js
// Versão simplificada para criar usuário via API Supabase

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

async function main() {
  // Dados do usuário a ser criado
  const email = 'gestor@sabiarpg.edu.br';
  const senha = 'Senha@123';
  const papel = 'gestor';
  const nome_completo = 'Gestor Escolar';
  const username = 'gestor_escolar';
  
  console.log(`🔄 Tentando criar usuário: ${email}`);
  
  try {
    // Usar diretamente o método de criação normal de usuário
    console.log('🔑 Criando usuário via signUp (método para usuários comuns)...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          papel,
          nome_completo,
          username
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário com signUp:', error.message);
      console.error('   Detalhes:', JSON.stringify(error));
      
      // Se o erro for que o usuário já existe, tente fazer login
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        console.log('⚠️ Email já registrado. Tentando fazer login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: senha
        });
        
        if (loginError) {
          console.error('❌ Erro ao fazer login:', loginError.message);
          return;
        }
        
        console.log('✅ Login bem-sucedido. ID:', loginData.user?.id);
        
        if (loginData.user?.id) {
          await inserirUsuarioNaTabela(loginData.user.id, email, papel, nome_completo, username);
        }
      }
      return;
    }
    
    console.log('✅ Usuário criado via signUp. ID:', data.user?.id);
    
    // Ativar/confirmar o email do usuário usando a API de administração
    if (data.user?.id) {
      try {
        console.log('🔄 Tentando confirmar o email do usuário...');
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        
        if (updateError) {
          console.log('⚠️ Não foi possível confirmar o email automaticamente:', updateError.message);
        } else {
          console.log('✅ Email confirmado com sucesso');
        }
      } catch (confirmError) {
        console.log('⚠️ Erro ao tentar confirmar email:', confirmError.message);
      }
      
      // Tentar inserir na tabela de usuários
      await inserirUsuarioNaTabela(data.user.id, email, papel, nome_completo, username);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

async function inserirUsuarioNaTabela(userId, email, papel, nome_completo, username) {
  try {
    console.log('📝 Inserindo na tabela de usuários...');
    
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        papel,
        nome_completo: nome_completo || '',
        username: username || email.split('@')[0],
        senha_hash: 'autenticado_pelo_supabase',
        criado_em: new Date()
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Erro ao inserir na tabela de usuários:', error.message);
      
      // Verificar se o erro é por duplicação
      if (error.message.includes('duplicate key')) {
        console.log('⚠️ Usuário já existe na tabela. Atualizando...');
        
        // Tentar atualizar o registro
        const { data: updateData, error: updateError } = await supabase
          .from('usuarios')
          .update({
            papel,
            nome_completo: nome_completo || '',
            username: username || email.split('@')[0],
            ultima_atualizacao: new Date()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ Erro ao atualizar usuário:', updateError.message);
        } else {
          console.log('✅ Usuário atualizado com sucesso.');
        }
      }
    } else {
      console.log('✅ Usuário inserido na tabela com sucesso.');
    }
  } catch (err) {
    console.error('❌ Erro ao inserir na tabela:', err.message);
  }
}

main();