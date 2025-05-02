import { Express, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { apiRequest } from '@/lib/queryClient';
import { db, supabase } from './db';

// Configurar o multer para armazenar arquivos temporariamente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verificar se o diretório existe, se não, criar
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniquePrefix = `${Date.now()}-${randomUUID()}`;
    const extname = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniquePrefix}${extname}`);
  }
});

// Filtro para permitir apenas JPG e PNG
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  app.post('/api/usuarios/:id/foto', (req: Request, res: Response) => {
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
    
    uploadMiddleware(req, res, async (err) => {
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
        // Upload para o storage do Supabase
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath);
        
        // Nome do bucket pode variar de acordo com seu projeto
        const bucketName = 'profile-images';
        const objectName = `user-${userId}/${path.basename(req.file.filename)}`;
        
        // Upload para o Supabase Storage
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .upload(objectName, fileContent, {
            contentType: req.file.mimetype,
            upsert: true,
          });
        
        if (error) {
          console.error('Erro no Supabase Storage:', error);
          return res.status(500).json({ message: 'Falha ao salvar a imagem.' });
        }
        
        // Gerar URL pública
        const imageUrl = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(objectName).data.publicUrl;
        
        // Atualizar o perfil do usuário no banco de dados
        await db.query(
          'UPDATE usuarios SET perfil_foto_url = $1 WHERE id = $2',
          [imageUrl, userId]
        );
        
        // Limpar o arquivo temporário
        fs.unlinkSync(filePath);
        
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