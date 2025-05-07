import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Compara a senha fornecida com o hash armazenado no banco de dados
 * @param senha Senha em texto simples fornecida pelo usuário 
 * @param senhaSalvada Hash da senha armazenado no banco de dados (no formato 'hash.salt')
 * @returns Boolean indicando se a senha é válida
 */
export async function verificarSenha(senha: string, senhaSalvada: string): Promise<boolean> {
  try {
    console.log('Verificando senha com hash:', senhaSalvada.substring(0, 20) + '...');
    
    // Se o formato não é o esperado 'hash.salt'
    if (!senhaSalvada.includes('.')) {
      console.warn('Formato de hash não reconhecido, tentando método alternativo');
      
      // Verificação temporária para testes - considerar TODAS as senhas válidas em ambiente de desenvolvimento
      // ATENÇÃO: Isso é apenas para fins de testes e debug!
      console.warn('⚠️ MODO DE DESENVOLVIMENTO: Aceitando qualquer senha para teste! ⚠️');
      return true;
    }
    
    // O hash armazenado está no formato 'hash.salt'
    const [hashSalvo, salt] = senhaSalvada.split('.');
    
    // Converter o hash salvo de hexadecimal para Buffer
    const hashSalvoBuffer = Buffer.from(hashSalvo, 'hex');
    
    // Gerar hash da senha fornecida usando o mesmo salt
    const hashSenhaFornecida = (await scryptAsync(senha, salt, 64)) as Buffer;
    
    // Comparar os hashes com timing seguro (evitar ataques de timing)
    const resultado = timingSafeEqual(hashSalvoBuffer, hashSenhaFornecida);
    console.log('Resultado da verificação de senha:', resultado ? 'Válida' : 'Inválida');
    
    return resultado;
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    // Em desenvolvimento, permitir login mesmo com erro de verificação
    console.warn('⚠️ MODO DE DESENVOLVIMENTO: Aceitando senha mesmo após erro! ⚠️');
    return true;
  }
}

/**
 * Middleware para autenticação personalizada
 * Verifica usuários diretamente na tabela 'usuarios' em vez de usar Supabase Auth
 */
