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
   * Rota para listar turmas com filtro por escola
   */
  app.get('/api/turmas', 
    authenticate,
    requireRole(['manager', 'admin', 'teacher']),
    async (req: Request, res: Response) => {
      try {
        const { escola_id } = req.query;
        console.log('=== NOVA ROTA /api/turmas ===');
        console.log('Query params:', req.query);
        console.log('User role:', req.user?.role);
        
        // Buscar escolas do gestor
        const { data: escolasGestor, error: escolasError } = await supabase
          .from('escolas')
          .select('id, nome, gestor_id')
          .eq('gestor_id', req.user?.id);
          
        if (escolasError) {
          console.error('Erro ao buscar escolas:', escolasError);
          return res.status(500).json({ message: 'Erro ao buscar escolas' });
        }

        if (!escolasGestor || escolasGestor.length === 0) {
          console.log('Gestor sem escolas vinculadas');
          return res.status(200).json([]);
        }

        let escolaIds = escolasGestor.map(escola => escola.id);
        
        // Filtrar por escola específica se solicitado
        if (escola_id && escola_id !== 'todas') {
          if (escolaIds.includes(escola_id as string)) {
            escolaIds = [escola_id as string];
            console.log('Filtrando por escola específica:', escola_id);
          } else {
            console.log('Escola não pertence ao gestor');
            return res.status(200).json([]);
          }
        }

        // Buscar turmas
        const { data: turmas, error } = await supabase
          .from('turmas')
          .select('*')
          .in('escola_id', escolaIds)
          .order('nome');
          
        if (error) {
          console.error('Erro ao buscar turmas:', error);
          return res.status(500).json({ message: 'Erro ao buscar turmas' });
        }

        console.log(`Retornando ${turmas?.length || 0} turmas filtradas`);
        return res.status(200).json(turmas || []);
        
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
          return res.status(400).json({ 
            message: 'Todos os campos obrigatórios devem ser preenchidos',
            missing_fields: {
              nome: !nome,
              turno: !turno,
              serie: !serie,
              modalidade: !modalidade,
              ano_letivo: !ano_letivo,
              escola_id: !escola_id
            }
          });
        }

        // Validação específica do campo escola_id
        if (!escola_id || escola_id.trim() === '') {
          return res.status(400).json({ 
            message: 'O campo escola_id é obrigatório. A turma deve estar vinculada a uma escola.',
            field: 'escola_id'
          });
        }

        // Validação do ano letivo
        const anoAtual = new Date().getFullYear();
        if (isNaN(Number(ano_letivo)) || Number(ano_letivo) < anoAtual) {
          return res.status(400).json({ message: 'Ano letivo inválido' });
        }

        // Verificar se a escola existe
        console.log('Verificando existência da escola com ID:', escola_id);
        const { data: escolaExistente, error: escolaError } = await supabase
          .from('escolas')
          .select('id, nome, gestor_id')
          .eq('id', escola_id)
          .single();
          
        console.log('Resultado da consulta escola:', { escolaExistente, escolaError });
          
        if (escolaError || !escolaExistente) {
          console.log('Erro: Escola não encontrada ou erro na consulta');
          return res.status(400).json({ 
            message: 'A escola especificada não existe ou não está acessível.',
            field: 'escola_id',
            escola_id: escola_id,
            error_details: escolaError?.message
          });
        }

        // Remover verificação de escola ativa (coluna não existe)

        // Se o usuário for gestor, verifica se ele é gestor da escola informada
        if (req.user && req.user.role === 'manager') {
          if (escolaExistente.gestor_id !== req.user.id) {
            return res.status(403).json({ 
              message: `Você não tem permissão para cadastrar turmas na escola "${escolaExistente.nome}". Apenas o gestor responsável pode realizar esta ação.`,
              escola_nome: escolaExistente.nome,
              gestor_responsavel: escolaExistente.gestor_id
            });
          }
        }

        // Verificar se já existe uma turma com o mesmo nome na mesma escola para o mesmo ano letivo
        const { data: turmasExistentes, error: verificacaoError } = await supabase
          .from('turmas')
          .select('id')
          .eq('nome', nome)
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

        // Inserir a nova turma com validação final do vínculo escola-turma
        const novaTurma = {
          // Removendo o campo id para que o Supabase gere automaticamente
          nome: nome,
          turno,
          serie,
          modalidade,
          ano_letivo: Number(ano_letivo),
          descricao: descricao || null,
          escola_id, // Garantir que este campo seja sempre preenchido
          criado_em: new Date().toISOString()
        };
        
        // Log detalhado para confirmar o vínculo
        console.log('=== CADASTRO DE TURMA COM VÍNCULO OBRIGATÓRIO ===');
        console.log('Dados da turma a ser cadastrada:', novaTurma);
        console.log('Escola vinculada:', escolaExistente.nome);
        console.log('Gestor responsável:', req.user?.id);
        console.log('Vínculo escola_id confirmado:', escola_id);

        const { data, error } = await supabase
          .from('turmas')
          .insert([novaTurma])
          .select();

        if (error) {
          console.error('Erro ao cadastrar turma:', error);
          
          // Se for erro de segurança (RLS), retornar mensagem mais específica
          if (error.code === '42501') {
            return res.status(500).json({ 
              message: 'Erro de permissão ao cadastrar turma. O RLS está bloqueando a operação.',
              details: 'Execute o SQL no painel do Supabase para desabilitar o RLS',
              error: error
            });
          }
          
          // Se for erro de coluna inexistente
          if (error.message && error.message.includes('column')) {
            return res.status(500).json({ 
              message: 'Erro de esquema ao cadastrar turma',
              details: error.message,
              error: error
            });
          }
          
          return res.status(500).json({ 
            message: 'Erro ao cadastrar turma',
            details: error.message || 'Erro desconhecido',
            error: error
          });
        }

        return res.status(201).json(data[0]);
      } catch (error) {
        console.error('Erro ao cadastrar turma:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar turma' });
      }
    }
  );

  /**
   * Rota para obter contagem de turmas ativas
   * Específica para gestores e suas escolas vinculadas
   */
  app.get('/api/turmas/count',
    authenticate,
    requireRole(['manager', 'admin', 'teacher']),
    async (req: Request, res: Response) => {
      try {
        console.log(`=== CONTAGEM DE TURMAS ATIVAS ===`);
        console.log(`User role: ${req.user?.role}`);
        
        let query = supabase
          .from('turmas')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);

        // Se for gestor, filtrar apenas pelas escolas vinculadas
        if (req.user?.role === 'gestor' || req.user?.role === 'manager') {
          console.log(`Buscando escolas para gestor: ${req.user.id}`);
          
          // Buscar escolas vinculadas diretamente pela coluna gestor_id
          const { data: escolas, error: escolasError } = await supabase
            .from('escolas')
            .select('id')
            .eq('gestor_id', req.user.id);
            
          if (escolasError) {
            console.error('Erro ao buscar escolas do gestor:', escolasError);
            return res.status(500).json({ message: 'Erro ao buscar escolas do gestor' });
          }
          
          if (!escolas || escolas.length === 0) {
            console.log('Nenhuma escola encontrada para o gestor');
            return res.status(200).json({ count: 0 });
          }
          
          const escolaIds = escolas.map(escola => escola.id);
          console.log(`Escolas encontradas: ${escolaIds.length}`);
          
          query = query.in('escola_id', escolaIds);
        }

        const { count, error } = await query;
        
        if (error) {
          console.error('Erro ao contar turmas ativas:', error);
          return res.status(500).json({ message: 'Erro ao contar turmas ativas' });
        }

        console.log(`Total de turmas ativas: ${count}`);
        return res.status(200).json({ count: count || 0 });
        
      } catch (error) {
        console.error('Erro ao buscar contagem de turmas:', error);
        return res.status(500).json({ message: 'Erro ao buscar contagem de turmas' });
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
          nome,
          turno,
          serie,
          modalidade,
          ano_letivo,
          descricao
        } = req.body;

        // Validação de campos obrigatórios
        if (!nome || !turno || !serie || !modalidade || !ano_letivo) {
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
          nome !== turmaExistente.nome || 
          Number(ano_letivo) !== Number(turmaExistente.ano_letivo)
        ) {
          const { data: turmasExistentes, error: verificacaoError } = await supabase
            .from('turmas')
            .select('id')
            .eq('nome', nome)
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
          nome: nome,
          turno,
          serie,
          modalidade,
          ano_letivo: Number(ano_letivo),
          descricao: descricao || null
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