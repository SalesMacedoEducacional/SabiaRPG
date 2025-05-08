import { Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { hash } from 'bcryptjs';

/**
 * Middleware de criação de usuário com CPF como senha temporária
 * Este middleware garante que o CPF seja usado como senha temporária padrão
 * @param req Request do Express
 * @param res Response do Express
 */
export async function createUserWithCpf(req: Request, res: Response) {
  try {
    const { email, cpf, papel, nome_completo } = req.body;

    // Validar campos obrigatórios
    if (!email || !cpf || !papel) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Campos obrigatórios: email, cpf e papel são necessários.'
      });
    }

    console.log(`Criando usuário com email ${email}, CPF como senha e papel ${papel}`);

    try {
      // 1. Cria usuário no Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: cpf, // CPF como senha padrão
        email_confirm: true
      });

      if (authError) {
        console.error('Erro ao criar usuário no Auth:', authError);
        return res.status(500).json({
          erro: true,
          mensagem: `Erro ao criar usuário na autenticação: ${authError.message}`
        });
      }

      console.log(`Usuário criado no Auth com ID: ${authUser.user.id}`);

      // 2. Insere na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          id: authUser.user.id,
          email,
          papel,
          cpf, // insere CPF também
          criado_em: new Date().toISOString(),
          senha_hash: await hash(cpf, 10) // hash do CPF como senha
        })
        .select('id, email, papel, cpf')
        .single();

      if (userError) {
        console.error('Erro ao inserir na tabela usuarios:', userError);
        
        // Limpar usuário criado no Auth para manter consistência
        await supabase.auth.admin.deleteUser(authUser.user.id);
        
        return res.status(500).json({
          erro: true,
          mensagem: `Erro ao inserir usuário no banco: ${userError.message}`
        });
      }

      // 3. Se for gestor ou professor, criar entrada nas tabelas de perfil
      if (papel === 'gestor') {
        const { error: perfilError } = await supabase
          .from('perfis_gestor')
          .insert({
            usuario_id: authUser.user.id,
            cargo: 'Gestor Escolar',
            ativo: true,
            criado_em: new Date().toISOString()
          });

        if (perfilError) {
          console.warn('Aviso: Não foi possível criar perfil de gestor:', perfilError.message);
          // Continuamos mesmo com erro no perfil, só logamos o aviso
        }
      } else if (papel === 'professor') {
        const { error: perfilError } = await supabase
          .from('perfis_professor')
          .insert({
            usuario_id: authUser.user.id,
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

      // Retornar sucesso com os dados do usuário
      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        user: userData
      });

    } catch (error) {
      console.error('Erro inesperado ao criar usuário:', error);
      return res.status(500).json({
        erro: true,
        mensagem: 'Erro interno ao criar usuário',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return res.status(500).json({
      erro: true,
      mensagem: 'Erro interno do servidor'
    });
  }
}

/**
 * Função para registrar a rota de criação de usuário com CPF como senha
 * @param app Aplicação Express
 */
export function registerCreateUserWithCpfRoute(app: any) {
  app.post('/api/users/create-with-cpf', createUserWithCpf);
}