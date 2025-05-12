import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cliente Supabase com chave de serviço para operações administrativas
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  next();
};

// Middleware para verificar se o usuário é um gestor
const isManager = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  if (req.user.role !== 'gestor' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem acessar esta rota.' });
  }
  
  next();
};

/**
 * Rota: Obter as escolas vinculadas ao gestor
 * Método: GET
 * Acesso: Somente gestores
 */
router.get('/escolas', isAuthenticated, isManager, async (req, res) => {
  try {
    // Buscar todas as escolas onde o gestor_id é o ID do usuário logado e ativa = true
    const { data: escolas, error } = await supabase
      .from('escolas')
      .select('*, cidades(nome)')
      .eq('gestor_id', req.user.id)
      .eq('ativo', true);
    
    if (error) {
      console.error('Erro ao buscar escolas do gestor:', error);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: error.message });
    }
    
    return res.status(200).json({ 
      total: escolas.length,
      escolas
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
    // Primeiro, buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id)
      .eq('ativo', true);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, professores: [] });
    }
    
    // Obter os IDs das escolas para filtrar professores
    const escolaIds = escolas.map(escola => escola.id);
    
    // Buscar todos os professores vinculados a essas escolas
    const { data: professores, error: professoresError } = await supabase
      .from('perfis_professor')
      .select('*, usuarios(nome_completo, cpf, telefone)')
      .in('escola_id', escolaIds)
      .eq('ativo', true);
    
    if (professoresError) {
      console.error('Erro ao buscar professores:', professoresError);
      return res.status(500).json({ message: 'Erro ao buscar professores', error: professoresError.message });
    }
    
    return res.status(200).json({ 
      total: professores.length,
      professores
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
    // Primeiro, buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id)
      .eq('ativo', true);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, alunos: [] });
    }
    
    // Obter os IDs das escolas
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
    
    // Obter os IDs das turmas
    const turmaIds = turmas.map(turma => turma.id);
    
    // Buscar todos os alunos vinculados a essas turmas, ordenados por turma
    const { data: alunos, error: alunosError } = await supabase
      .from('perfis_aluno')
      .select(`
        *, 
        usuarios(nome_completo),
        turmas(nome),
        matriculas(numero_matricula)
      `)
      .in('turma_id', turmaIds)
      .eq('ativo', true)
      .order('turma_id');
    
    if (alunosError) {
      console.error('Erro ao buscar alunos:', alunosError);
      return res.status(500).json({ message: 'Erro ao buscar alunos', error: alunosError.message });
    }
    
    return res.status(200).json({ 
      total: alunos.length,
      alunos
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
    // Primeiro, buscar todas as escolas do gestor
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id')
      .eq('gestor_id', req.user.id)
      .eq('ativo', true);
    
    if (escolasError) {
      console.error('Erro ao buscar escolas do gestor:', escolasError);
      return res.status(500).json({ message: 'Erro ao buscar escolas', error: escolasError.message });
    }
    
    if (!escolas || escolas.length === 0) {
      return res.status(200).json({ total: 0, turmas: [] });
    }
    
    // Obter os IDs das escolas
    const escolaIds = escolas.map(escola => escola.id);
    
    // Buscar todas as turmas dessas escolas
    const { data: turmas, error: turmasError } = await supabase
      .from('turmas')
      .select('*')
      .in('escola_id', escolaIds);
    
    if (turmasError) {
      console.error('Erro ao buscar turmas:', turmasError);
      return res.status(500).json({ message: 'Erro ao buscar turmas', error: turmasError.message });
    }
    
    // Para cada turma, obter a contagem de alunos
    const turmasComAlunos = await Promise.all(turmas.map(async (turma) => {
      const { count, error: countError } = await supabase
        .from('perfis_aluno')
        .select('*', { count: 'exact', head: true })
        .eq('turma_id', turma.id)
        .eq('ativo', true);
      
      return {
        ...turma,
        total_alunos: countError ? 0 : count || 0
      };
    }));
    
    return res.status(200).json({ 
      total: turmas.length,
      turmas: turmasComAlunos
    });
  } catch (error) {
    console.error('Erro ao processar solicitação de turmas:', error);
    return res.status(500).json({ message: 'Erro interno ao processar solicitação' });
  }
});

export default router;