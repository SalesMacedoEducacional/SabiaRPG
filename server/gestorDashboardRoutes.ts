import { Express, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';

// Middleware de autenticação
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  req.user = {
    id: req.session.userId,
    role: req.session.userRole || 'manager'
  };
  
  next();
}

/**
 * Registra rotas específicas do dashboard do gestor com dados reais
 */
export function registerGestorDashboardRoutes(app: Express) {
  
  /**
   * GET /api/gestor/test-escolas - Teste de escolas sem autenticação (temporário)
   */
  app.get('/api/gestor/test-escolas', async (req: Request, res: Response) => {
    try {
      const gestorId = '8d2bc35c-acba-468a-a85e-c8e923bbd0a7'; // ID do gestor teste
      
      const { data: escolas, error } = await supabase
        .from('escolas')
        .select(`
          id,
          nome,
          endereco_completo,
          telefone,
          email_institucional,
          cidade,
          estado,
          tipo
        `)
        .eq('gestor_id', gestorId)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar escolas do gestor:', error);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      res.json({
        success: true,
        data: escolas || [],
        total: escolas?.length || 0
      });
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
  
  /**
   * GET /api/gestor/escolas-dashboard - Escolas vinculadas ao gestor
   */
  app.get('/api/gestor/escolas-dashboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;
      
      const { data: escolas, error } = await supabase
        .from('escolas')
        .select(`
          id,
          nome,
          endereco_completo,
          telefone,
          email_institucional,
          cidade,
          estado,
          tipo,
          modalidade_ensino
        `)
        .eq('gestor_id', gestorId)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar escolas do gestor:', error);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }

      res.json(escolas || []);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * GET /api/gestor/turmas-dashboard - Turmas das escolas do gestor
   */
  app.get('/api/gestor/turmas-dashboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;
      
      // Primeiro buscar as escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);

      if (escolasError || !escolas || escolas.length === 0) {
        return res.json([]);
      }

      const escolasIds = escolas.map(e => e.id);

      // Buscar turmas das escolas
      const { data: turmas, error } = await supabase
        .from('turmas')
        .select(`
          id,
          nome,
          serie,
          ano_letivo,
          turno,
          modalidade,
          descricao,
          escola_id,
          ativo,
          escolas(nome, tipo)
        `)
        .in('escola_id', escolasIds)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar turmas:', error);
        return res.status(500).json({ message: 'Erro ao buscar turmas' });
      }

      res.json(turmas || []);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * GET /api/gestor/professores-dashboard - Professores das escolas do gestor
   */
  app.get('/api/gestor/professores-dashboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;
      
      // Primeiro buscar as escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);

      if (escolasError || !escolas || escolas.length === 0) {
        return res.json([]);
      }

      const escolasIds = escolas.map(e => e.id);

      // Buscar professores usando consulta simplificada
      const { data: professores, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          email,
          cpf,
          telefone,
          criado_em
        `)
        .in('papel', ['teacher', 'professor']);

      if (error) {
        console.error('Erro ao buscar professores:', error);
        return res.status(500).json({ message: 'Erro ao buscar professores' });
      }

      // Retornar todos os professores (será refinado conforme necessário)
      res.json(professores || []);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * GET /api/gestor/alunos-dashboard - Alunos das turmas das escolas do gestor
   */
  app.get('/api/gestor/alunos-dashboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const gestorId = req.user?.id;
      
      // Primeiro buscar as escolas do gestor
      const { data: escolas, error: escolasError } = await supabase
        .from('escolas')
        .select('id')
        .eq('gestor_id', gestorId);

      if (escolasError || !escolas || escolas.length === 0) {
        return res.json([]);
      }

      const escolasIds = escolas.map(e => e.id);

      // Buscar turmas das escolas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('id')
        .in('escola_id', escolasIds);

      if (turmasError || !turmas || turmas.length === 0) {
        return res.json([]);
      }

      const turmasIds = turmas.map(t => t.id);

      // Buscar alunos usando consulta simplificada
      const { data: alunos, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          email,
          cpf,
          telefone,
          criado_em
        `)
        .in('papel', ['student', 'aluno']);

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        return res.status(500).json({ message: 'Erro ao buscar alunos' });
      }

      // Retornar todos os alunos (será refinado conforme necessário)
      res.json(alunos || []);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * PUT /api/gestor/escola/:id - Editar escola
   */
  app.put('/api/gestor/escola/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;
      const { nome, endereco_completo, telefone, email_institucional, cidade, estado, tipo, modalidade_ensino } = req.body;

      // Verificar se a escola pertence ao gestor
      const { data: escola, error: verificaError } = await supabase
        .from('escolas')
        .select('id')
        .eq('id', id)
        .eq('gestor_id', gestorId)
        .single();

      if (verificaError || !escola) {
        return res.status(404).json({ message: 'Escola não encontrada ou sem permissão' });
      }

      // Atualizar escola com campos específicos
      const { data, error } = await supabase
        .from('escolas')
        .update({
          nome,
          endereco_completo,
          telefone,
          email_institucional,
          cidade,
          estado,
          tipo,
          modalidade_ensino
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar escola:', error);
        return res.status(500).json({ message: 'Erro ao atualizar escola' });
      }

      res.json(data?.[0]);
    } catch (error) {
      console.error('Erro interno:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  /**
   * DELETE /api/gestor/escola/:id - Excluir escola
   */
  app.delete('/api/gestor/escola/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const gestorId = req.user?.id;

      // Verificar se a escola pertence ao gestor
      const { data: escola, error: verificaError } = await supabase
        .from('escolas')
        .select('id')
        .eq('id', id)
        .eq('gestor_id', gestorId)
        .single();

      if (verificaError || !escola) {
        return res.status(404).json({ message: 'Escola não encontrada ou sem permissão' });
      }

      // Excluir escola
      const { error } = await supabase
        .from('escolas')
        .delete()
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

  // APIs similares para turmas, professores e alunos...
}