import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';

// Schema para validação dos dados da escola
const schoolSchema = z.object({
  nome: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres"),
  codigo_escola: z.string().optional(),
  tipo: z.enum(["estadual", "municipal", "particular", "federal"], {
    required_error: "Selecione o tipo de escola",
  }),
  modalidade_ensino: z.string().min(2, "Informe a modalidade de ensino"),
  cidade: z.string().min(2, "Informe a cidade"),
  estado: z.string({
    required_error: "Selecione o estado",
  }),
  zona_geografica: z.enum(["urbana", "rural"], {
    required_error: "Selecione a zona geográfica",
  }),
  endereco_completo: z.string().min(5, "Informe o endereço completo"),
  telefone: z.string().min(14, "Formato de telefone inválido").max(15, "Formato de telefone inválido"),
  email_institucional: z.string().email("E-mail inválido").optional().or(z.literal("")),
  gestor_id: z.number().or(z.string())
});

/**
 * Registra as rotas relacionadas às escolas
 * @param app Express application
 * @param authenticate Middleware de autenticação
 * @param requireRole Middleware de verificação de papel
 */
export function registerSchoolRoutes(
  app: Express, 
  authenticate: (req: Request, res: Response, next: Function) => void,
  requireRole: (roles: string[]) => (req: Request, res: Response, next: Function) => Promise<void>
) {
  /**
   * Rota para verificar se o gestor possui escolas cadastradas
   * Acessível apenas para gestores
   */
  app.get(
    '/api/schools/check-has-schools',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        // O middleware requireRole já verificou a permissão
        
        // Buscar contagem de escolas do gestor
        const { count, error } = await supabase
          .from('escolas')
          .select('*', { count: 'exact', head: true })
          .eq('gestor_id', req.session.userId);
          
        if (error) throw error;
        
        return res.status(200).json({ 
          hasSchools: count !== null && count > 0,
          count: count || 0
        });
      } catch (error) {
        console.error('Erro ao verificar escolas do gestor:', error);
        return res.status(500).json({ 
          message: 'Erro ao verificar escolas do gestor' 
        });
      }
    }
  );
  
  /**
   * Rota para verificar se o gestor já possui uma escola cadastrada
   * Acessível apenas para gestores
   */
  app.get(
    '/api/schools/check-manager-school',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        // O middleware requireRole já verificou a permissão
        
        // Buscar escolas do gestor
        const { data, error } = await supabase
          .from('escolas')
          .select('*')
          .eq('gestor_id', req.session.userId);
          
        if (error) throw error;
        
        const hasSchool = data && data.length > 0;
        
        return res.status(200).json({ 
          hasSchool,
          school: hasSchool ? data[0] : null
        });
      } catch (error) {
        console.error('Erro ao verificar escola do gestor:', error);
        return res.status(500).json({ 
          message: 'Erro ao verificar escola do gestor' 
        });
      }
    }
  );

  /**
   * Rota para listar todas as escolas
   * Acessível apenas para administradores e gestores
   */
  app.get(
    '/api/schools',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        // Verificar se o usuário é um gestor
        if (req.session.userRole === 'manager') {
          // Buscar apenas as escolas associadas ao gestor
          const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('gestor_id', req.session.userId);
            
          if (error) throw error;
          
          return res.status(200).json(data || []);
        }
        
        // Se for administrador, buscar todas as escolas
        const { data, error } = await supabase
          .from('escolas')
          .select('*');
          
        if (error) throw error;
        
        return res.status(200).json(data || []);
      } catch (error) {
        console.error('Erro ao buscar escolas:', error);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }
    }
  );

  /**
   * Rota para obter detalhes de uma escola específica
   * Acessível para administradores e gestores
   */
  app.get(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Verificar se o usuário é um gestor
        if (req.session.userRole === 'manager') {
          // Garantir que o gestor só acesse escolas vinculadas a ele
          const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('id', schoolId)
            .eq('gestor_id', req.session.userId)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'Escola não encontrada' });
            }
            throw error;
          }
          
          return res.status(200).json(data);
        }
        
        // Se for administrador, buscar a escola sem restrições
        const { data, error } = await supabase
          .from('escolas')
          .select('*')
          .eq('id', schoolId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ message: 'Escola não encontrada' });
          }
          throw error;
        }
        
        return res.status(200).json(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes da escola:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes da escola' });
      }
    }
  );

  /**
   * Rota para cadastrar uma nova escola
   * Acessível apenas para administradores e gestores
   */
  app.post(
    '/api/schools',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        // Validar os dados de entrada
        const validationResult = schoolSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: 'Dados inválidos', 
            errors: validationResult.error.format() 
          });
        }
        
        const schoolData = validationResult.data;
        
        // Garantir que se o usuário for gestor, o gestor_id será o seu próprio ID
        if (req.session.userRole === 'manager') {
          // Verificar se o gestor já possui uma escola cadastrada
          const { data: existingSchools, error: checkError } = await supabase
            .from('escolas')
            .select('*')
            .eq('gestor_id', req.session.userId);
            
          if (checkError) throw checkError;
          
          if (existingSchools && existingSchools.length > 0) {
            return res.status(403).json({ 
              message: 'Você já possui uma escola cadastrada. Não é possível cadastrar mais de uma escola por gestor.' 
            });
          }
          
          // Definir o ID do gestor
          schoolData.gestor_id = req.session.userId;
        }
        
        // Inserir a nova escola no banco de dados
        const { data, error } = await supabase
          .from('escolas')
          .insert([schoolData])
          .select()
          .single();
          
        if (error) throw error;
        
        return res.status(201).json(data);
      } catch (error) {
        console.error('Erro ao cadastrar nova escola:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar nova escola' });
      }
    }
  );

  /**
   * Rota para atualizar uma escola existente
   * Acessível apenas para administradores e gestores da escola
   */
  app.put(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Validar os dados de entrada
        const validationResult = schoolSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: 'Dados inválidos', 
            errors: validationResult.error.format() 
          });
        }
        
        const schoolData = validationResult.data;
        
        // Se o usuário for gestor, verificar se a escola pertence a ele
        if (req.session.userRole === 'manager') {
          const { data, error } = await supabase
            .from('escolas')
            .select('gestor_id')
            .eq('id', schoolId)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'Escola não encontrada' });
            }
            throw error;
          }
          
          if (data.gestor_id !== req.session.userId) {
            return res.status(403).json({ message: 'Você não tem permissão para atualizar esta escola' });
          }
          
          // Garantir que o gestor_id não seja alterado
          schoolData.gestor_id = req.session.userId;
        }
        
        // Atualizar os dados da escola
        const { data, error } = await supabase
          .from('escolas')
          .update(schoolData)
          .eq('id', schoolId)
          .select()
          .single();
          
        if (error) throw error;
        
        return res.status(200).json(data);
      } catch (error) {
        console.error('Erro ao atualizar escola:', error);
        return res.status(500).json({ message: 'Erro ao atualizar escola' });
      }
    }
  );

  /**
   * Rota para excluir uma escola
   * Acessível apenas para administradores
   */
  app.delete(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Apenas administradores podem excluir escolas
        const { error } = await supabase
          .from('escolas')
          .delete()
          .eq('id', schoolId);
          
        if (error) throw error;
        
        return res.status(204).send();
      } catch (error) {
        console.error('Erro ao excluir escola:', error);
        return res.status(500).json({ message: 'Erro ao excluir escola' });
      }
    }
  );
  
}