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
 * Gera um hash seguro para a senha usando SHA256 simplificado
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
 * Script para criar um usuário diretamente na tabela 'usuarios'
 */
async function criarUsuarioDireto(email, cpf, papel, nomeCompleto = null) {
  try {
    const userId = randomUUID();
    const nome = nomeCompleto || email.split('@')[0];
    
    console.log('Iniciando criação de usuário:', { userId, email, papel, nome });
    
    // 1. Gerar hash da senha (CPF)
    console.log('\n1. Gerando hash do CPF para senha...');
    const senha_hash = await hashPassword(cpf);
    console.log('Hash gerado (primeiros 20 caracteres):', senha_hash.substring(0, 20) + '...');
    
    // 2. Inserir usuário diretamente na tabela 'usuarios'
    console.log('\n2. Inserindo usuário na tabela usuarios...');
    
    const { data: newUser, error: insertError } = await adminSupabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        senha_hash,
        papel,
        cpf,
        criado_em: new Date().toISOString()
      })
      .select('id, email, papel, cpf')
      .single();
      
    if (insertError) {
      console.error('Erro ao inserir usuário na tabela:', insertError);
      
      // Se o erro for sobre CPF, tentar uma abordagem diferente para professores
      if (papel === 'professor' && insertError.message.includes('CPF não encontrado')) {
        console.log('\nDetectado erro de CPF para professor. Tentando solução alternativa...');
        
        // 2.1 Tenta inserir primeiro na tabela perfis_professor
        const { error: perfilError } = await adminSupabase
          .from('perfis_professor')
          .insert({
            usuario_id: userId,
            cpf,
            disciplinas: ['Todas'],
            turmas: ['Todas']
          });
          
        if (perfilError) {
          console.error('Erro ao criar perfil de professor:', perfilError);
          return null;
        }
        
        // 2.2 Tenta novamente inserir o usuário agora que o perfil existe
        const { data: retryUser, error: retryError } = await adminSupabase
          .from('usuarios')
          .insert({
            id: userId,
            email,
            senha_hash,
            papel,
            cpf,
            criado_em: new Date().toISOString()
          })
          .select('id, email, papel, cpf')
          .single();
          
        if (retryError) {
          console.error('Erro ao inserir usuário após criar perfil de professor:', retryError);
          return null;
        }
        
        console.log('✅ Usuário professor criado com sucesso após criar perfil!');
        return retryUser;
      }
      
      return null;
    }
    
    console.log('✅ Usuário inserido na tabela com sucesso!');
    console.log('Dados na tabela:', newUser);
    
    // 3. Para certos papéis, criar também entradas nas tabelas de perfil
    if (papel === 'gestor') {
      console.log('\n3. Criando perfil de gestor...');
      const { error: perfilError } = await adminSupabase
        .from('perfis_gestor')
        .insert({
          usuario_id: userId,
          cargo: 'Gestor Escolar',
          ativo: true
        });
        
      if (perfilError) {
        console.error('Erro ao criar perfil de gestor:', perfilError);
      } else {
        console.log('✅ Perfil de gestor criado com sucesso!');
      }
    }
    
    if (papel === 'professor') {
      console.log('\n3. Criando perfil de professor...');
      const { error: perfilError } = await adminSupabase
        .from('perfis_professor')
        .insert({
          usuario_id: userId,
          cpf,
          disciplinas: ['Todas'],
          turmas: ['Todas'],
          ativo: true
        });
        
      if (perfilError) {
        console.error('Erro ao criar perfil de professor:', perfilError);
      } else {
        console.log('✅ Perfil de professor criado com sucesso!');
      }
    }
    
    console.log('\n✅ Processo concluído com sucesso! ✅');
    console.log(`Um novo usuário foi criado com email ${email} e CPF ${cpf} como senha temporária.`);
    
    return newUser;
  } catch (error) {
    console.error('Erro inesperado durante a criação:', error);
    return null;
  }
}

/**
 * Função principal para criar múltiplos usuários
 */
async function main() {
  try {
    // Criar usuários de diferentes papéis
    const usuarios = [
      { email: 'gestor@sabiarpg.com.br', cpf: '12345678901', papel: 'gestor', nome: 'Gestor SABIÁ RPG' },
      { email: 'professor@sabiarpg.com.br', cpf: '98765432109', papel: 'professor', nome: 'Professor SABIÁ RPG' },
      { email: 'aluno@sabiarpg.com.br', cpf: '11122233344', papel: 'aluno', nome: 'Aluno SABIÁ RPG' }
    ];
    
    console.log('Iniciando criação de usuários de teste...\n');
    
    for (const usuario of usuarios) {
      console.log(`\n=== Criando usuário: ${usuario.email} (${usuario.papel}) ===\n`);
      const result = await criarUsuarioDireto(usuario.email, usuario.cpf, usuario.papel, usuario.nome);
      
      if (result) {
        console.log(`✅ Usuário ${usuario.email} criado com sucesso!\n`);
      } else {
        console.log(`❌ Falha ao criar usuário ${usuario.email}\n`);
      }
    }
    
    console.log('\n✅ Processo completo! ✅');
    console.log('Usuários de teste foram criados. Use o CPF como senha para login.');
    
  } catch (error) {
    console.error('Erro ao executar script:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
main();