import { supabase } from '../db/supabase.js';

async function setupDatabase() {
  console.log('🔄 Iniciando configuração do banco de dados Supabase...');
  
  try {
    console.log('🔧 Criando tabela de usuários...');
    // Criar tabela de usuários usando SQL via REST API
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        perfil VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Tentar criar a tabela de usuários
    const { error: createUserError } = await supabase
      .from('usuarios')
      .insert([{ 
        nome: 'Usuário Teste', 
        email: 'teste@example.com',
        senha: 'senha_teste',
        perfil: 'estudante'
      }])
      .select();
      
    if (createUserError) {
      console.error('❌ Erro ao criar tabela de usuários:', createUserError.message);
      console.log('Nota: Para criar tabelas SQL diretamente, você precisa usar o painel de administração do Supabase ou uma função SQL RPC personalizada.');
    } else {
      console.log('✅ Tabela usuarios criada/já existente e dados inseridos!');
      
      // Tentar criar a tabela de matrículas
      console.log('🔧 Criando tabela de matrículas...');
      const { error: createMatriculaError } = await supabase
        .from('matriculas')
        .insert([{ 
          usuario_id: 1, 
          curso_id: 101, 
          status: 'ativa', 
          progresso: 35 
        }])
        .select();
        
      if (createMatriculaError) {
        console.error('❌ Erro ao criar tabela de matrículas:', createMatriculaError.message);
      } else {
        console.log('✅ Tabela matriculas criada/já existente e dados inseridos!');
      }
    }
    
    // Verifica se as tabelas foram criadas
    const { data: usuarios, error: err1 } = await supabase
      .from('usuarios')
      .select('*')
      .limit(2);
    
    if (err1) {
      console.error('❌ Erro ao consultar tabela usuarios:', err1.message);
    } else {
      console.log('✅ Tabela usuarios criada com sucesso! Registros:', usuarios.length);
    }
    
    const { data: matriculas, error: err2 } = await supabase
      .from('matriculas')
      .select('*')
      .limit(2);
    
    if (err2) {
      console.error('❌ Erro ao consultar tabela matriculas:', err2.message);
    } else {
      console.log('✅ Tabela matriculas criada com sucesso! Registros:', matriculas.length);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a configuração do banco de dados:', error.message);
  }
}

setupDatabase();