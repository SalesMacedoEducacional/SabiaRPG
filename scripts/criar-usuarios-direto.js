import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { createHash, randomBytes } from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

// Carregar variáveis de ambiente
dotenv.config();

// Cliente PostgreSQL direto (bypassa RLS completamente)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cliente Supabase para Auth
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
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
    
    console.log('Iniciando criação de usuário diretamente via pool:', { email, papel, nome });
    
    // 1. Gerar hash da senha (CPF)
    console.log('\n1. Gerando hash do CPF para senha...');
    const senha_hash = await hashPassword(cpf);
    console.log('Hash gerado (primeiros 20 caracteres):', senha_hash.substring(0, 20) + '...');
    
    // 2. Inserir o usuário diretamente via cliente PostgreSQL
    console.log('\n2. Inserindo usuário diretamente...');
    
    const insertQuery = {
      text: `
        INSERT INTO usuarios (id, email, senha_hash, papel, cpf, criado_em)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, email, papel, cpf
      `,
      values: [userId, email, senha_hash, papel, cpf]
    };
    
    const result = await pool.query(insertQuery);
    
    if (result.rows.length === 0) {
      console.error('Erro: Nenhum usuário inserido');
      return null;
    }
    
    console.log('✅ Usuário inserido com sucesso!');
    console.log('Dados retornados:', result.rows[0]);
    
    // 3. Para certos papéis, criar também entradas nas tabelas de perfil
    if (papel === 'gestor') {
      console.log('\n3. Criando perfil de gestor...');
      
      const perfilQuery = {
        text: `
          INSERT INTO perfis_gestor (id, usuario_id, cargo, ativo, criado_em)
          VALUES ($1, $2, $3, $4, NOW())
        `,
        values: [randomUUID(), userId, 'Gestor Escolar', true]
      };
      
      try {
        await pool.query(perfilQuery);
        console.log('✅ Perfil de gestor criado com sucesso!');
      } catch (perfilError) {
        console.error('Erro ao criar perfil de gestor:', perfilError);
        
        // Se a tabela não existir, tentar criá-la
        if (perfilError.code === '42P01') { // relação não existe
          console.log('⚠️ Tabela perfis_gestor não existe, tentando criar...');
          await pool.query(`
            CREATE TABLE IF NOT EXISTS perfis_gestor (
              id UUID PRIMARY KEY,
              usuario_id UUID NOT NULL REFERENCES usuarios(id),
              cargo TEXT,
              ativo BOOLEAN DEFAULT TRUE,
              criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          
          // Tentar inserir novamente
          await pool.query(perfilQuery);
          console.log('✅ Tabela criada e perfil de gestor inserido!');
        }
      }
    }
    
    if (papel === 'professor') {
      console.log('\n3. Criando perfil de professor...');
      
      const perfilQuery = {
        text: `
          INSERT INTO perfis_professor (id, usuario_id, disciplinas, turmas, ativo, criado_em)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `,
        values: [randomUUID(), userId, ['Todas'], ['Todas'], true]
      };
      
      try {
        await pool.query(perfilQuery);
        console.log('✅ Perfil de professor criado com sucesso!');
      } catch (perfilError) {
        console.error('Erro ao criar perfil de professor:', perfilError);
        
        // Se a tabela não existir, tentar criá-la
        if (perfilError.code === '42P01') { // relação não existe
          console.log('⚠️ Tabela perfis_professor não existe, tentando criar...');
          await pool.query(`
            CREATE TABLE IF NOT EXISTS perfis_professor (
              id UUID PRIMARY KEY,
              usuario_id UUID NOT NULL REFERENCES usuarios(id),
              disciplinas TEXT[],
              turmas TEXT[],
              ativo BOOLEAN DEFAULT TRUE,
              criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          
          // Tentar inserir novamente
          await pool.query(perfilQuery);
          console.log('✅ Tabela criada e perfil de professor inserido!');
        }
      }
    }
    
    console.log('\n✅ Processo concluído com sucesso! ✅');
    console.log(`Um novo usuário foi criado com email ${email} e CPF ${cpf} como senha temporária.`);
    
    return { id: userId, email, papel, cpf };
  } catch (error) {
    console.error('Erro inesperado durante a criação direta:', error);
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
    
    console.log('Iniciando criação de usuários direto no banco...\n');
    
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
    // Fechar a conexão com o pool
    await pool.end();
    process.exit(0);
  }
}

// Executar o script
main();