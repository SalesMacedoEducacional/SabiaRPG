import { Express, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Função auxiliar para validar CPF (11 dígitos numéricos)
function isValidCPF(cpf: string) {
  return typeof cpf === 'string' && /^\d{11}$/.test(cpf);
}

/**
 * Registra a rota para cadastro simplificado de usuários
 * @param app Express application
 */
export function registerSimplifiedUserRoutes(app: Express) {
  // Rota: gestor cadastra novo usuário
  app.post('/cadastrar-usuario', async (req: Request, res: Response) => {
    try {
      const { email, password, papel, cpf } = req.body;

      if (!email || !password || !papel) {
        return res.status(400).json({ error: '⚠️ Todos os campos são obrigatórios.' });
      }

      if (!isValidCPF(cpf)) {
        return res.status(400).json({ error: '⚠️ CPF inválido. Use apenas números (11 dígitos).' });
      }

      console.log(`Tentando criar usuário ${email} com papel ${papel}`);

      // 1. Criar usuário no Auth do Supabase
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          papel,
          cpf
        }
      });

      if (error) {
        console.error('Erro ao criar usuário no Auth:', error);
        
        if (error.message.includes('CPF é obrigatório')) {
          return res.status(400).json({ error: '⚠️ CPF é obrigatório para cadastro via plataforma.' });
        }

        return res.status(500).json({ error: `Erro Supabase Auth: ${error.message}` });
      }

      const userId = data.user.id;
      console.log(`Usuário criado no Auth com ID: ${userId}`);

      // 2. Inserir na tabela usuarios
      const { data: userData, error: userError } = await adminSupabase
        .from('usuarios')
        .insert({
          id: userId,
          email,
          papel,
          cpf,
          criado_em: new Date().toISOString(),
          senha_hash: password // Usado para login direto, não para autenticação (que usa Supabase Auth)
        })
        .select('id, email, papel, cpf')
        .single();

      if (userError) {
        console.error('Erro ao inserir na tabela usuarios:', userError);
        
        // Limpar usuário criado no Auth para manter consistência
        await adminSupabase.auth.admin.deleteUser(userId);
        
        return res.status(500).json({ 
          error: `Erro ao inserir usuário: ${userError.message}`
        });
      }

      // 3. Se for gestor ou professor, criar entrada nas tabelas de perfil
      if (papel === 'gestor') {
        const { error: perfilError } = await adminSupabase
          .from('perfis_gestor')
          .insert({
            usuario_id: userId,
            cargo: 'Gestor Escolar',
            ativo: true,
            criado_em: new Date().toISOString()
          });

        if (perfilError) {
          console.warn('Aviso: Não foi possível criar perfil de gestor:', perfilError.message);
          // Continuamos mesmo com erro no perfil, só logamos o aviso
        }
      } else if (papel === 'professor') {
        const { error: perfilError } = await adminSupabase
          .from('perfis_professor')
          .insert({
            usuario_id: userId,
            disciplinas: ['Indefinida'],
            turmas: ['Indefinida'],
            ativo: true,
            criado_em: new Date().toISOString()
          });

        if (perfilError) {
          console.warn('Aviso: Não foi possível criar perfil de professor:', perfilError.message);
          // Continuamos mesmo com erro no perfil, só logamos o aviso
        }
      }

      return res.status(201).json({ 
        message: '✅ Usuário criado com sucesso!', 
        user: userData
      });
    } catch (error) {
      console.error('Erro não tratado:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}