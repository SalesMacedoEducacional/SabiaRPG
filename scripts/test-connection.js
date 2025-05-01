import { supabase } from '../db/supabase.js';

async function testConnection() {
  console.log('🔄 Iniciando teste de conexão com o Supabase...');
  const { data: usuarios, error: err1 } = await supabase
    .from('usuarios')
    .select('*')
    .limit(1);
  if (err1) {
    console.error('❌ Erro ao consultar tabela usuarios:', err1.message);
  } else {
    console.log('✅ Consulta em usuarios retornou:', usuarios);
  }

  const { data: matriculas, error: err2 } = await supabase
    .from('matriculas')
    .select('*')
    .limit(1);
  if (err2) {
    console.error('❌ Erro ao consultar tabela matriculas:', err2.message);
  } else {
    console.log('✅ Consulta em matriculas retornou:', matriculas);
  }
}

testConnection();