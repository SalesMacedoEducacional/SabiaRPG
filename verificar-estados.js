// Script para verificar se a tabela 'estados' existe no Supabase
import { supabase } from './db/supabase.js';

async function verificarTabelaEstados() {
  try {
    console.log('Verificando se a tabela estados existe...');
    const { data, error } = await supabase
      .from('estados')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Erro ao consultar tabela estados:', error);
    } else {
      console.log('Dados da tabela estados:', data);
      console.log(`Total de registros encontrados: ${data?.length || 0}`);
    }
  } catch (err) {
    console.error('Erro ao executar consulta:', err);
  }
}

verificarTabelaEstados();