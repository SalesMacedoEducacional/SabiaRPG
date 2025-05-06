import { supabase, initializeDatabase } from '../db/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔄 Iniciando configuração do banco de dados Supabase...');
  
  try {
    // Ler o arquivo SQL para criar as tabelas
    const sqlFilePath = path.join(__dirname, 'create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Tentar inicializar o banco de dados usando a função de execução SQL
    const initialized = await initializeDatabase(sqlContent);
    
    if (!initialized) {
      console.log('⚠️ Não foi possível criar tabelas através de execução SQL direta.');
      console.log('👉 Alternativa: Use o painel administrativo do Supabase para executar o SQL manualmente.');
    }
    
    // Verificar se as tabelas existem tentando inserir dados
    console.log('🔍 Testando conexão com tabelas existentes...');
    
    // Tenta inserir uma escola (a primeira tabela que precisa existir)
    const { data: escolaData, error: escolaError } = await supabase
      .from('escolas')
      .insert([{
        nome: 'Escola Teste SABIÁ',
        codigo_escola: 'SABIA001',
        tipo: 'estadual',
        modalidade_ensino: 'Fundamental e Médio',
        cidade: 'Teresina',
        estado: 'PI',
        zona_geografica: 'urbana',
        endereco_completo: 'Av. Teste, 123',
        telefone: '(86) 99999-9999',
        email_institucional: 'teste@escola.edu.br'
      }])
      .select()
      .maybeSingle();
    
    if (escolaError) {
      if (escolaError.code === '42P01') { // relação não existe
        console.error('❌ Tabela escolas não existe:', escolaError.message);
      } else {
        console.error('❌ Erro ao inserir escola:', escolaError.message);
      }
    } else {
      console.log('✅ Tabela escolas está pronta:', escolaData?.id);
      
      // Tenta inserir um usuário
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{
          email: 'professor@example.com',
          senha_hash: 'senha_hash_temporaria',
          papel: 'professor',
          nome_completo: 'Professor Teste',
          username: 'professor.teste',
          avatar_url: null,
          escola_id: escolaData?.id
        }])
        .select()
        .maybeSingle();
      
      if (usuarioError) {
        console.error('❌ Erro ao inserir usuário:', usuarioError.message);
      } else {
        console.log('✅ Tabela usuarios está pronta:', usuarioData?.id);
      }
    }
    
    // Verifica se algumas tabelas existem consultando-as
    const consultarTabela = async (tabela) => {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        if (error.code === '42P01') {
          console.error(`❌ Tabela ${tabela} não existe`);
        } else {
          console.error(`❌ Erro ao consultar tabela ${tabela}:`, error.message);
        }
        return false;
      } else {
        console.log(`✅ Tabela ${tabela} existe`);
        return true;
      }
    };
    
    // Verificar algumas tabelas principais
    await consultarTabela('escolas');
    await consultarTabela('usuarios');
    await consultarTabela('matriculas');
    await consultarTabela('perfis_aluno');
    await consultarTabela('trilhas');
    await consultarTabela('missoes');
    
    console.log('\n🔧 Resumo da verificação:');
    console.log('1. Se as tabelas não existem, você precisa criar manualmente no painel do Supabase');
    console.log('2. Execute o SQL do arquivo scripts/create-tables.sql no editor SQL do Supabase');
    console.log('3. Verifique se todas as tabelas foram criadas corretamente');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração do banco de dados:', error.message);
  }
}

setupDatabase();