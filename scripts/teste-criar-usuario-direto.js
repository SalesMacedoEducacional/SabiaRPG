import { supabase } from '../db/supabase.js';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { createHash, randomBytes } from 'crypto';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Gera um hash seguro para a senha usando SCRYPT simplificado
 * @param senha Senha em texto puro (CPF neste caso)
 * @returns Hash no formato "hash.salt"
 */
async function hashPassword(senha) {
  const salt = randomBytes(16).toString('hex');
  
  // Método mais simples para criar hash
  const hash = createHash('sha256')
              .update(senha + salt)
              .digest('hex');
  
  return `${hash}.${salt}`;
}

/**
 * Script de teste para criar usuário na tabela 'usuarios'
 * com CPF como senha temporária
 */
async function testarCriacaoUsuario() {
  try {
    // Dados do usuário para teste
    const userId = randomUUID();
    const email = `teste_direto_${Date.now()}@sabiarpg.com.br`;
    const cpf = '12345678900'; // CPF fictício para teste
    const papel = 'professor';
    
    console.log('Iniciando teste de criação de usuário diretamente no banco:');
    console.log({ userId, email, cpf, papel });
    
    // 1. Gerar hash da senha (CPF)
    console.log('\n1. Gerando hash do CPF para senha...');
    const senha_hash = await hashPassword(cpf);
    console.log('Hash gerado (primeiros 20 caracteres):', senha_hash.substring(0, 20) + '...');
    
    // 2. Inserir na tabela 'usuarios' usando adminSupabase para ignorar RLS
    console.log('\n2. Inserindo usuário na tabela usuarios com chave de serviço...');
    
    const { data: newUser, error: insertError } = await adminSupabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        senha_hash,
        papel,
        cpf, // Salvar CPF para referência futura
        criado_em: new Date().toISOString()
      })
      .select('id, email, papel, cpf')
      .single();
      
    if (insertError) {
      console.error('❌ Erro ao inserir usuário na tabela:', insertError);
      return;
    }
    
    console.log('✅ Usuário inserido na tabela com sucesso!');
    console.log('Dados na tabela:', newUser);
    
    // 3. Buscar dados completos do usuário
    console.log('\n3. Buscando dados completos do usuário na tabela com chave de serviço...');
    
    const { data: completeUser, error: fetchError } = await adminSupabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('❌ Erro ao buscar dados completos:', fetchError);
    } else {
      console.log('✅ Dados completos recuperados com sucesso!');
      console.log('Usuário na tabela:', completeUser);
    }
    
    console.log('\n✅ Teste concluído com sucesso! ✅');
    console.log(`Um novo usuário foi criado com email ${email} e CPF ${cpf} como senha temporária.`);
    console.log('Para testes de autenticação com este usuário, use o customAuth.handleCustomLogin().');
    
  } catch (error) {
    console.error('Erro inesperado durante o teste:', error);
  } finally {
    process.exit(0);
  }
}

testarCriacaoUsuario();