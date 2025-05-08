import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { db } from './db';
import { z } from 'zod';
import crypto from 'crypto';

// Configuração do cliente Supabase com API key para operações administrativas
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Esquema de validação para cadastro de usuário simplificado
const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(11, "Senha deve ter pelo menos 11 caracteres"), // CPF tem 11 dígitos
  papel: z.enum(["gestor", "professor", "aluno"], {
    required_error: "Papel deve ser 'gestor', 'professor' ou 'aluno'",
  }),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 caracteres").max(14, "CPF inválido")
});

/**
 * Verifica se o CPF é válido (formato simples, apenas verificação de comprimento)
 * @param cpf CPF a ser validado
 * @returns Boolean indicando se o CPF é válido
 */
function isValidCPF(cpf: string) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  return cpf.length === 11;
}

/**
 * Gera um hash seguro para a senha usando SCRYPT
 * @param senha Senha em texto puro
 * @returns Promessa com hash no formato "hash.salt"
 */
async function hashPassword(senha: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(senha, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

/**
 * Registra a rota para cadastro simplificado de usuários
 * @param app Express application
 */
export function registerSimplifiedUserRoutes(app: any) {
  app.post('/cadastrar-usuario', async (req: Request, res: Response) => {
    console.log('Recebida requisição para cadastrar usuário simplificado:', JSON.stringify(req.body, null, 2));
    
    try {
      // Valida os dados de entrada
      const validationResult = userSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: "Dados inválidos", 
          details: validationResult.error.format() 
        });
      }
      
      const { email, password, papel, cpf } = validationResult.data;
      
      // Verifica se o CPF é válido (formato simples)
      if (!isValidCPF(cpf)) {
        return res.status(400).json({ 
          success: false, 
          error: "CPF inválido. Deve conter 11 dígitos numéricos." 
        });
      }
      
      // Verifica se usuário já existe no Auth do Supabase
      const { data: existingUser } = await adminSupabase.auth.admin.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "Email já cadastrado no sistema." 
        });
      }
      
      // 1. Cria o usuário no Auth do Supabase (usando o adminSupabase com service key)
      console.log(`Criando usuário no Auth com email: ${email}`);
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true  // Marca o email como confirmado
      });
      
      if (authError) {
        console.error("Erro ao criar usuário no Auth:", authError);
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao criar usuário na autenticação: ${authError.message}` 
        });
      }
      
      // 2. Criar hash da senha para armazenamento na tabela usuarios
      console.log(`Gerando hash para senha do usuário`);
      const senhaHash = await hashPassword(password);
      
      // 3. Insere o usuário na tabela usuarios
      console.log(`Inserindo usuário na tabela usuarios com ID: ${authUser.user.id}`);
      // Para diagnóstico: verificar o formato do ID
      console.log(`Tipo do ID: ${typeof authUser.user.id}, Valor: ${authUser.user.id}`);
      
      const { data: dbUser, error: dbError } = await adminSupabase
        .from('usuarios')
        .insert([
          {
            id: authUser.user.id,
            email: email,
            senha_hash: senhaHash,
            papel: papel,
            cpf: cpf,
            created_at: new Date()
          }
        ])
        .select()
        .single();
      
      if (dbError) {
        console.error("Erro ao inserir na tabela usuarios:", dbError);
        
        // Se falhar a inserção na tabela, tenta excluir o usuário criado no Auth
        try {
          await adminSupabase.auth.admin.deleteUser(authUser.user.id);
        } catch (deleteError) {
          console.error("Erro ao excluir usuário do Auth após falha na tabela:", deleteError);
        }
        
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao cadastrar usuário na tabela: ${dbError.message}` 
        });
      }
      
      // 4. Dependendo do papel do usuário, pode ser necessário inserir em tabelas específicas
      // como perfis_aluno, perfis_professor ou perfis_gestor
      let perfilSpecifico = null;
      
      if (papel === 'gestor') {
        // Criar perfil de gestor
        const { data: perfilGestor, error: perfilError } = await adminSupabase
          .from('perfis_gestor')
          .insert([{ usuario_id: authUser.user.id }])
          .select()
          .single();
        
        if (perfilError) {
          console.error("Erro ao criar perfil de gestor:", perfilError);
          // Não precisamos impedir a criação do usuário principal por causa desse erro
        } else {
          perfilSpecifico = perfilGestor;
        }
      } else if (papel === 'professor') {
        // Criar perfil de professor
        const { data: perfilProfessor, error: perfilError } = await adminSupabase
          .from('perfis_professor')
          .insert([{ usuario_id: authUser.user.id }])
          .select()
          .single();
        
        if (perfilError) {
          console.error("Erro ao criar perfil de professor:", perfilError);
          // Não precisamos impedir a criação do usuário principal por causa desse erro
        } else {
          perfilSpecifico = perfilProfessor;
        }
      } else if (papel === 'aluno') {
        // Para alunos, pode ser necessário criar perfil após associar a uma matrícula
        // Depende do fluxo da aplicação, então não implementamos aqui
      }
      
      // Retorna sucesso com dados do usuário criado
      return res.status(201).json({
        success: true,
        message: `Usuário ${email} criado com sucesso como ${papel}`,
        usuario: {
          id: authUser.user.id,
          email: dbUser.email,
          papel: dbUser.papel,
          auth: {
            id: authUser.user.id,
            email: authUser.user.email,
            role: authUser.user.role,
          },
          perfil: perfilSpecifico
        }
      });
      
    } catch (error) {
      console.error("Erro ao processar cadastro de usuário:", error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });
}