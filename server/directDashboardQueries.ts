import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getGestorDashboardData(gestorId: string) {
  try {
    console.log('Buscando dados do dashboard para gestor:', gestorId);

    // Buscar escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .rpc('get_gestor_escolas', { gestor_uuid: gestorId });

    if (escolasError) {
      console.log('Erro ao buscar escolas via RPC, tentando consulta direta...');
      
      // Fallback para consulta direta
      const { data: escolasDirect, error: escolasDirectError } = await supabase
        .from('escolas')
        .select('*')
        .eq('gestor_id', gestorId);

      if (escolasDirectError) {
        console.error('Erro na consulta direta de escolas:', escolasDirectError);
        return {
          escolas: [],
          turmas: [],
          professores: [],
          alunos: []
        };
      }

      const escolas = escolasDirect || [];
      console.log('Escolas encontradas via consulta direta:', escolas.length);

      // Buscar turmas das escolas
      let turmas = [];
      if (escolas.length > 0) {
        const escolasIds = escolas.map(e => e.id);
        const { data: turmasData, error: turmasError } = await supabase
          .from('turmas')
          .select('*')
          .in('escola_id', escolasIds)
          .eq('ativo', true);

        if (!turmasError) {
          turmas = turmasData || [];
        }
      }

      // Buscar todos os professores
      const { data: professores, error: professorError } = await supabase
        .from('usuarios')
        .select('*')
        .in('papel', ['teacher', 'professor']);

      // Buscar todos os alunos
      const { data: alunos, error: alunoError } = await supabase
        .from('usuarios')
        .select('*')
        .in('papel', ['student', 'aluno']);

      return {
        escolas: escolas || [],
        turmas: turmas || [],
        professores: professores || [],
        alunos: alunos || []
      };
    }

    // Se a RPC funcionou, processar os dados
    return {
      escolas: escolas || [],
      turmas: [],
      professores: [],
      alunos: []
    };

  } catch (error) {
    console.error('Erro geral ao buscar dados do dashboard:', error);
    return {
      escolas: [],
      turmas: [],
      professores: [],
      alunos: []
    };
  }
}