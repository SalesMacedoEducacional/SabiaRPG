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

      // Validar CPF para professores e gestores
      if ((papel === 'professor' || papel === 'gestor') && !cpf) {
        return res.status(400).json({ message: 'CPF é obrigatório para professores e gestores' });
      }

      // Verificar se email já existe
      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email)
        .single();

      if (emailExistente) {
        return res.status(400).json({ message: 'Este email já está cadastrado' });
      }

      // Gerar senha temporária baseada no papel (seguindo regras do Supabase)
      let senhaTemporaria = '';
      if (papel === 'aluno' && numero_matricula) {
        // Para alunos: matrícula + caracteres especiais para atender aos requisitos
        senhaTemporaria = numero_matricula + 'Aluno@2024';
      } else if ((papel === 'professor' || papel === 'gestor') && cpf) {
        // Para professores e gestores: CPF limpo + caracteres especiais
        const cpfLimpo = cpf.replace(/[.-]/g, '');
        senhaTemporaria = cpfLimpo + 'Temp@123';
      } else {
        // Senha padrão segura para casos não especificados
        senhaTemporaria = 'SabiaRpg@2024';
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senhaTemporaria,
        options: {
          data: {
            full_name: nome_completo,
            role: papel
          }
        }
      });

      if (authError) {
        console.error('Erro no Supabase Auth:', authError);
        return res.status(500).json({ message: 'Erro ao criar conta: ' + authError.message });
      }

      if (!authData.user) {
        return res.status(500).json({ message: 'Erro ao criar usuário' });
      }

      // Limpar formatação do telefone e CPF
      const telefoneClean = telefone.replace(/\D/g, '');
      const cpfClean = cpf ? cpf.replace(/\D/g, '') : null;

      // Inserir na tabela usuarios (sem especificar ID, deixa o banco gerar automaticamente)
      const { data: novoUsuario, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email,
          nome: nome_completo,
          telefone: telefoneClean,
          data_nascimento,
          papel,
          senha_hash: hashPassword(senhaTemporaria),
          cpf: (papel === 'professor' || papel === 'gestor') ? cpfClean : null,
          criado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
        return res.status(500).json({ message: 'Erro ao salvar usuário: ' + insertError.message });
      }

      // Criar perfis específicos
      if (papel === 'aluno' && turma_id && numero_matricula) {
        await supabase
          .from('perfis_aluno')
          .insert({
            usuario_id: authData.user.id,
            turma_id,
            numero_matricula,
            ativo: true,
            criado_em: new Date().toISOString()
          });
      } else if (papel === 'professor') {
        await supabase
          .from('perfis_professor')
          .insert({
            usuario_id: authData.user.id,
            disciplinas: ['Indefinida'],
            turmas: ['Indefinida'],
            ativo: true,
            criado_em: new Date().toISOString()
          });
      } else if (papel === 'gestor') {
        await supabase
          .from('perfis_gestor')
          .insert({
            usuario_id: authData.user.id,
            ativo: true,
            criado_em: new Date().toISOString()
          });
      }

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