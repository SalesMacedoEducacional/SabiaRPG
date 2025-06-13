import { supabase } from '../db/supabase';
import { Express } from 'express';

export function setupGestorApis(app: Express) {
  // API para turmas do gestor
  app.get('/api/data/turmas-gestor', async (req, res) => {
    try {
      console.log('=== BUSCANDO TURMAS REAIS DO GESTOR ===');
      const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
      
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);
      
      if (escolasError) {
        console.error('Erro ao buscar escolas do gestor:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
      }
      
      if (!escolas || escolas.length === 0) {
        return res.status(200).json({ total: 0, turmas: [] });
      }
      
      const escolaIds = escolas.map((escola: any) => escola.id);
      console.log('IDs das escolas do gestor para turmas:', escolaIds);
      
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('*')
        .in('escola_id', escolaIds);
        
      console.log('Turmas encontradas:', turmas?.length || 0);
      
      if (turmasError) {
        console.error('Erro ao buscar turmas:', turmasError);
        return res.status(500).json({ message: 'Erro ao buscar turmas', error: turmasError.message });
      }
      
      const turmasComAlunos = await Promise.all(turmas?.map(async (turma: any) => {
        const { count, error: countError } = await supabase
          .from('perfis_aluno')
          .select('*', { count: 'exact', head: true })
          .eq('turma_id', turma.id);
        
        if (countError) {
          console.error('Erro ao contar alunos da turma:', countError);
          return { ...turma, total_alunos: 0 };
        }
        
        return { ...turma, total_alunos: count || 0 };
      }) || []);
      
      return res.status(200).json({ 
        total: turmasComAlunos.length,
        turmas: turmasComAlunos
      });
    } catch (error) {
      console.error('Erro ao processar solicitação de turmas:', error);
      return res.status(500).json({ message: 'Erro interno ao processar solicitação' });
    }
  });

  // API para professores do gestor
  app.get('/api/data/professores-gestor', async (req, res) => {
    try {
      console.log('=== BUSCANDO PROFESSORES REAIS DO GESTOR ===');
      const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
      
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);
      
      if (escolasError) {
        console.error('Erro ao buscar escolas do gestor:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
      }
      
      if (!escolas || escolas.length === 0) {
        return res.status(200).json({ total: 0, professores: [] });
      }
      
      const escolaIds = escolas.map((escola: any) => escola.id);
      console.log('IDs das escolas do gestor:', escolaIds);
      
      const { data: professores, error: professoresError } = await supabase
        .from('perfis_professor')
        .select('*, usuarios(nome_completo, cpf, telefone)')
        .in('escola_id', escolaIds);
        
      console.log('Professores encontrados:', professores?.length || 0);
      
      if (professoresError) {
        console.error('Erro ao buscar professores:', professoresError);
        return res.status(500).json({ message: 'Erro ao buscar professores', error: professoresError.message });
      }
      
      return res.status(200).json({ 
        total: professores?.length || 0,
        professores: professores || []
      });
    } catch (error) {
      console.error('Erro ao processar solicitação de professores:', error);
      return res.status(500).json({ message: 'Erro interno ao processar solicitação' });
    }
  });

  // API para alunos do gestor
  app.get('/api/data/alunos-gestor', async (req, res) => {
    try {
      console.log('=== BUSCANDO ALUNOS REAIS DO GESTOR ===');
      const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
      
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);
      
      if (escolasError) {
        console.error('Erro ao buscar escolas do gestor:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
      }
      
      if (!escolas || escolas.length === 0) {
        return res.status(200).json({ total: 0, alunos: [] });
      }
      
      const escolaIds = escolas.map((escola: any) => escola.id);
      
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('id')
        .in('escola_id', escolaIds);
      
      if (turmasError) {
        console.error('Erro ao buscar turmas:', turmasError);
        return res.status(500).json({ message: 'Erro ao buscar turmas', error: turmasError.message });
      }
      
      if (!turmas || turmas.length === 0) {
        return res.status(200).json({ total: 0, alunos: [] });
      }
      
      const turmaIds = turmas.map((turma: any) => turma.id);
      console.log('IDs das turmas das escolas do gestor:', turmaIds);
      
      const { data: alunos, error: alunosError } = await supabase
        .from('perfis_aluno')
        .select(`
          *, 
          usuarios(nome_completo),
          turmas(nome),
          matriculas(numero_matricula)
        `)
        .in('turma_id', turmaIds)
        .order('turma_id');
        
      console.log('Alunos encontrados:', alunos?.length || 0);
      
      if (alunosError) {
        console.error('Erro ao buscar alunos:', alunosError);
        return res.status(500).json({ message: 'Erro ao buscar alunos', error: alunosError.message });
      }
      
      return res.status(200).json({ 
        total: alunos?.length || 0,
        alunos: alunos || []
      });
    } catch (error) {
      console.error('Erro ao processar solicitação de alunos:', error);
      return res.status(500).json({ message: 'Erro interno ao processar solicitação' });
    }
  });
}