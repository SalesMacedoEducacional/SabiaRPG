import { supabase } from '../db/supabase.js';
import { Request } from 'express';

/**
 * Obtém o usuário autenticado atual a partir do token JWT
 * @param req Request do Express com o token JWT no cabeçalho
 * @returns Objeto de usuário do Supabase Auth ou null se não estiver autenticado
 */
export async function getCurrentUser(req: Request) {
  try {
    // Verificar se há token de autenticação nos cabeçalhos
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Nenhum header de autenticação encontrado');
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Configurar o cliente Supabase com o token
    supabase.auth.setAuth(token);
    
    // Obter usuário atual
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erro ao obter usuário autenticado:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('Usuário não autenticado');
      return null;
    }
    
    console.log('Usuário autenticado:', user.id);
    return user;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return null;
  }
}

/**
 * Middleware para garantir que a requisição está autenticada
 * Adiciona o usuário autenticado à requisição
 */
export const authenticateSupabase = async (req: Request, res: any, next: any) => {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Não autorizado. Faça login para continuar.' 
      });
    }
    
    // Adicionar o usuário à requisição para uso nas rotas
    req.user = user;
    
    // Adicionar usuário à sessão se não existir
    if (req.session && !req.session.userId) {
      req.session.userId = user.id;
      req.session.userRole = await getUserRole(user.id);
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar autenticação' 
    });
  }
};

/**
 * Obtém o papel (role) do usuário no sistema
 * @param userId ID do usuário no Supabase Auth
 * @returns Role do usuário (gestor, professor, aluno)
 */
export async function getUserRole(userId: string): Promise<string> {
  try {
    // Consultar a tabela de usuários para obter o papel
    const { data, error } = await supabase
      .from('usuarios')
      .select('papel')
      .eq('id', userId)
      .single();
      
    if (error || !data) {
      console.error('Erro ao obter papel do usuário:', error?.message);
      return 'desconhecido';
    }
    
    return data.papel;
  } catch (error) {
    console.error('Erro ao consultar papel do usuário:', error);
    return 'desconhecido';
  }
}

/**
 * Middleware para verificar se o usuário tem o papel necessário
 * @param roles Array de papéis permitidos
 */
export const requireRoleSupabase = (roles: string[]) => {
  return async (req: Request, res: any, next: any) => {
    try {
      // Verificar se o usuário está na requisição (middleware authenticate deve ser executado antes)
      if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      
      // Obter papel do usuário
      const userRole = await getUserRole(req.user.id);
      
      // Verificar se o papel está na lista de permitidos
      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Acesso negado. Seu perfil não tem permissão para acessar este recurso.' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro ao verificar papel do usuário:', error);
      return res.status(500).json({ 
        message: 'Erro ao processar verificação de permissão' 
      });
    }
  };
};

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}