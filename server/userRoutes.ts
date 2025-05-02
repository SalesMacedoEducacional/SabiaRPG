import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { pool } from './db';
import session from 'express-session';

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
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
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
  /**
   * Rota para upload de imagem de perfil
   * POST /api/usuarios/:id/foto
   */
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