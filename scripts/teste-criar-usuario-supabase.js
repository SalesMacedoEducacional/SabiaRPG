import { supabase } from '../db/supabase.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Script de teste para criar usuário via Supabase Auth e na tabela 'usuarios'
 * com CPF como senha temporária
 */
async function testarCriacaoUsuario() {
  try {
    // Dados do usuário para teste
    const email = `teste_auth_${Date.now()}@sabiarpg.com.br`;
    const cpf = '12345678900'; // CPF fictício para teste
    const papel = 'professor';
    
    console.log('Iniciando teste de criação de usuário:');
    console.log({ email, cpf, papel });
    
    // 1. Criar usuário no Supabase Auth
    console.log('\n1. Criando usuário no Supabase Auth...');
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: cpf, // CPF como senha temporária
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Erro ao criar usuário no Auth:', authError);
      return;
    }
    
    console.log('✅ Usuário criado no Auth com sucesso!');
    console.log('UUID gerado:', authUser.user.id);
    
    // 2. Inserir na tabela 'usuarios'
    console.log('\n2. Inserindo usuário na tabela usuarios...');
    
    const { data: newUser, error: insertError } = await adminSupabase
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        email,
        senha_hash: 'hash_temporario', // Em produção, deve ser um hash real
        papel,
        cpf, // Salvar CPF para referência futura
        criado_em: new Date().toISOString()
      })
      .select('id, email, papel, cpf')
      .single();
      
    if (insertError) {
      console.error('❌ Erro ao inserir usuário na tabela:', insertError);
      
      // Se falhar a inserção na tabela, remover do Auth para manter consistência
      console.log('Removendo usuário do Auth para manter consistência...');
      await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      
      return;
    }
    
    console.log('✅ Usuário inserido na tabela com sucesso!');
    console.log('Dados na tabela:', newUser);
    
    // 3. Verificar se autenticação funciona
    console.log('\n3. Testando autenticação com a senha temporária (CPF)...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: cpf
    });
    
    if (signInError) {
      console.error('❌ Erro ao autenticar com o CPF:', signInError);
      return;
    }
    
    console.log('✅ Autenticação com CPF funcionou!');
    console.log('Token da sessão:', signInData.session.access_token.substring(0, 20) + '...');
    
    // 4. Buscar dados completos do usuário
    console.log('\n4. Buscando dados completos do usuário na tabela...');
    
    const { data: completeUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
      
    if (fetchError) {
      console.error('❌ Erro ao buscar dados completos:', fetchError);
    } else {
      console.log('✅ Dados completos recuperados com sucesso!');
      console.log('Usuário na tabela:', completeUser);
    }
    
    console.log('\n✅ Teste concluído com sucesso! ✅');
    console.log(`Um novo usuário foi criado com email ${email} e senha ${cpf}`);
    
  } catch (error) {
    console.error('Erro inesperado durante o teste:', error);
  } finally {
    process.exit(0);
  }
}

testarCriacaoUsuario();