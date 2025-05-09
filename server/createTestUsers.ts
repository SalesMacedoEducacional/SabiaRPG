/**
 * Rota para criar usuários de teste no sistema
 * Este arquivo adiciona uma rota específica para criar os seguintes usuários:
 * - Aluno: aluno@sabiarpg.edu.br / Senha@123
 * - Professor: professor@sabiarpg.edu.br / Senha@123
 * - Gestor: gestor@sabiarpg.edu.br / Senha@123
 */

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Inicializa o cliente Supabase com a chave de serviço para operações administrativas
const adminSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Dados dos usuários de teste
const testUsers = [
  {
    email: 'aluno@sabiarpg.edu.br',
    password: 'Senha@123',
    papel: 'aluno',
    full_name: 'Aluno Teste'
  },
  {
    email: 'professor@sabiarpg.edu.br',
    password: 'Senha@123',
    papel: 'professor',
    full_name: 'Professor Teste'
  },
  {
    email: 'gestor@sabiarpg.edu.br',
    password: 'Senha@123',
    papel: 'gestor',
    full_name: 'Gestor Teste'
  }
];

/**
 * Cria um usuário de teste no Supabase Auth e na tabela usuarios
 */
async function createTestUser(userData: any) {
  try {
    // 1. Verifica se o usuário já existe no Auth
    const { data: existingAuthUser } = await adminSupabase.auth.admin.listUsers();
    const authUserExists = existingAuthUser.users.some(user => user.email === userData.email);
    
    let userId;
    
    // 2. Cadastrar no Auth se não existir
    if (!authUserExists) {
      console.log(`Criando usuário de autenticação: ${userData.email}`);
      
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Confirma o email automaticamente
      });
      
      if (authError) {
        console.error(`Erro ao criar usuário de autenticação ${userData.email}:`, authError);
        return null;
      }
      
      userId = authUser.user.id;
      console.log(`Usuário de autenticação criado com sucesso: ${userData.email} (ID: ${userId})`);
    } else {
      console.log(`Usuário de autenticação já existe: ${userData.email}`);
      
      // Obter o ID do usuário existente
      const existingUser = existingAuthUser.users.find(user => user.email === userData.email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        return null;
      }
    }
    
    // 3. Verificar se o usuário já existe na tabela usuarios
    const { data: existingDbUsers, error: dbQueryError } = await adminSupabase
      .from('usuarios')
      .select('*')
      .eq('email', userData.email);
      
    if (dbQueryError) {
      console.error(`Erro ao verificar usuário no banco: ${userData.email}:`, dbQueryError);
      return null;
    }
    
    // 4. Inserir na tabela usuarios se não existir
    if (!existingDbUsers || existingDbUsers.length === 0) {
      console.log(`Inserindo usuário no banco de dados: ${userData.email}`);
      
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const { error: insertError } = await adminSupabase
        .from('usuarios')
        .insert([{
          id: userId,
          email: userData.email,
          senha_hash: hashedPassword,
          papel: userData.papel,
        }]);
        
      if (insertError) {
        console.error(`Erro ao inserir usuário no banco ${userData.email}:`, insertError);
        return null;
      }
      
      console.log(`Usuário inserido no banco com sucesso: ${userData.email}`);
    } else {
      console.log(`Usuário já existe no banco de dados: ${userData.email}`);
    }
    
    return {
      id: userId,
      email: userData.email,
      papel: userData.papel
    };
  } catch (error) {
    console.error(`Erro ao processar usuário ${userData.email}:`, error);
    return null;
  }
}

/**
 * Função principal que cria todos os usuários de teste
 */
export async function createAllTestUsers() {
  console.log('Iniciando criação de usuários de teste...');
  
  const results = [];
  
  for (const userData of testUsers) {
    console.log(`\nProcessando usuário: ${userData.email} (${userData.papel})`);
    const result = await createTestUser(userData);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\nProcesso de criação de usuários de teste concluído!');
  return results;
}

/**
 * Handler da rota para criar usuários de teste
 */
export async function createTestUsersHandler(req: Request, res: Response) {
  try {
    // Verifica se é ambiente de desenvolvimento ou se tem uma flag especial
    const isDevOrAllowed = process.env.NODE_ENV === 'development' || req.query.force === 'true';
    
    if (!isDevOrAllowed) {
      return res.status(403).json({ 
        success: false, 
        message: 'Esta operação só é permitida em ambiente de desenvolvimento' 
      });
    }
    
    const results = await createAllTestUsers();
    
    return res.status(200).json({
      success: true,
      message: 'Usuários de teste criados com sucesso',
      users: results
    });
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar usuários de teste'
    });
  }
}