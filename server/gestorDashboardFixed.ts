import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// Middleware para verificar autenticação
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  next();
};

// Middleware para verificar se é gestor
const isManager = (req: any, res: any, next: any) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

/**
 * Rota: Obter todas as escolas do gestor
 * Método: GET
 * Acesso: Somente gestores
 */
router.get('/escolas', isAuthenticated, isManager, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('*')
      .eq('gestor_id', req.user.id);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    return res.status(200).json({ 
      total: escolas?.length || 0,
      escolas: escolas || []
    });
  } catch (error) {
    console.error('Erro ao processar solicitação de escolas:', error);
    return res.status(500).json({ message: 'Erro interno ao processar solicitação' });
  }
});

/**
 * Rota: Obter todos os professores das escolas do gestor
 * Método: GET
 * Acesso: Somente gestores
 */
router.get('/professores', isAuthenticated, isManager, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, professores: [] });
    }
    
    const escolaIds = escolas.map(escola => escola.id);
    console.log('IDs das escolas do gestor:', escolaIds);
    
    // Buscar todos os professores vinculados a essas escolas
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

/**
 * Rota: Obter todos os alunos das escolas do gestor
 * Método: GET
 * Acesso: Somente gestores
 */
router.get('/alunos', isAuthenticated, isManager, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, alunos: [] });
    }
    
    const escolaIds = escolas.map(escola => escola.id);
    
    // Buscar todas as turmas dessas escolas
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
    
    const turmaIds = turmas.map(turma => turma.id);
    console.log('IDs das turmas das escolas do gestor:', turmaIds);
    
    // Buscar todos os alunos vinculados a essas turmas
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

/**
 * Rota: Obter todas as turmas das escolas do gestor
 * Método: GET
 * Acesso: Somente gestores
 */
router.get('/turmas', isAuthenticated, isManager, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, turmas: [] });
    }
    
    const escolaIds = escolas.map(escola => escola.id);
    console.log('IDs das escolas do gestor para turmas:', escolaIds);
    
    // Buscar todas as turmas dessas escolas
    const { data: turmas, error: turmasError } = await supabase
      .from('turmas')
      .select('*')
      .in('escola_id', escolaIds);
      
    console.log('Turmas encontradas:', turmas?.length || 0);
    
    if (turmasError) {
      console.error('Erro ao buscar turmas:', turmasError);
      return res.status(500).json({ message: 'Erro ao buscar turmas', error: turmasError.message });
    }
    
    // Para cada turma, obter a contagem de alunos
    const turmasComAlunos = await Promise.all(turmas?.map(async (turma) => {
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

export default router;