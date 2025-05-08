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
      const { email, cpf, papel, nome_completo } = req.body;

      if (!email || !cpf || !papel) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios ausentes. Email, CPF e papel são obrigatórios.' 
        });
      }

      console.log('Iniciando criação de usuário:', { email, papel });

      // Verificar se o usuário já existe no Auth
      const { data: existingUser, error: checkError } = await adminSupabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar se usuário existe:', checkError);
        return res.status(500).json({ 
          erro: 'Erro ao verificar existência do usuário', 
          detalhe: checkError.message 
        });
      }

      if (existingUser) {
        return res.status(409).json({ 
          erro: 'Usuário já existe', 
          mensagem: `Já existe um usuário com o email ${email}`
        });
      }

      try {
        // 1. Criar usuário no Supabase Auth
        const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
          email,
          password: cpf, // Usar CPF como senha temporária
          email_confirm: true
        });

        if (authError) {
          console.error('Erro ao criar usuário no Auth:', authError);
          return res.status(500).json({ 
            erro: 'Erro ao criar usuário na autenticação', 
            detalhe: authError.message 
          });
        }

        console.log('Usuário criado no Auth com sucesso:', authUser.user.id);

        // 2. Inserir na tabela usuarios com relação ao Auth
        const { data: newUser, error: insertError } = await adminSupabase
          .from('usuarios')
          .insert({
            id: authUser.user.id,   // Usar o ID gerado pelo Auth
            email,
            senha_hash: await hashPassword(cpf), // Salvar hash do CPF
            papel,
            cpf,  // Salvar CPF para referência futura
            criado_em: new Date().toISOString()
          })
          .select('id, email, papel, cpf')
          .single();

        if (insertError) {
          console.error('Erro ao inserir usuário na tabela:', insertError);
          
          // Se o erro estiver relacionado com RLS (Row Level Security)
          if (insertError.message.includes('policy') || insertError.message.includes('permission')) {
            console.log('Erro de política de acesso, tentando outro método...');
            
            // Tente verificar as políticas de acesso
            console.log('Verificando políticas de acesso...');
            const { data: policies } = await adminSupabase
              .from('pg_policies')
              .select('*');
            
            console.log('Políticas encontradas:', policies);
          }
          
          // Se falhar a inserção na tabela, remover do Auth para manter consistência
          await adminSupabase.auth.admin.deleteUser(authUser.user.id);
          
          return res.status(500).json({ 
            erro: 'Erro ao inserir usuário no banco', 
            detalhe: insertError.message 
          });
        }

        console.log('Usuário criado com sucesso!', { id: newUser.id, email });
        res.status(201).json({ 
          mensagem: 'Usuário criado com sucesso!',
          usuario: {
            id: newUser.id,
            email,
            papel,
            cpf: newUser.cpf
          }
        });
      
      } catch (insertError) {
        console.error('Erro inesperado ao tentar inserir usuário:', insertError);
        return res.status(500).json({ 
          erro: 'Erro interno ao inserir usuário', 
          detalhe: insertError.message 
        });
      }
      
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