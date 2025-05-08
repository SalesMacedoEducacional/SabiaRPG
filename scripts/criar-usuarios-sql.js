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
 * Script para criar um usuário diretamente via SQL
 */
async function criarUsuarioSQL(email, cpf, papel, nomeCompleto = null) {
  try {
    const userId = randomUUID();
    const nome = nomeCompleto || email.split('@')[0];
    
    console.log('Iniciando criação de usuário via SQL direto:', { email, papel, nome });
    
    // 1. Gerar hash da senha (CPF)
    console.log('\n1. Gerando hash do CPF para senha...');
    const senha_hash = await hashPassword(cpf);
    console.log('Hash gerado (primeiros 20 caracteres):', senha_hash.substring(0, 20) + '...');
    
    // 2. Inserir o usuário utilizando SQL direto para contornar qualquer validação na API
    console.log('\n2. Inserindo usuário via SQL direto...');
    
    // Construir a consulta SQL
    const insertSQL = `
      INSERT INTO usuarios (id, email, senha_hash, papel, cpf, criado_em)
      VALUES ('${userId}', '${email}', '${senha_hash}', '${papel}', '${cpf}', NOW())
      RETURNING id, email, papel, cpf;
    `;
    
    // Executar a consulta SQL via função RPC
    const { data, error } = await adminSupabase.rpc('execute_sql_select', {
      sql: insertSQL
    });
    
    if (error) {
      console.error('Erro ao executar SQL de inserção:', error);
      return null;
    }
    
    console.log('✅ Usuário inserido via SQL com sucesso!');
    console.log('Dados retornados:', data);
    
    // 3. Para certos papéis, criar também entradas nas tabelas de perfil
    if (papel === 'gestor') {
      console.log('\n3. Criando perfil de gestor via SQL...');
      const perfilGestorSQL = `
        INSERT INTO perfis_gestor (id, usuario_id, cargo, ativo, criado_em)
        VALUES ('${randomUUID()}', '${userId}', 'Gestor Escolar', true, NOW());
      `;
      
      const { error: perfilError } = await adminSupabase.rpc('execute_sql', {
        sql: perfilGestorSQL
      });
      
      if (perfilError) {
        console.error('Erro ao criar perfil de gestor:', perfilError);
      } else {
        console.log('✅ Perfil de gestor criado com sucesso!');
      }
    }
    
    if (papel === 'professor') {
      console.log('\n3. Criando perfil de professor via SQL...');
      const perfilProfessorSQL = `
        INSERT INTO perfis_professor (id, usuario_id, disciplinas, turmas, ativo, criado_em)
        VALUES ('${randomUUID()}', '${userId}', '{Todas}', '{Todas}', true, NOW());
      `;
      
      const { error: perfilError } = await adminSupabase.rpc('execute_sql', {
        sql: perfilProfessorSQL
      });
      
      if (perfilError) {
        console.error('Erro ao criar perfil de professor:', perfilError);
      } else {
        console.log('✅ Perfil de professor criado com sucesso!');
      }
    }
    
    console.log('\n✅ Processo concluído com sucesso! ✅');
    console.log(`Um novo usuário foi criado com email ${email} e CPF ${cpf} como senha temporária.`);
    
    return { id: userId, email, papel, cpf };
  } catch (error) {
    console.error('Erro inesperado durante a criação via SQL:', error);
    return null;
  }
}

/**
 * Função principal para criar múltiplos usuários
 */
async function main() {
  try {
    // Primeiro criar a função para execução SQL com retorno no banco, se não existir
    console.log('Verificando/criando função SQL necessária...');
    await adminSupabase.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION execute_sql_select(sql TEXT) 
        RETURNS JSON AS $$
        DECLARE
          result JSON;
        BEGIN
          EXECUTE sql INTO result;
          RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Criar usuários de diferentes papéis
    const usuarios = [
      { email: 'gestor@sabiarpg.com.br', cpf: '12345678901', papel: 'gestor', nome: 'Gestor SABIÁ RPG' },
      { email: 'professor@sabiarpg.com.br', cpf: '98765432109', papel: 'professor', nome: 'Professor SABIÁ RPG' },
      { email: 'aluno@sabiarpg.com.br', cpf: '11122233344', papel: 'aluno', nome: 'Aluno SABIÁ RPG' }
    ];
    
    console.log('Iniciando criação de usuários via SQL...\n');
    
    for (const usuario of usuarios) {
      console.log(`\n=== Criando usuário: ${usuario.email} (${usuario.papel}) ===\n`);
      const result = await criarUsuarioSQL(usuario.email, usuario.cpf, usuario.papel, usuario.nome);
      
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