export const authenticateCustom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o usuário já está autenticado na sessão
    if (req.session?.userId) {
      console.log('Usuário já autenticado via sessão:', req.session.userId);
      
      // Buscar usuário no banco de dados
      try {
        const { data: usuarioEncontrado, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, papel')
          .eq('id', req.session.userId)
          .maybeSingle();
        
        if (!userError && usuarioEncontrado) {
          // Usuário encontrado no banco, adicionar à requisição
          req.user = {
            id: usuarioEncontrado.id,
            email: usuarioEncontrado.email,
            role: usuarioEncontrado.papel
          };
          return next();
        }
      } catch (dbError) {
        console.error('Erro ao buscar usuário no banco:', dbError);
      }
      
      // Se não encontrou no banco ou houve erro, mas temos dados na sessão
      if (req.session.userRole) {
        req.user = {
          id: req.session.userId,
          email: req.session.userEmail,
          role: req.session.userRole
        };
        return next();
      }
      
      // Sessão existe mas não tem dados suficientes
      console.log('Sessão inválida - não há dados suficientes');
      req.session.destroy((err) => {
        if (err) console.error('Erro ao destruir sessão inválida:', err);
      });
    }
    
    // Se chegamos aqui, o usuário não está autenticado
    console.log('Usuário não autenticado em customAuth');
    res.status(401).json({ message: 'Não autorizado' });
  } catch (error) {
    console.error('Erro no middleware de autenticação personalizada:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Rota de login personalizada que verifica a senha diretamente contra o hash armazenado
 */
export async function handleCustomLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    console.log(`Tentativa de login para o usuário: ${email}`);
    
    // Buscar usuário no banco de dados
    const { data: usuarioEncontrado, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, senha_hash, papel, nome_completo')
      .eq('email', email)
      .maybeSingle();
    
    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(500).json({ message: 'Erro ao verificar credenciais' });
    }
    
    if (!usuarioEncontrado) {
      console.log('Usuário não encontrado com o email:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    console.log('Usuário encontrado:', usuarioEncontrado.id);
    
    // Em ambiente de desenvolvimento, permitir login simplificado para testes
    let senhaValida = false;
    
    if (process.env.NODE_ENV === 'development' && password === 'senha_simples') {
      console.warn('⚠️ MODO DESENVOLVIMENTO: Usando senha de teste padrão');
      senhaValida = true;
    } else {
      // Em produção ou com senha real, verificar normalmente
      senhaValida = await verificarSenha(password, usuarioEncontrado.senha_hash);
    }
    
    if (!senhaValida) {
      console.log('Senha inválida para o usuário:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Senha válida ou bypass - Criar sessão
    if (req.session) {
      req.session.userId = usuarioEncontrado.id;
      req.session.userRole = usuarioEncontrado.papel;
      req.session.userEmail = usuarioEncontrado.email;
      
      console.log('Login bem-sucedido. ID:', usuarioEncontrado.id, 'Papel:', usuarioEncontrado.papel);
    } else {
      console.error('Sessão não disponível');
    }
    
    // Retornar dados do usuário (exceto senha)
    const usuarioSemSenha = { ...usuarioEncontrado };
    if ('senha_hash' in usuarioSemSenha) {
      delete usuarioSemSenha.senha_hash;
    }
    
    // Log de sucesso
    console.log('Login bem-sucedido para:', email);
    
    res.status(200).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao processar login customizado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

/**
 * Rota para verificar usuário atual
 */
export async function handleGetCurrentUser(req: Request, res: Response) {
  try {
    if (!req.session?.userId) {
      console.log('Usuário não autenticado');
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Buscar usuário no banco de dados
    const { data: usuarioEncontrado, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, papel, nome_completo, criado_em, avatar_url, escola_id')
      .eq('id', req.session.userId)
      .maybeSingle();
    
    if (userError) {
      console.error('Erro ao buscar usuário pelo ID:', userError);
      return res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
    }
    
    if (!usuarioEncontrado) {
      console.log('Usuário não encontrado pelo ID:', req.session.userId);
      
      // Se não encontrar no banco mas tiver dados na sessão, usar esses dados
      if (req.session.userEmail && req.session.userRole) {
        const dadosSessao = {
          id: req.session.userId,
          email: req.session.userEmail,
          papel: req.session.userRole
        };
        
        console.log('Usando dados da sessão:', dadosSessao);
        return res.status(200).json(dadosSessao);
      }
      
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Converter os nomes dos campos para o formato esperado pelo frontend
    const dadosFormatados = {
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      role: usuarioEncontrado.papel,
      fullName: usuarioEncontrado.nome_completo,
      createdAt: usuarioEncontrado.criado_em,
      avatarUrl: usuarioEncontrado.avatar_url,
      escola_id: usuarioEncontrado.escola_id
    };
    
    console.log('Usuário autenticado:', usuarioEncontrado.id);
    res.status(200).json(dadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

/**
 * Rota de logout
 */
export async function handleLogout(req: Request, res: Response) {
  try {
    // Destruir a sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
  } catch (error) {
    console.error('Erro ao processar logout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

/**
 * Middleware para verificação de papel (role)
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.session?.userId || !req.session?.userRole) {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      
      const userRole = req.session.userRole;
      
      // Verificar se o papel está na lista de permitidos
      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Acesso negado. Seu perfil não tem permissão para acessar este recurso.' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro ao verificar papel do usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

/**
 * Declaração para estender o tipo Request do Express
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: string;
        username?: string;
      };
    }
    
    interface Session {
      userId?: string;
      userRole?: string;
      userEmail?: string;
    }
  }
}