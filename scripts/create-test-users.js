/**
 * Script para criar usuários de teste no Supabase
 * Este script cria três usuários de teste com diferentes perfis:
 * - Aluno: aluno@sabiarpg.edu.br / Senha@123
 * - Professor: professor@sabiarpg.edu.br / Senha@123
 * - Gestor: gestor@sabiarpg.edu.br / Senha@123
 */
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Verifica se as variáveis de ambiente necessárias estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidos no arquivo .env');
  process.exit(1);
}

// Inicializa o cliente Supabase com a chave de serviço para operações administrativas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
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
async function createTestUser(userData) {
  try {
    // 1. Verifica se o usuário já existe no Auth
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
    const authUserExists = existingAuthUser.users.some(user => user.email === userData.email);
    
    let userId;
    
    // 2. Cadastrar no Auth se não existir
    if (!authUserExists) {
      console.log(`Criando usuário de autenticação: ${userData.email}`);
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Confirma o email automaticamente
      });
      
      if (authError) {
        console.error(`Erro ao criar usuário de autenticação ${userData.email}:`, authError);
        return;
      }
      
      userId = authUser.user.id;
      console.log(`Usuário de autenticação criado com sucesso: ${userData.email} (ID: ${userId})`);
    } else {
      console.log(`Usuário de autenticação já existe: ${userData.email}`);
      
      // Obter o ID do usuário existente
      const existingUser = existingAuthUser.users.find(user => user.email === userData.email);
      userId = existingUser.id;
    }
    
    // 3. Verificar se o usuário já existe na tabela usuarios
    const { data: existingDbUsers, error: dbQueryError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', userData.email);
      
    if (dbQueryError) {
      console.error(`Erro ao verificar usuário no banco: ${userData.email}:`, dbQueryError);
      return;
    }
    
    // 4. Inserir na tabela usuarios se não existir
    if (!existingDbUsers || existingDbUsers.length === 0) {
      console.log(`Inserindo usuário no banco de dados: ${userData.email}`);
      
      // Gerar hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          id: userId,
          email: userData.email,
          senha_hash: hashedPassword,
          papel: userData.papel,
        }]);
        
      if (insertError) {
        console.error(`Erro ao inserir usuário no banco ${userData.email}:`, insertError);
        return;
      }
      
      console.log(`Usuário inserido no banco com sucesso: ${userData.email}`);
    } else {
      console.log(`Usuário já existe no banco de dados: ${userData.email}`);
    }
    
    return userId;
  } catch (error) {
    console.error(`Erro ao processar usuário ${userData.email}:`, error);
  }
}

/**
 * Função principal que cria todos os usuários de teste
 */
async function createAllTestUsers() {
  console.log('Iniciando criação de usuários de teste...');
  
  for (const userData of testUsers) {
    console.log(`\nProcessando usuário: ${userData.email} (${userData.papel})`);
    await createTestUser(userData);
  }
  
  console.log('\nProcesso de criação de usuários de teste concluído!');
}

// Executa a função principal
createAllTestUsers().catch(error => {
  console.error('Erro durante a execução do script:', error);
  process.exit(1);
});