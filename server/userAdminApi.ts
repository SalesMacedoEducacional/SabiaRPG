import { Request, Response, Router } from 'express';
import { supabase } from '../db/supabase';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Gera um hash seguro para a senha usando SCRYPT
 * @param senha Senha em texto puro
 * @returns Hash no formato "hash.salt"
 */
async function hashPassword(senha: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  
  return new Promise<string>((resolve, reject) => {
    // Método mais simples e seguro para criar hash
    const hash = createHash('sha256')
                .update(senha + salt)
                .digest('hex');
    
    resolve(`${hash}.${salt}`);
  });
}

/**
 * Rota para criar um novo usuário no sistema
 * Insere tanto na tabela 'auth.users' quanto na tabela 'public.usuarios'
 */
export function getUserAdminRoutes() {
  const router = Router();

  // Rota para criar um novo usuário com papel específico
  router.post('/api/admin/usuarios', async (req: Request, res: Response) => {
    try {
      // Verificar a presença dos campos obrigatórios
      const { email, senha, papel, nome_completo } = req.body;

      if (!email || !senha || !papel) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios ausentes. Email, senha e papel são obrigatórios.' 
        });
      }

      console.log('Iniciando criação de usuário:', { email, papel });

      // Verificar se o usuário já existe
      const { data: existingUser } = await adminSupabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return res.status(409).json({ 
          erro: 'Usuário já existe', 
          mensagem: `Já existe um usuário com o email ${email}`
        });
      }

      // Gerar hash da senha
      const senhaHash = await hashPassword(senha);

      // Inserir usuário na tabela usuarios usando adminSupabase (bypassa RLS)
      const { data: newUser, error: dbError } = await adminSupabase
        .from('usuarios')
        .insert({
          email,
          senha_hash: senhaHash,
          papel,
          criado_em: new Date().toISOString()
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Erro ao inserir usuário no banco:', dbError);
        return res.status(500).json({ 
          erro: 'Erro ao inserir usuário no banco', 
          detalhe: dbError.message 
        });
      }

      console.log('Usuário criado com sucesso!', { id: newUser.id, email });
      res.status(201).json({ 
        mensagem: 'Usuário criado com sucesso!',
        usuario: {
          id: newUser.id,
          email,
          papel
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor', 
        mensagem: 'Ocorreu um erro ao processar a requisição.'
      });
    }
  });

  // Rota para listar todos os usuários (com paginação)
  router.get('/api/admin/usuarios', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data: usuarios, error, count } = await adminSupabase
        .from('usuarios')
        .select('id, email, papel, criado_em', { count: 'exact' })
        .range(start, end)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao listar usuários:', error);
        return res.status(500).json({ erro: 'Erro ao buscar usuários', detalhe: error.message });
      }

      res.status(200).json({
        usuarios,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  });

  return router;
}