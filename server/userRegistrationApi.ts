import { Express, Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import crypto from 'crypto';

// Função para gerar hash de senha simples
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

export function registerUserRegistrationRoutes(app: Express) {
  // Rota para cadastrar novo usuário
  app.post('/api/users', async (req: any, res: Response) => {
    console.log('=== INICIANDO CADASTRO DE USUÁRIO ===');
    console.log('Dados recebidos:', req.body);
    
    try {
      // Verificar se o usuário está autenticado
      if (!req.session?.userId) {
        console.log('Usuário não autenticado');
        return res.status(401).json({ message: 'Não autorizado' });
      }

      // Buscar o usuário logado para verificar permissões
      const { data: usuarioLogado, error: userError } = await supabase
        .from('usuarios')
        .select('papel')
        .eq('id', req.session.userId)
        .single();

      if (userError || !usuarioLogado) {
        console.log('Erro ao buscar usuário logado:', userError);
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Verificar se tem permissão para cadastrar usuários
      if (!['gestor', 'manager', 'admin'].includes(usuarioLogado.papel)) {
        console.log('Usuário sem permissão:', usuarioLogado.papel);
        return res.status(403).json({ message: 'Você não tem permissão para cadastrar usuários' });
      }

      const { nome_completo, email, telefone, data_nascimento, papel, turma_id, numero_matricula, cpf } = req.body;

      console.log('=== INICIANDO CADASTRO DE USUÁRIO ===');
      console.log('Dados recebidos:', {
        nome_completo,
        email,
        telefone,
        data_nascimento,
        papel,
        cpf,
        turma_id,
        numero_matricula
      });

      // Validar campos obrigatórios
      if (!nome_completo || !email || !telefone || !data_nascimento || !papel) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      // Validar CPF (obrigatório para todos os papéis)
      if (!cpf) {
        return res.status(400).json({ message: 'CPF é obrigatório para todos os usuários' });
      }

      // Verificar se email já existe na tabela usuarios
      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (emailExistente) {
        return res.status(400).json({ message: 'Este email já está cadastrado no sistema' });
      }

      // Gerar senha temporária baseada no papel (seguindo regras do Supabase)
      // Senha deve ter: maiúscula, minúscula, número e caractere especial
      let senhaTemporaria = '';
      const cpfLimpo = cpf.replace(/[.-]/g, '');
      
      if (papel === 'aluno' && numero_matricula) {
        // Para alunos: matrícula + CPF + requisitos de segurança
        senhaTemporaria = `${numero_matricula.slice(0,4)}Aluno${cpfLimpo.slice(-4)}@2024`;
      } else if (papel === 'professor' || papel === 'gestor') {
        // Para professores e gestores: CPF + requisitos de segurança
        senhaTemporaria = `Temp${cpfLimpo.slice(-6)}@${new Date().getFullYear()}`;
      } else {
        // Senha padrão segura para casos não especificados
        senhaTemporaria = 'SabiaRpg@2024';
      }

      // Gerar ID único para o usuário
      const userId = crypto.randomUUID();

      // Limpar formatação do telefone e CPF
      const telefoneClean = telefone.replace(/\D/g, '');
      const cpfClean = cpf ? cpf.replace(/\D/g, '') : null;

      // Inserir na tabela usuarios com ID gerado localmente
      const { data: novoUsuario, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          email: email.toLowerCase().trim(),
          nome: nome_completo,
          telefone: telefoneClean,
          data_nascimento,
          papel,
          senha_hash: hashPassword(senhaTemporaria),
          cpf: cpfClean,
          criado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
        
        // Tratar erro de email duplicado especificamente
        if (insertError.code === '23505' && insertError.message.includes('usuarios_email_key')) {
          return res.status(400).json({ message: 'Este email já está cadastrado no sistema' });
        }
        
        return res.status(500).json({ message: 'Erro ao salvar usuário: ' + insertError.message });
      }

      // Os perfis específicos serão criados posteriormente se necessário
      // Por enquanto, apenas o registro na tabela usuarios é suficiente

      console.log('=== USUÁRIO CADASTRADO COM SUCESSO ===');
      console.log('ID:', novoUsuario.id);
      console.log('Nome:', novoUsuario.nome);
      console.log('Email:', novoUsuario.email);
      console.log('Papel:', novoUsuario.papel);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        user: {
          id: novoUsuario.id,
          nome_completo: novoUsuario.nome,
          email: novoUsuario.email,
          papel: novoUsuario.papel,
          senha_temporaria: senhaTemporaria
        }
      });

    } catch (error) {
      console.error('Erro inesperado ao cadastrar usuário:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}