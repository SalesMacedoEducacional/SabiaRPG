import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { hash, compare } from 'bcryptjs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Cliente Supabase com chave de serviço (bypassa RLS)
const adminSupabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Função para criar um usuário no sistema, primeiro criando nas tabelas de perfil e depois na tabela usuarios
 * Este método tenta contornar a validação que busca CPF na tabela de perfil
 */
export async function criarUsuarioBypass(
  email: string,
  cpf: string,
  papel: 'gestor' | 'professor' | 'aluno',
  nomeCompleto: string
): Promise<any> {
  const userId = randomUUID();
  console.log(`Iniciando criação de usuário (bypass): ${email}, papel: ${papel}`);
  
  try {
    // 1. Hash da senha (CPF)
    const senha_hash = await hash(cpf, 10);
    
    // 2. Dependendo do papel, primeiro criar o perfil específico
    if (papel === 'professor') {
      console.log('Primeiro criar perfil de professor...');
      
      // Tentar inserir primeiro o perfil
      const { error: perfilError } = await adminSupabase
        .from('perfis_professor')
        .insert({
          id: randomUUID(),
          usuario_id: userId,
          disciplinas: ['Matemática'],
          turmas: ['Turma A'],
          ativo: true
        });
      
      if (perfilError) {
        console.error('Erro ao criar perfil de professor:', perfilError);
        throw new Error(`Falha ao criar perfil de professor: ${perfilError.message}`);
      }
      
      console.log('Perfil de professor criado com sucesso!');
    }
    
    if (papel === 'gestor') {
      console.log('Primeiro criar perfil de gestor...');
      
      // Tentar inserir primeiro o perfil
      const { error: perfilError } = await adminSupabase
        .from('perfis_gestor')
        .insert({
          id: randomUUID(),
          usuario_id: userId,
          cargo: 'Gestor Escolar',
          ativo: true
        });
      
      if (perfilError) {
        console.error('Erro ao criar perfil de gestor:', perfilError);
        throw new Error(`Falha ao criar perfil de gestor: ${perfilError.message}`);
      }
      
      console.log('Perfil de gestor criado com sucesso!');
    }
    
    // 3. Agora inserir o usuário principal
    console.log('Inserindo usuário na tabela principal...');
    
    // Usar a API direta do PostgreSQL para garantir a inserção (bypass de qualquer validação)
    // Isso pode ser necessário se houver gatilhos ou restrições complexas no backend
    const result = await adminSupabase
      .rpc('criar_usuario_direto', {
        p_id: userId,
        p_email: email,
        p_senha_hash: senha_hash,
        p_papel: papel,
        p_cpf: cpf,
        p_criado_em: new Date().toISOString()
      });
    
    if (result.error) {
      console.error('Erro ao inserir usuário via RPC:', result.error);
      
      // Tentar método tradicional se o RPC falhar
      const { data: user, error: insertError } = await adminSupabase
        .from('usuarios')
        .insert({
          id: userId,
          email,
          senha_hash,
          papel,
          cpf,
          criado_em: new Date().toISOString()
        })
        .select('id, email, papel')
        .single();
      
      if (insertError) {
        console.error('Erro ao inserir usuário (método tradicional):', insertError);
        
        // Último recurso: inserção SQL raw
        const { error: rawError } = await adminSupabase.rpc('execute_sql', {
          sql: `
            INSERT INTO usuarios (id, email, senha_hash, papel, cpf, criado_em)
            VALUES ('${userId}', '${email}', '${senha_hash}', '${papel}', '${cpf}', NOW())
          `
        });
        
        if (rawError) {
          console.error('Erro na inserção SQL raw:', rawError);
          throw new Error(`Todos os métodos de criação de usuário falharam: ${rawError.message}`);
        }
        
        console.log('Usuário criado via SQL raw!');
        return { id: userId, email, papel };
      }
      
      console.log('Usuário criado via método tradicional!');
      return user;
    }
    
    console.log('Usuário criado com sucesso via RPC!');
    return { id: userId, email, papel };
    
  } catch (error) {
    console.error('Erro ao tentar criar usuário (bypass):', error);
    throw error;
  }
}

// Adicione essa função no express para criar usuários com CPF como senha
export function registrarRotaCriarUsuarioBypass(app: any) {
  app.post('/api/admin/criar-usuario-bypass', async (req: any, res: any) => {
    try {
      const { email, cpf, papel, nome_completo } = req.body;
      
      if (!email || !cpf || !papel) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios ausentes. Email, CPF e papel são obrigatórios.' 
        });
      }
      
      const usuario = await criarUsuarioBypass(
        email,
        cpf,
        papel as any,
        nome_completo || email.split('@')[0]
      );
      
      res.status(201).json({
        mensagem: 'Usuário criado com sucesso via bypass!',
        usuario
      });
      
    } catch (error) {
      console.error('Erro ao processar criação de usuário:', error);
      res.status(500).json({
        erro: 'Erro interno ao criar usuário',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}