import express from 'express';
import { db } from './db';
import { createClient } from '@supabase/supabase-js';
import { eq, and } from 'drizzle-orm';
import { escolas, perfilGestor, usuarios } from '@shared/schema';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = express.Router();

// Cliente Supabase com chave de serviço para operações administrativas
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  next();
};

// Middleware para verificar se o usuário é um gestor
const isManager = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  
  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, req.user.id),
    });
    
    if (!user || user.papel !== 'gestor') {
      return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem acessar esta rota.' });
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar papel do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Rota para obter informações do gestor, incluindo se tem escola vinculada
router.get('/manager/info', isAuthenticated, async (req, res) => {
  try {
    // Verificar se existe um perfil de gestor para este usuário
    const gestorPerfil = await db.query.perfilGestor.findFirst({
      where: eq(perfilGestor.usuarioId, req.user!.id),
    });
    
    // Verificar se tem escola vinculada
    const escolaInfo = gestorPerfil?.escolaId 
      ? await db.query.escolas.findFirst({
          where: eq(escolas.id, gestorPerfil.escolaId),
        })
      : null;
    
    // Preparar resposta
    const response = {
      id: req.user!.id,
      hasSchool: !!escolaInfo,
      schoolId: escolaInfo?.id || null,
      schoolName: escolaInfo?.nome || null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar informações do gestor:', error);
    res.status(500).json({ message: 'Erro ao buscar informações do gestor' });
  }
});

// Rota para cadastrar uma nova escola
router.post('/escolas/cadastrar', isAuthenticated, isManager, async (req, res) => {
  try {
    const { 
      nome, 
      endereco, 
      cidade, 
      estado, 
      cep, 
      telefone, 
      email, 
      tipo, 
      nivelEnsino, 
      descricao,
      gestorId 
    } = req.body;
    
    // Verificar se o gestor já tem uma escola vinculada
    const gestorExistente = await db.query.perfilGestor.findFirst({
      where: eq(perfilGestor.usuarioId, gestorId),
    });
    
    let escolaExistente = null;
    if (gestorExistente?.escolaId) {
      escolaExistente = await db.query.escolas.findFirst({
        where: eq(escolas.id, gestorExistente.escolaId),
      });
    }
    
    if (escolaExistente) {
      return res.status(400).json({ 
        message: 'Este gestor já possui uma escola vinculada',
        escola: escolaExistente
      });
    }
    
    // Gerar código único para escola
    const codigoEscola = `SCH-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Inserir nova escola
    const [novaEscola] = await db.insert(escolas).values({
      nome,
      codigoEscola,
      endereco,
      cidade,
      estado,
      tipo,
      modalidadeEnsino: nivelEnsino,
      zonaGeografica: 'urbana', // valor padrão
      telefone: telefone || null,
      emailInstitucional: email || null,
    }).returning();
    
    // Verificar se o gestor já tem um perfil
    if (gestorExistente) {
      // Atualizar o perfil existente com a nova escola
      await db.update(perfilGestor)
        .set({ escolaId: novaEscola.id })
        .where(eq(perfilGestor.id, gestorExistente.id));
    } else {
      // Criar novo perfil de gestor vinculado à escola
      await db.insert(perfilGestor).values({
        usuarioId: gestorId,
        escolaId: novaEscola.id,
        cargo: 'Diretor',
      });
    }
    
    res.status(201).json({ 
      message: 'Escola cadastrada com sucesso',
      escola: novaEscola
    });
  } catch (error) {
    console.error('Erro ao cadastrar escola:', error);
    res.status(500).json({ message: 'Erro ao cadastrar escola' });
  }
});

// Rota para obter perfil do usuário
router.get('/profile/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se o usuário está tentando acessar seu próprio perfil
    if (req.user!.id !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar seu próprio perfil.' });
    }
    
    // Buscar dados do usuário
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Retornar dados do perfil
    res.json({
      id: user.id,
      email: user.email,
      cpf: user.cpf,
      papel: user.papel,
      criadoEm: user.criadoEm
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Rota para atualizar perfil do usuário
router.put('/profile/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se o usuário está tentando atualizar seu próprio perfil
    if (req.user!.id !== userId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar seu próprio perfil.' });
    }
    
    const { 
      email
    } = req.body;
    
    // Atualizar dados do usuário no banco
    const [updatedUser] = await db.update(usuarios)
      .set({
        email
      })
      .where(eq(usuarios.id, userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Também atualizar o email no Supabase Auth
    try {
      const { error } = await adminSupabase.auth.admin.updateUserById(
        userId,
        { email }
      );
      
      if (error) {
        console.error('Erro ao atualizar email no Supabase Auth:', error);
      }
    } catch (authError) {
      console.error('Erro ao se comunicar com Supabase Auth:', authError);
      // Não interrompe o fluxo pois a atualização no banco foi bem sucedida
    }
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        papel: updatedUser.papel,
        cpf: updatedUser.cpf
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

export default router;