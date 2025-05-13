import { Request, Response, Express, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import { v4 as uuidv4 } from 'uuid';

// Estendendo o tipo Request para incluir o campo user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        username?: string;
        email?: string;
      };
    }
  }
}

/**
 * Registra todas as rotas específicas para gerenciamento de turmas
 * @param app Express application
 * @param authenticate Middleware de autenticação
 * @param requireRole Middleware de verificação de papel
 */
export function registerClassRoutes(
  app: Express, 
  authenticate: (req: Request, res: Response, next: Function) => void,
  requireRole: (roles: string[]) => (req: Request, res: Response, next: Function) => Promise<void>
) {

  /**
   * Rota para verificar se nome da turma já existe para uma escola/ano
   * Acessível apenas para gestores
   */
  app.get('/api/turmas/verificar-nome', 
    authenticate,
    requireRole(['manager', 'admin']),
    async (req: Request, res: Response) => {
      try {
        const { nome, ano_letivo, escola_id } = req.query;
        
        if (!nome || !ano_letivo || !escola_id) {
          return res.status(400).json({ 
            message: "Parâmetros insuficientes. Informe nome, ano_letivo e escola_id" 
          });
        }

        const { data, error } = await supabase
          .from('turmas')
          .select('id')
          .eq('nome', nome)
          .eq('ano_letivo', ano_letivo)
          .eq('escola_id', escola_id);

        if (error) {
          console.error('Erro ao verificar nome da turma:', error);
          return res.status(500).json({ message: 'Erro ao verificar nome da turma' });
        }

        return res.status(200).json({ 
          disponivel: data.length === 0,
          message: data.length === 0 ? 
            'Nome disponível' : 
            'Já existe uma turma com este nome para este ano letivo'
        });
      } catch (error) {
        console.error('Erro ao verificar nome da turma:', error);
        return res.status(500).json({ message: 'Erro ao verificar nome da turma' });
      }
    }
  );

  /**
   * Rota para listar todas as turmas de uma escola
   * Acessível apenas para gestores
   */
  app.get('/api/turmas', 
    authenticate,
    requireRole(['manager', 'admin', 'teacher']),
    async (req: Request, res: Response) => {
      try {
        const { escola_id } = req.query;
        
        // Se o usuário for gestor, verifica se ele está tentando acessar turmas de uma escola que ele gerencia
        if (req.user && req.user.role === 'manager') {
          const { data: escolasGestor, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao verificar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao verificar escolas do gestor' });
          }
            
          // Se foi especificado um escola_id e o gestor não é gestor desta escola, retorna erro
          if (escola_id && !escolasGestor.some((e: { id: string }) => e.id === escola_id)) {
            return res.status(403).json({ message: 'Você não tem permissão para acessar turmas desta escola' });
          }
            
          // Se não foi especificado escola_id, usa a primeira escola do gestor
          let escolaIdConsulta = escola_id;
          if (!escolaIdConsulta && escolasGestor.length > 0) {
            escolaIdConsulta = escolasGestor[0].id;
          }
            
          // Busca as turmas da escola
          const { data: turmas, error } = await supabase
            .from('turmas')
            .select('*')
            .eq('escola_id', escolaIdConsulta)
            .order('nome');
            
          if (error) {
            console.error('Erro ao buscar turmas:', error);
            return res.status(500).json({ message: 'Erro ao buscar turmas' });
          }
            
          return res.status(200).json(turmas);
        } else {
          // Para administradores, permite filtrar por escola_id opcional
          let query = supabase.from('turmas').select('*');
          
          if (escola_id) {
            query = query.eq('escola_id', escola_id);
          }
          
          const { data: turmas, error } = await query.order('nome');
          
          if (error) {
            console.error('Erro ao buscar turmas:', error);
            return res.status(500).json({ message: 'Erro ao buscar turmas' });
          }
          
          return res.status(200).json(turmas);
        }
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        return res.status(500).json({ message: 'Erro ao buscar turmas' });
      }
    }
  );

  /**
   * Rota para cadastrar uma nova turma
   * Acessível apenas para gestores
   */
  app.post('/api/turmas', 
    authenticate,
    requireRole(['manager', 'admin']),
    async (req: Request, res: Response) => {
      try {
        const {
          nome,
          turno,
          serie,
          modalidade,
          ano_letivo,
          descricao,
          escola_id
        } = req.body;

        // Validação de campos obrigatórios
        if (!nome || !turno || !serie || !modalidade || !ano_letivo || !escola_id) {
          return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        // Validação do ano letivo
        const anoAtual = new Date().getFullYear();
        if (isNaN(Number(ano_letivo)) || Number(ano_letivo) < anoAtual) {
          return res.status(400).json({ message: 'Ano letivo inválido' });
        }

        // Se o usuário for gestor, verifica se ele é gestor da escola informada
        if (req.user && req.user.role === 'manager') {
          const { data: escolasGestor, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao verificar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao verificar escolas do gestor' });
          }
            
          if (!escolasGestor.some((e: { id: string }) => e.id === escola_id)) {
            return res.status(403).json({ message: 'Você não tem permissão para cadastrar turmas nesta escola' });
          }
        }

        // Verificar se já existe uma turma com o mesmo nome na mesma escola para o mesmo ano letivo
        const { data: turmasExistentes, error: verificacaoError } = await supabase
          .from('turmas')
          .select('id')
          .eq('nome', nome_turma)
          .eq('ano_letivo', ano_letivo)
          .eq('escola_id', escola_id);
          
        if (verificacaoError) {
          console.error('Erro ao verificar turmas existentes:', verificacaoError);
          return res.status(500).json({ message: 'Erro ao verificar turmas existentes' });
        }
          
        if (turmasExistentes.length > 0) {
          return res.status(400).json({ 
            message: 'Já existe uma turma com este nome para este ano letivo nesta escola' 
          });
        }

        // Inserir a nova turma
        const novaTurma = {
          id: uuidv4(),
          nome: nome_turma,
          turno,
          serie,
          modalidade,
          ano_letivo: Number(ano_letivo),
          descricao: observacoes || null,
          escola_id,
          ativo: true,
          criado_em: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('turmas')
          .insert([novaTurma])
          .select();

        if (error) {
          console.error('Erro ao cadastrar turma:', error);
          return res.status(500).json({ message: 'Erro ao cadastrar turma' });
        }

        return res.status(201).json(data[0]);
      } catch (error) {
        console.error('Erro ao cadastrar turma:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar turma' });
      }
    }
  );

  /**
   * Rota para obter detalhes de uma turma específica
   * Acessível para gestores, professores e administradores
   */
  app.get('/api/turmas/:id', 
    authenticate,
    requireRole(['manager', 'admin', 'teacher']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const { data: turma, error } = await supabase
          .from('turmas')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao buscar detalhes da turma:', error);
          return res.status(500).json({ message: 'Erro ao buscar detalhes da turma' });
        }

        if (!turma) {
          return res.status(404).json({ message: 'Turma não encontrada' });
        }

        // Se o usuário for gestor, verifica se ele é gestor da escola da turma
        if (req.user && req.user.role === 'manager') {
          const { data: escolasGestor, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao verificar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao verificar escolas do gestor' });
          }
            
          if (!escolasGestor.some(e => e.id === turma.escola_id)) {
            return res.status(403).json({ message: 'Você não tem permissão para acessar esta turma' });
          }
        }

        // Buscar contagem de alunos da turma
        const { count: countAlunos, error: countError } = await supabase
          .from('matriculas')
          .select('*', { count: 'exact', head: true })
          .eq('turma_id', id);

        if (countError) {
          console.error('Erro ao contar alunos da turma:', countError);
        }

        // Adiciona a contagem de alunos à resposta
        const turmaComContagem = {
          ...turma,
          quantidade_atual_alunos: countError ? null : countAlunos
        };

        return res.status(200).json(turmaComContagem);
      } catch (error) {
        console.error('Erro ao buscar detalhes da turma:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes da turma' });
      }
    }
  );

  /**
   * Rota para atualizar uma turma existente
   * Acessível apenas para gestores e administradores
   */
  app.put('/api/turmas/:id', 
    authenticate,
    requireRole(['manager', 'admin']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const {
          nome_turma,
          turno,
          serie,
          modalidade,
          ano_letivo,
          quantidade_maxima_alunos,
          observacoes
        } = req.body;

        // Validação de campos obrigatórios
        if (!nome_turma || !turno || !serie || !modalidade || !ano_letivo) {
          return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        // Buscar a turma existente
        const { data: turmaExistente, error: consultaError } = await supabase
          .from('turmas')
          .select('*')
          .eq('id', id)
          .single();

        if (consultaError || !turmaExistente) {
          console.error('Erro ao buscar turma existente:', consultaError);
          return res.status(404).json({ message: 'Turma não encontrada' });
        }

        // Se o usuário for gestor, verifica se ele é gestor da escola da turma
        if (req.user && req.user.role === 'manager') {
          const { data: escolasGestor, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao verificar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao verificar escolas do gestor' });
          }
            
          if (!escolasGestor.some(e => e.id === turmaExistente.escola_id)) {
            return res.status(403).json({ message: 'Você não tem permissão para editar esta turma' });
          }
        }

        // Verificar se já existe outra turma com o mesmo nome na mesma escola para o mesmo ano letivo
        if (
          nome_turma !== turmaExistente.nome || 
          Number(ano_letivo) !== Number(turmaExistente.ano_letivo)
        ) {
          const { data: turmasExistentes, error: verificacaoError } = await supabase
            .from('turmas')
            .select('id')
            .eq('nome', nome_turma)
            .eq('ano_letivo', ano_letivo)
            .eq('escola_id', turmaExistente.escola_id)
            .neq('id', id);
            
          if (verificacaoError) {
            console.error('Erro ao verificar turmas existentes:', verificacaoError);
            return res.status(500).json({ message: 'Erro ao verificar turmas existentes' });
          }
            
          if (turmasExistentes.length > 0) {
            return res.status(400).json({ 
              message: 'Já existe uma turma com este nome para este ano letivo nesta escola' 
            });
          }
        }

        // Atualizar a turma
        const turmaAtualizada = {
          nome: nome_turma,
          turno,
          serie,
          modalidade,
          ano_letivo: Number(ano_letivo),
          descricao: observacoes || null
        };

        const { data, error } = await supabase
          .from('turmas')
          .update(turmaAtualizada)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Erro ao atualizar turma:', error);
          return res.status(500).json({ message: 'Erro ao atualizar turma' });
        }

        return res.status(200).json(data[0]);
      } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        return res.status(500).json({ message: 'Erro ao atualizar turma' });
      }
    }
  );

  /**
   * Rota para excluir uma turma
   * Acessível apenas para gestores e administradores
   */
  app.delete('/api/turmas/:id', 
    authenticate,
    requireRole(['manager', 'admin']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // Buscar a turma existente
        const { data: turmaExistente, error: consultaError } = await supabase
          .from('turmas')
          .select('*')
          .eq('id', id)
          .single();

        if (consultaError || !turmaExistente) {
          console.error('Erro ao buscar turma existente:', consultaError);
          return res.status(404).json({ message: 'Turma não encontrada' });
        }

        // Se o usuário for gestor, verifica se ele é gestor da escola da turma
        if (req.user && req.user.role === 'manager') {
          const { data: escolasGestor, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao verificar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao verificar escolas do gestor' });
          }
            
          if (!escolasGestor.some(e => e.id === turmaExistente.escola_id)) {
            return res.status(403).json({ message: 'Você não tem permissão para excluir esta turma' });
          }
        }

        // Verificar se há alunos matriculados na turma
        const { count: countAlunos, error: countError } = await supabase
          .from('matriculas')
          .select('*', { count: 'exact', head: true })
          .eq('turma_id', id);

        if (countError) {
          console.error('Erro ao contar alunos da turma:', countError);
          return res.status(500).json({ message: 'Erro ao verificar alunos da turma' });
        }

        if (countAlunos && countAlunos > 0) {
          return res.status(400).json({ 
            message: 'Não é possível excluir esta turma pois há alunos matriculados' 
          });
        }

        // Excluir a turma
        const { error } = await supabase
          .from('turmas')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao excluir turma:', error);
          return res.status(500).json({ message: 'Erro ao excluir turma' });
        }

        return res.status(200).json({ message: 'Turma excluída com sucesso' });
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
        return res.status(500).json({ message: 'Erro ao excluir turma' });
      }
    }
  );
}