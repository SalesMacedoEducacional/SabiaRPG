/**
 * Script para testar a criação de usuário com CPF como senha temporária
 * Esse script executa uma chamada para a API de criação de usuário usando Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testarCriacaoUsuarioComCPF() {
  console.log('🔄 Iniciando teste de criação de usuário com CPF como senha temporária...');
  
  try {
    // Gerar um email de teste único
    const timestamp = Date.now();
    const email = `teste${timestamp}@teste.com`;
    const cpf = '12345678900'; // CPF de teste (em produção use valores reais)
    
    console.log(`📧 Email de teste: ${email}`);
    console.log(`🔑 CPF (senha temporária): ${cpf}`);
    
    // 1. Criar usuário no Supabase Auth
    console.log('1️⃣ Criando usuário no Supabase Auth...');
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: cpf, // CPF como senha temporária
      email_confirm: true
    });
    
    if (authError) {
      throw new Error(`Erro ao criar usuário no Auth: ${authError.message}`);
    }
    
    console.log('✅ Usuário criado no Auth com sucesso!');
    console.log(`🆔 ID do usuário: ${authUser.user.id}`);
    
    // 2. Inserir na tabela 'usuarios'
    console.log('2️⃣ Inserindo usuário na tabela usuarios...');
    const { data: dbUser, error: dbError } = await adminSupabase
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        email,
        senha_hash: 'hash_temporario', // Em produção, use uma função de hash real
        papel: 'gestor',
        cpf,
        criado_em: new Date().toISOString()
      })
      .select('id, email, papel, cpf')
      .single();
    
    if (dbError) {
      // Se ocorrer erro, remover o usuário do Auth
      console.error('❌ Erro ao inserir usuário na tabela:', dbError);
      await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Erro ao inserir usuário no banco: ${dbError.message}`);
    }
    
    console.log('✅ Usuário inserido na tabela com sucesso!');
    console.log('📋 Dados do usuário:', dbUser);
    
    // 3. Testar autenticação com o CPF como senha
    console.log('3️⃣ Testando autenticação com o CPF como senha...');
    const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
      email,
      password: cpf
    });
    
    if (signInError) {
      throw new Error(`Erro ao fazer login com CPF: ${signInError.message}`);
    }
    
    console.log('✅ Autenticação com CPF como senha funcionou com sucesso!');
    
    // Limpar a sessão de autenticação de teste
    await adminSupabase.auth.signOut();
    
    console.log('🎉 Teste completo! Criação de usuário com CPF como senha temporária está funcionando corretamente.');
    
    return {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        papel: dbUser.papel,
        cpf: dbUser.cpf
      }
    };
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar o teste
testarCriacaoUsuarioComCPF()
  .then(result => {
    console.log('\n📊 Resultado do teste:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });