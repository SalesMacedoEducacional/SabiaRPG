// Script para verificar se há problemas de RLS na tabela estados
import { supabase } from '../db/supabase.js';

async function verificarRlsEstados() {
  try {
    console.log('TESTE 1: Verificando tabela estados com cliente padrão do Supabase');
    const { data: estados, error } = await supabase
      .from('estados')
      .select('*')
      .limit(5);
    
    console.log('Resultado com cliente padrão:', {
      sucesso: !error,
      total: estados?.length || 0,
      erro: error ? error.message : null,
      primeiros: estados?.slice(0, 3) || []
    });
    
    // Tentar com os parâmetros exatos da rota
    console.log('\nTESTE 2: Verificando com select específico como na rota');
    const { data: estadosRota, error: errorRota } = await supabase
      .from('estados')
      .select('id, nome')
      .order('nome');
    
    console.log('Resultado com query da rota:', {
      sucesso: !errorRota,
      total: estadosRota?.length || 0,
      erro: errorRota ? errorRota.message : null,
      primeiros: estadosRota?.slice(0, 3) || []
    });
    
    // Se tiver acesso ao banco de dados via SQL
    console.log('\nTESTE 3: Verificando permissões RLS na tabela estados');
    const { data: permissoes, error: permissoesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'estados');
    
    console.log('Políticas RLS para estados:', {
      sucesso: !permissoesError,
      total: permissoes?.length || 0,
      politicas: permissoes || [],
      erro: permissoesError ? permissoesError.message : null
    });
    
  } catch (err) {
    console.error('Erro geral ao verificar tabela estados:', err);
  }
}

verificarRlsEstados();