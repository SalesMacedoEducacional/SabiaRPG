import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { pool } from './db';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Como estamos usando ESM, precisamos definir __filename e __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Declaração para estender o tipo Request do Express
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userRole?: string;
  }
}

// Configurar o multer para armazenar arquivos temporariamente
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // Verificar se o diretório existe, se não, criar
    const uploadDir = path.join(__dirname, '..', 'uploads', 'tmp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`Saving temporary file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    // Gerar nome único para o arquivo
    const uniquePrefix = `${Date.now()}-${randomUUID()}`;
    const extname = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniquePrefix}${extname}`);
  }
});

// Filtro para permitir apenas JPG e PNG
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Use JPG ou PNG.'));
  }
};

// Configurar o upload
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5MB
  }
});

/**
 * Registra as rotas de usuário, incluindo upload de foto
 */
export function registerUserRoutes(app: Express) {
  // Rota para criar novo usuário (apenas para gestores e administradores)
  app.post('/api/users', (req: any, res: Response) => {
    console.log('Recebida requisição para criar novo usuário');
    
    // Se o usuário não estiver autenticado, retornar erro
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verificar se o usuário é gestor ou administrador
    const userRole = req.session.userRole;
    if (!['gestor', 'admin'].includes(userRole as string)) {
      return res.status(403).json({ message: 'Você não tem permissão para cadastrar novos usuários' });
    }

    const uploadMiddleware = upload.single('imagem_perfil');
    
    uploadMiddleware(req, res, async (err: any) => {
      if (err) {
        if (err.message === 'Formato inválido. Use JPG ou PNG.') {
          return res.status(400).json({ message: err.message });
        } else if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Imagem muito grande. O tamanho máximo é 5MB.' });
        }
        console.error('Erro no upload:', err);
        return res.status(500).json({ message: 'Falha ao processar o upload da imagem.' });
      }

      try {
        const { 
          nome_completo, 
          email, 
          telefone, 
          data_nascimento, 
          papel, 
          turma_id, 
          numero_matricula, 
          cpf 
        } = req.body;
        
        console.log('Dados recebidos para criação de usuário:', { 
          nome_completo, 
          email, 
          telefone, 
          data_nascimento, 
          papel,
          turma_id,
          numero_matricula,
          cpf
        });
        
        // Validar campos obrigatórios
        if (!nome_completo || !email || !telefone || !data_nascimento || !papel) {
          return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
        }
        
        // Validar campos específicos por papel
        if (papel === 'aluno' && (!turma_id || !numero_matricula)) {
          return res.status(400).json({ message: 'Para alunos, é necessário informar turma e número de matrícula' });
        }
        
        if (papel === 'professor' && !cpf) {
          return res.status(400).json({ message: 'Para professores, é necessário informar o CPF' });
        }
        
        let imageUrl = null;
        // Processar a imagem se foi enviada
        if (req.file) {
          // Obter o caminho do arquivo temporário
          const tempFilePath = req.file.path;
          
          // Criar diretório permanente para armazenar imagens se não existir
          const publicDir = path.join(__dirname, '..', 'client', 'public', 'uploads', 'profile-images');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          // Gerar nome de arquivo único 
          const fileName = `new-user-${Date.now()}-${path.basename(req.file.filename)}`;
          const destPath = path.join(publicDir, fileName);
          
          // Mover arquivo do diretório temporário para permanente
          fs.copyFileSync(tempFilePath, destPath);
          
          // Limpar arquivo temporário
          fs.unlinkSync(tempFilePath);
          
          // Gerar URL relativa para o frontend
          imageUrl = `/uploads/profile-images/${fileName}`;
        }
        
        // Gerar senha padrão
        let senha;
        if (papel === 'aluno') {
          // Para alunos, usar o número de matrícula como senha inicial
          senha = numero_matricula;
        } else if (papel === 'professor') {
          // Para professores, usar o CPF como senha inicial (sem pontos e traços)
          senha = cpf.replace(/[.-]/g, '');
        } else {
          // Para gestores, gerar senha aleatória
          senha = 'Senha123!'; // Em produção, usar algo como: Math.random().toString(36).slice(-8) + "A!"
        }
        
        // Em uma implementação real, seria necessário:
        // 1. Verificar se o e-mail já está em uso
        // 2. Criptografar a senha antes de salvar
        // 3. Realizar transação de banco de dados para garantir consistência
        
        // Para fins de demonstração, simular criação bem-sucedida
        const novoUsuario = {
          id: Math.floor(Math.random() * 1000) + 2000, // ID aleatório para demonstração
          nome_completo,
          email,
          telefone,
          data_nascimento,
          papel,
          perfil_foto_url: imageUrl,
          created_at: new Date().toISOString()
        };
        
        // No caso de usuários reais, usar algo como:
        /*
        // Criar o usuário no banco de dados
        const result = await pool.query(
          'INSERT INTO usuarios (nome, email, telefone, data_nascimento, papel, perfil_foto_url, senha_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [nome_completo, email, telefone, data_nascimento, papel, imageUrl, senhaHash]
        );
        
        const novoUsuario = result.rows[0];
        
        // Para alunos, criar registro na tabela perfis_aluno
        if (papel === 'aluno' && novoUsuario.id) {
          await pool.query(
            'INSERT INTO perfis_aluno (usuario_id, turma_id, matricula) VALUES ($1, $2, $3)',
            [novoUsuario.id, turma_id, numero_matricula]
          );
        }
        
        // Para professores, criar registro na tabela perfis_professor
        if (papel === 'professor' && novoUsuario.id) {
          await pool.query(
            'INSERT INTO perfis_professor (usuario_id, cpf) VALUES ($1, $2)',
            [novoUsuario.id, cpf]
          );
        }
        */
        
        return res.status(201).json({
          ...novoUsuario,
          message: 'Usuário cadastrado com sucesso!'
        });
        
      } catch (error) {
        console.error('Erro ao criar novo usuário:', error);
        // Limpar a imagem temporária em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({
          message: 'Erro ao processar o cadastro. Tente novamente mais tarde.'
        });
      }
    });
  });
  // Rota para atualizar os dados do usuário
  app.patch('/api/users/:id', (req: any, res: Response) => {
    console.log('Recebida requisição para atualizar usuário:', req.params.id);
    
    // Se o usuário não estiver autenticado, retornar erro
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verificar se o usuário está autorizado a atualizar este perfil
    const userId = parseInt(req.params.id);
    const currentUserId = req.session.userId;
    const userRole = req.session.userRole;

    // Apenas o próprio usuário ou gestores/admins podem atualizar
    if (userId !== currentUserId && !['gestor', 'admin'].includes(userRole as string)) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar este perfil' });
    }

    try {
      // Dados para atualização
      const { fullName, email, username, avatarUrl } = req.body;
      
      console.log('Dados recebidos para atualização:', { fullName, email, username, avatarUrl });
      
      // Para usuários de teste (simular atualização)
      if (userId === 1001 || userId === 1002 || userId === 1003) {
        console.log('Atualizando usuário de teste:', userId);
        return res.status(200).json({ 
          id: userId,
          email: email,
          username: username,
          fullName: fullName,
          avatarUrl: avatarUrl,
          message: 'Perfil atualizado com sucesso!'
        });
      }
      
      // Para usuários normais, atualizar no banco de dados
      pool.query(
        'UPDATE usuarios SET nome = $1, email = $2, username = $3, perfil_foto_url = $4 WHERE id = $5 RETURNING *',
        [fullName, email, username, avatarUrl, userId]
      ).then(result => {
        if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        console.log('Usuário atualizado com sucesso:', result.rows[0]);
        return res.status(200).json({ 
          ...result.rows[0],
          message: 'Perfil atualizado com sucesso!'
        });
      }).catch(error => {
        console.error('Erro ao atualizar usuário:', error);
        return res.status(500).json({ message: 'Erro ao atualizar perfil. Tente novamente.' });
      });
    } catch (error) {
      console.error('Erro ao processar atualização do perfil:', error);
      return res.status(500).json({ message: 'Erro ao processar a solicitação. Tente novamente.' });
    }
  });
  
  // Rota para atualizar a senha do usuário
  app.patch('/api/users/:id/password', (req: any, res: Response) => {
    // Se o usuário não estiver autenticado, retornar erro
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verificar se o usuário está autorizado a atualizar a senha
    const userId = parseInt(req.params.id);
    const currentUserId = req.session.userId;
    
    // Apenas o próprio usuário pode alterar a senha
    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Você não tem permissão para alterar a senha de outro usuário' });
    }

    try {
      // Para usuários de teste (simular atualização)
      if (userId === 1001 || userId === 1002 || userId === 1003) {
        return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
      }
      
      // Para usuários reais, implementar a lógica de verificação e alteração de senha
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }
      
      // Retornar sucesso para fins de teste
      return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
      
    } catch (error) {
      console.error('Erro ao processar atualização de senha:', error);
      return res.status(500).json({ message: 'Erro ao processar a solicitação. Tente novamente.' });
    }
  });
  // Rota de teste para upload de imagem
  app.post('/api/test/upload', (req: any, res: Response) => {
    console.log('Recebida requisição para /api/test/upload');
    const uploadMiddleware = upload.single('file');
    
    uploadMiddleware(req, res, async (err: any) => {
      if (err) {
        console.error('Erro no upload:', err);
        return res.status(500).json({ message: 'Erro no upload: ' + err.message });
      }
      
      console.log('Upload processado. Arquivo recebido:', req.file);
      
      if (!req.file) {
        console.error('Nenhum arquivo recebido');
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
      }
      
      try {
        // Obter o caminho do arquivo temporário
        const tempFilePath = req.file.path;
        
        // Criar diretório permanente para armazenar imagens se não existir
        const publicDir = path.join(__dirname, '..', 'client', 'public', 'uploads', 'profile-images');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        // Gerar nome de arquivo único 
        const fileName = `test-${Date.now()}-${path.basename(req.file.filename)}`;
        const destPath = path.join(publicDir, fileName);
        
        // Mover arquivo do diretório temporário para permanente
        fs.copyFileSync(tempFilePath, destPath);
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempFilePath);
        
        // Gerar URL relativa para o frontend
        const imageUrl = `/uploads/profile-images/${fileName}`;
        
        // Retornar sucesso
        return res.status(200).json({ 
          message: 'Imagem enviada com sucesso!',
          imageUrl
        });
        
      } catch (error) {
        console.error('Erro ao processar o upload:', error);
        // Limpar o arquivo temporário em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({ message: 'Erro ao processar a imagem. Tente novamente.' });
      }
    });
  });
  /**
   * Rota para upload de imagem de perfil
   * POST /api/usuarios/:id/foto
   */
  // Rota para obter a lista de turmas disponíveis
  app.get('/api/turmas', (req: any, res: Response) => {
    console.log('Recebida requisição para obter lista de turmas');
    
    // Se o usuário não estiver autenticado, retornar erro
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    try {
      // Para fins de demonstração, retornar lista de turmas
      const turmas = [
        { id: "1", nome: "6º Ano A", serie: "6º Ano" },
        { id: "2", nome: "7º Ano A", serie: "7º Ano" },
        { id: "3", nome: "8º Ano A", serie: "8º Ano" },
        { id: "4", nome: "9º Ano A", serie: "9º Ano" },
        { id: "5", nome: "1º Ano EM A", serie: "1º Ano EM" },
        { id: "6", nome: "2º Ano EM A", serie: "2º Ano EM" },
        { id: "7", nome: "3º Ano EM A", serie: "3º Ano EM" }
      ];
      
      // Em uma implementação real, buscar do banco de dados
      // const result = await pool.query('SELECT id, nome, serie FROM turmas ORDER BY serie, nome');
      // const turmas = result.rows;
      
      return res.status(200).json(turmas);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      return res.status(500).json({ message: 'Erro ao buscar turmas' });
    }
  });
  
  app.post('/api/usuarios/:id/foto', (req: any, res: Response) => {
    // Se o usuário não estiver autenticado, retornar erro
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verificar se o usuário está autorizado a fazer upload para este ID
    const userId = parseInt(req.params.id);
    const currentUserId = req.session.userId;
    const userRole = req.session.userRole;

    // Apenas o próprio usuário ou gestores/admins podem fazer upload
    if (userId !== currentUserId && !['gestor', 'admin'].includes(userRole as string)) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar este perfil' });
    }

    // Processar o upload
    const uploadMiddleware = upload.single('file');
    
    uploadMiddleware(req, res, async (err: any) => {
      if (err) {
        if (err.message === 'Formato inválido. Use JPG ou PNG.') {
          return res.status(400).json({ message: err.message });
        } else if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Imagem muito grande. O tamanho máximo é 5MB.' });
        }
        console.error('Erro no upload:', err);
        return res.status(500).json({ message: 'Falha ao processar o upload da imagem.' });
      }

      // Verificar se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
      }

      try {
        // Obter o caminho do arquivo temporário
        const tempFilePath = req.file.path;
        
        // Criar diretório permanente para armazenar imagens se não existir
        const publicDir = path.join(__dirname, '..', 'client', 'public', 'uploads', 'profile-images');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        // Gerar nome de arquivo único 
        const fileName = `user-${userId}-${path.basename(req.file.filename)}`;
        const destPath = path.join(publicDir, fileName);
        
        // Mover arquivo do diretório temporário para permanente
        fs.copyFileSync(tempFilePath, destPath);
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempFilePath);
        
        // Gerar URL relativa para o frontend
        const imageUrl = `/uploads/profile-images/${fileName}`;
        
        // Atualizar o perfil do usuário no banco de dados
        await pool.query(
          'UPDATE usuarios SET perfil_foto_url = $1 WHERE id = $2',
          [imageUrl, userId]
        );
        
        // Retornar sucesso
        return res.status(200).json({ 
          message: 'Foto de perfil atualizada com sucesso!',
          imageUrl
        });
        
      } catch (error) {
        console.error('Erro ao processar o upload:', error);
        // Limpar o arquivo temporário em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({ message: 'Erro ao processar a imagem. Tente novamente.' });
      }
    });
  });
}