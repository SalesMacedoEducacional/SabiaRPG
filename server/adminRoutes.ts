import { Express, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';

// Middleware de autenticação personalizado
export function authenticateAdmin(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  // Adicionar dados do usuário à requisição
  req.user = {
    id: req.session.userId,
    role: req.session.userRole || 'manager'
  };
  
  next();
}

// Middleware para verificar se é gestor
export function requireManager(req: Request, res: Response, next: Function) {
  if (req.user?.role !== 'manager' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem acessar esta funcionalidade.' });
  }
  next();
}

/**
 * Registra todas as rotas do painel administrativo do gestor
 */
export function registerAdminRoutes(app: Express) {
  
  // ===== ESCOLAS =====
  
  /**
   * GET /api/escolas - Lista todas as escolas do gestor
   */
  app.get('/api/escolas', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;
      
      const { data: escolas, error } = await supabase
        .from('escolas')
        .select(`
          *,
          cidades(nome),
          estados(nome, sigla)
        `)
        .eq('gestor_id', gestorId)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar escolas:', error);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      res.json({
        total: escolas?.length || 0,
        escolas: escolas || []
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * GET /api/escolas/:id - Detalhes de uma escola específica
   */
  app.get('/api/escolas/:id', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;

      const { data: escola, error } = await supabase
        .from('escolas')
        .select(`
          *,
          cidades(nome),
          estados(nome, sigla)
        `)
        .eq('id', id)
        .eq('gestor_id', gestorId)
        .single();

      if (error || !escola) {
        return res.status(404).json({ message: 'Escola não encontrada' });
      }

      res.json(escola);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * PUT /api/escolas/:id - Editar escola
   */
  app.put('/api/escolas/:id', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;
      const updateData = req.body;

      // Verificar se a escola pertence ao gestor
      const { data: escola, error: checkError } = await supabase
        .from('escolas')
        .select('id')
        .eq('id', id)
        .eq('gestor_id', gestorId)
        .single();

      if (checkError || !escola) {
        return res.status(404).json({ message: 'Escola não encontrada' });
      }

      // Atualizar escola
      const { data, error } = await supabase
        .from('escolas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar escola:', error);
        return res.status(500).json({ message: 'Erro ao atualizar escola' });
      }

      res.json({ message: 'Escola atualizada com sucesso', data });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * DELETE /api/escolas/:id - Excluir escola
   */
  app.delete('/api/escolas/:id', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;

      // Verificar se a escola pertence ao gestor
      const { data: escola, error: checkError } = await supabase
        .from('escolas')
        .select('id')
        .eq('id', id)
        .eq('gestor_id', gestorId)
        .single();

      if (checkError || !escola) {
        return res.status(404).json({ message: 'Escola não encontrada' });
      }

      // Marcar como inativa em vez de excluir
      const { error } = await supabase
        .from('escolas')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir escola:', error);
        return res.status(500).json({ message: 'Erro ao excluir escola' });
      }

      res.json({ message: 'Escola excluída com sucesso' });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== TURMAS =====

  /**
   * GET /api/turmas - Lista todas as turmas das escolas do gestor
   */
  app.get('/api/turmas', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;

      // Buscar escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId)
        .eq('ativo', true);

      if (escolasError) {
        console.error('Erro ao buscar escolas:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      if (!escolas || escolas.length === 0) {
        return res.json({ total: 0, turmas: [] });
      }

      const escolaIds = escolas.map(e => e.id);

      // Buscar turmas das escolas
      const { data: turmas, error } = await supabase
        .from('turmas')
        .select(`
          *,
          escolas(nome)
        `)
        .in('escola_id', escolaIds)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar turmas:', error);
        return res.status(500).json({ message: 'Erro ao buscar turmas' });
      }

      res.json({
        total: turmas?.length || 0,
        turmas: turmas || []
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * GET /api/turmas/:id - Detalhes de uma turma específica
   */
  app.get('/api/turmas/:id', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;

      const { data: turma, error } = await supabase
        .from('turmas')
        .select(`
          *,
          escolas!inner(id, nome, gestor_id)
        `)
        .eq('id', id)
        .eq('escolas.gestor_id', gestorId)
        .single();

      if (error || !turma) {
        return res.status(404).json({ message: 'Turma não encontrada' });
      }

      res.json(turma);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== PROFESSORES =====

  /**
   * GET /api/professores - Lista todos os professores das escolas do gestor
   */
  app.get('/api/professores', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;

      // Buscar escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId)
        .eq('ativo', true);

      if (escolasError) {
        console.error('Erro ao buscar escolas:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      if (!escolas || escolas.length === 0) {
        return res.json({ total: 0, professores: [] });
      }

      const escolaIds = escolas.map(e => e.id);

      // Buscar professores das escolas
      const { data: professores, error } = await supabase
        .from('perfis_professor')
        .select(`
          *,
          usuarios(id, nome, email, cpf, telefone, papel),
          escolas(nome)
        `)
        .in('escola_id', escolaIds)
        .order('usuarios(nome)');

      if (error) {
        console.error('Erro ao buscar professores:', error);
        return res.status(500).json({ message: 'Erro ao buscar professores' });
      }

      res.json({
        total: professores?.length || 0,
        professores: professores || []
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== ALUNOS =====

  /**
   * GET /api/alunos - Lista todos os alunos das turmas das escolas do gestor
   */
  app.get('/api/alunos', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;

      // Buscar escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId)
        .eq('ativo', true);

      if (escolasError) {
        console.error('Erro ao buscar escolas:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      if (!escolas || escolas.length === 0) {
        return res.json({ total: 0, alunos: [] });
      }

      const escolaIds = escolas.map(e => e.id);

      // Buscar turmas das escolas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('id')
        .in('escola_id', escolaIds)
        .eq('ativo', true);

      if (turmasError) {
        console.error('Erro ao buscar turmas:', turmasError);
        return res.status(500).json({ message: 'Erro ao buscar turmas' });
      }

      if (!turmas || turmas.length === 0) {
        return res.json({ total: 0, alunos: [] });
      }

      const turmaIds = turmas.map(t => t.id);

      // Buscar alunos das turmas
      const { data: alunos, error } = await supabase
        .from('perfis_aluno')
        .select(`
          *,
          usuarios(id, nome, email, cpf, telefone, papel),
          turmas(nome, escola_id, escolas(nome))
        `)
        .in('turma_id', turmaIds)
        .eq('ativo', true)
        .order('usuarios(nome)');

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        return res.status(500).json({ message: 'Erro ao buscar alunos' });
      }

      res.json({
        total: alunos?.length || 0,
        alunos: alunos || []
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== USUÁRIOS =====

  /**
   * GET /api/usuarios - Lista todos os usuários das escolas do gestor
   */
  app.get('/api/usuarios', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;

      // Buscar todas as escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId)
        .eq('ativo', true);

      if (escolasError) {
        console.error('Erro ao buscar escolas:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      if (!escolas || escolas.length === 0) {
        return res.json({ total: 0, usuarios: [] });
      }

      const escolaIds = escolas.map(e => e.id);

      // Buscar usuários vinculados às escolas (professores e alunos via perfis)
      const [
        { data: professores, error: profError },
        { data: turmas, error: turmasError }
      ] = await Promise.all([
        supabase
          .from('perfis_professor')
          .select('usuario_id, escola_id')
          .in('escola_id', escolaIds),
        supabase
          .from('turmas')
          .select('id, escola_id')
          .in('escola_id', escolaIds)
      ]);

      if (profError || turmasError) {
        console.error('Erro ao buscar vínculos:', profError || turmasError);
        return res.status(500).json({ message: 'Erro ao buscar vínculos de usuários' });
      }

      const usuarioIds = new Set();
      
      // IDs dos professores
      professores?.forEach(p => usuarioIds.add(p.usuario_id));

      // IDs dos alunos via turmas
      if (turmas && turmas.length > 0) {
        const turmaIds = turmas.map(t => t.id);
        const { data: alunos } = await supabase
          .from('perfis_aluno')
          .select('usuario_id')
          .in('turma_id', turmaIds);
        
        alunos?.forEach(a => usuarioIds.add(a.usuario_id));
      }

      if (usuarioIds.size === 0) {
        return res.json({ total: 0, usuarios: [] });
      }

      // Buscar dados completos dos usuários
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', Array.from(usuarioIds))
        .order('nome');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return res.status(500).json({ message: 'Erro ao buscar usuários' });
      }

      res.json({
        total: usuarios?.length || 0,
        usuarios: usuarios || []
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== DASHBOARD STATS =====

  /**
   * GET /api/dashboard/stats - Estatísticas do dashboard
   */
  app.get('/api/dashboard/stats', authenticateAdmin, requireManager, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;

      // Buscar escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId)
        .eq('ativo', true);

      if (escolasError) {
        console.error('Erro ao buscar escolas:', escolasError);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      const totalEscolas = escolas?.length || 0;
      
      if (totalEscolas === 0) {
        return res.json({
          totalEscolas: 0,
          totalProfessores: 0,
          totalAlunos: 0,
          totalTurmas: 0
        });
      }

      const escolaIds = escolas.map(e => e.id);

      // Buscar estatísticas em paralelo
      const [
        { data: turmas },
        { data: professores }
      ] = await Promise.all([
        supabase
          .from('turmas')
          .select('id')
          .in('escola_id', escolaIds)
          .eq('ativo', true),
        supabase
          .from('perfis_professor')
          .select('id')
          .in('escola_id', escolaIds)
      ]);

      const totalTurmas = turmas?.length || 0;
      const totalProfessores = professores?.length || 0;

      // Buscar alunos se houver turmas
      let totalAlunos = 0;
      if (totalTurmas > 0) {
        const turmaIds = turmas.map(t => t.id);
        const { data: alunos } = await supabase
          .from('perfis_aluno')
          .select('id')
          .in('turma_id', turmaIds)
          .eq('ativo', true);
        
        totalAlunos = alunos?.length || 0;
      }

      res.json({
        totalEscolas,
        totalProfessores,
        totalAlunos,
        totalTurmas
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
}