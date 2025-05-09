// scripts/testar-login.js
// Script para testar login com credenciais existentes no Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar existência das variáveis necessárias
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Chave anônima é suficiente para login

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
  process.exit(1);
}

// Criar cliente Supabase com chave anônima (sufficient for login)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Tenta fazer login com as credenciais fornecidas
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 */
async function testarLogin(email, senha) {
  try {
    console.log(`🔄 Tentando fazer login com: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });
    
    if (error) {
      console.error('❌ Erro ao fazer login:', error.message);
      return null;
    }
    
    console.log('✅ Login bem-sucedido! Detalhes do usuário:');
    console.log(`- ID: ${data.user.id}`);
    console.log(`- Email: ${data.user.email}`);
    console.log(`- Criado em: ${new Date(data.user.created_at).toLocaleString()}`);
    
    if (data.user.user_metadata) {
      console.log('- Metadados:', JSON.stringify(data.user.user_metadata, null, 2));
    }
    
    // Buscar dados do usuário da tabela personalizada
    console.log('\n📊 Buscando dados do usuário na tabela "usuarios"...');
    
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError) {
      console.error('❌ Erro ao buscar dados na tabela:', userError.message);
      
      // Se o usuário não existir na tabela, criar o registro
      if (userError.message.includes('No rows found') || userError.code === 'PGRST116') {
        console.log('⚠️ Usuário não encontrado na tabela. Criando registro...');
        
        // Determinar papel com base no email ou usar 'desconhecido'
        let papel = 'desconhecido';
        if (email.includes('aluno')) papel = 'aluno';
        if (email.includes('professor')) papel = 'professor';
        if (email.includes('gestor')) papel = 'gestor';
        
        const { data: insertData, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            id: data.user.id,
            email: data.user.email,
            papel: papel,
            username: data.user.email.split('@')[0],
            criado_em: new Date(),
            senha_hash: 'autenticado_pelo_supabase'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ Erro ao criar registro:', insertError.message);
        } else {
          console.log('✅ Registro criado com sucesso na tabela "usuarios"');
          console.log(insertData);
        }
      }
    } else {
      console.log('✅ Dados encontrados na tabela "usuarios":');
      console.log(userData);
    }
    
    return data.user;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return null;
  }
}

// Obter credenciais da linha de comando
const args = process.argv.slice(2);
const email = args[0];
const senha = args[1];

if (!email || !senha) {
  console.error('❌ Erro: Email e senha são obrigatórios');
  console.log('📝 Uso: node scripts/testar-login.js email senha');
  process.exit(1);
}

// Executar teste de login com as credenciais fornecidas
testarLogin(email, senha);

// Exportar função para uso em outros módulos
export { testarLogin };