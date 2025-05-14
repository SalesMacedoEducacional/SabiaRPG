// Script para popular a tabela de estados brasileiros no Supabase
import { supabase } from '../db/supabase.js';

// Lista de estados brasileiros
const estadosBrasileiros = [
  { id: 'AC', nome: 'Acre' },
  { id: 'AL', nome: 'Alagoas' },
  { id: 'AP', nome: 'Amapá' },
  { id: 'AM', nome: 'Amazonas' },
  { id: 'BA', nome: 'Bahia' },
  { id: 'CE', nome: 'Ceará' },
  { id: 'DF', nome: 'Distrito Federal' },
  { id: 'ES', nome: 'Espírito Santo' },
  { id: 'GO', nome: 'Goiás' },
  { id: 'MA', nome: 'Maranhão' },
  { id: 'MT', nome: 'Mato Grosso' },
  { id: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 'MG', nome: 'Minas Gerais' },
  { id: 'PA', nome: 'Pará' },
  { id: 'PB', nome: 'Paraíba' },
  { id: 'PR', nome: 'Paraná' },
  { id: 'PE', nome: 'Pernambuco' },
  { id: 'PI', nome: 'Piauí' },
  { id: 'RJ', nome: 'Rio de Janeiro' },
  { id: 'RN', nome: 'Rio Grande do Norte' },
  { id: 'RS', nome: 'Rio Grande do Sul' },
  { id: 'RO', nome: 'Rondônia' },
  { id: 'RR', nome: 'Roraima' },
  { id: 'SC', nome: 'Santa Catarina' },
  { id: 'SP', nome: 'São Paulo' },
  { id: 'SE', nome: 'Sergipe' },
  { id: 'TO', nome: 'Tocantins' }
];

async function popularEstados() {
  try {
    console.log('Verificando se a tabela estados já possui registros...');
    const { data: existingData, error: queryError } = await supabase
      .from('estados')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('Erro ao verificar tabela estados:', queryError);
      return;
    }
    
    // Se já existem registros, perguntar se deseja limpar a tabela primeiro
    if (existingData && existingData.length > 0) {
      console.log('A tabela de estados já possui registros. Limpando antes de inserir novos dados...');
      
      // Limpar tabela
      const { error: deleteError } = await supabase
        .from('estados')
        .delete()
        .neq('id', 'DUMMY'); // Condição sempre verdadeira para deletar todos
      
      if (deleteError) {
        console.error('Erro ao limpar tabela de estados:', deleteError);
        return;
      }
      
      console.log('Tabela de estados limpa com sucesso.');
    }
    
    // Inserir estados
    console.log('Inserindo estados...');
    const { data, error } = await supabase
      .from('estados')
      .insert(estadosBrasileiros);
    
    if (error) {
      console.error('Erro ao inserir estados:', error);
    } else {
      console.log('Estados inseridos com sucesso!');
      
      // Verificar se a inserção funcionou
      const { data: verifyData, error: verifyError } = await supabase
        .from('estados')
        .select('*')
        .order('nome');
      
      if (verifyError) {
        console.error('Erro ao verificar inserção:', verifyError);
      } else {
        console.log(`Total de estados inseridos: ${verifyData.length}`);
        console.log('Primeiros 5 estados:', verifyData.slice(0, 5));
      }
    }
  } catch (err) {
    console.error('Erro ao executar script:', err);
  }
}

// Executar a função
popularEstados();