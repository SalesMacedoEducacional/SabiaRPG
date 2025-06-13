import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from './vite.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import database functions
import { updateUserDirect, deleteUserDirect } from './directDatabase';

// GET /api/users/manager - Buscar usuários com PostgreSQL direto
app.get('/api/users/manager', async (req, res) => {
  try {
    console.log('=== BUSCA SINCRONIZADA COM POSTGRESQL ===');
    
    const { getUsersWithPostgreSQL } = await import('./usersEndpoint');
    const result = await getUsersWithPostgreSQL();
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// PUT /api/usuarios/:id - Editar usuário
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    console.log('=== PUT /api/usuarios/:id ===');
    console.log('ID do usuário:', req.params.id);
    console.log('Dados:', req.body);
    
    const result = await updateUserDirect(req.params.id, req.body);
    
    if (result.success) {
      console.log('Usuário atualizado com sucesso:', result.data);
      res.json({ 
        success: true, 
        message: 'Usuário atualizado com sucesso',
        data: result.data
      });
    } else {
      console.log('Falha na atualização:', result.error);
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    console.error('Erro no endpoint de edição:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/usuarios/:id - Excluir usuário
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    console.log('=== DELETE /api/usuarios/:id ===');
    console.log('ID do usuário:', req.params.id);
    
    const result = await deleteUserDirect(req.params.id);
    
    if (result.success) {
      console.log('Usuário excluído com sucesso:', result.data);
      res.json({ 
        success: true, 
        message: 'Usuário excluído com sucesso',
        data: result.data
      });
    } else {
      console.log('Falha na exclusão:', result.error);
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    console.error('Erro no endpoint de exclusão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Game API endpoints
app.get('/api/locations', async (req, res) => {
  try {
    const locations = [
      {
        id: 1,
        name: 'Teresina - A Cidade das Duas Correntes',
        description: 'Fortaleza Arcanomural: As muralhas de pedra negra são cravadas de runas que se acendem à noite.',
        coordinates: { x: 45, y: 35 },
        icon: 'castle',
        unlockLevel: 1
      },
      {
        id: 2,
        name: 'Serra da Capivara - O Desfiladeiro Ancestral',
        description: 'Cânions Sangrentos: Rochas avermelhadas são marcadas por ecochifres ancestrais.',
        coordinates: { x: 25, y: 55 },
        icon: 'mountain',
        unlockLevel: 3
      },
      {
        id: 3,
        name: 'Delta do Parnaíba - As Corredeiras Encantadas',
        description: 'Ilha das Sereianas: No labirinto de canais, pequenas sereias tecem redes de magia.',
        coordinates: { x: 20, y: 25 },
        icon: 'water',
        unlockLevel: 5
      },
      {
        id: 4,
        name: 'Oeiras - O Enclave Barroco',
        description: 'Igreja dos Ecos: Ao tocar o sino talhado em mármore negro, vozes ancestrais sussurram segredos.',
        coordinates: { x: 55, y: 45 },
        icon: 'landmark',
        unlockLevel: 7
      }
    ];
    res.json(locations);
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/learning-paths', async (req, res) => {
  try {
    const learningPaths = [
      {
        id: 1,
        title: 'Fundamentos da Matemática',
        description: 'Explore os mistérios dos números através de aventuras épicas.',
        area: 'Matemática',
        difficulty: 1,
        requiredLevel: 1,
        locationId: 1
      },
      {
        id: 2,
        title: 'Língua Portuguesa Ancestral',
        description: 'Desvende os segredos da comunicação através de runas antigas.',
        area: 'Português',
        difficulty: 1,
        requiredLevel: 1,
        locationId: 1
      },
      {
        id: 3,
        title: 'Ciências da Natureza',
        description: 'Descubra os elementos místicos que regem o mundo natural.',
        area: 'Ciências',
        difficulty: 2,
        requiredLevel: 3,
        locationId: 2
      }
    ];
    res.json(learningPaths);
  } catch (error) {
    console.error('Erro ao buscar caminhos de aprendizagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/missions', async (req, res) => {
  try {
    const missions = [
      {
        id: 1,
        title: 'A Primeira Soma',
        description: 'Ajude os mercadores de Teresina a calcular seus lucros.',
        area: 'Matemática',
        difficulty: 1,
        requiredLevel: 1,
        xpReward: 100,
        pathId: 1
      },
      {
        id: 2,
        title: 'Decifrando Runas',
        description: 'Traduza as antigas escritas encontradas nas muralhas.',
        area: 'Português',
        difficulty: 1,
        requiredLevel: 1,
        xpReward: 100,
        pathId: 2
      }
    ];
    res.json(missions);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/user-progress', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Erro ao buscar progresso do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = [
      {
        id: 1,
        title: 'Primeiro Passo',
        description: 'Complete sua primeira missão',
        iconUrl: '/icons/first-step.png',
        xpReward: 50
      },
      {
        id: 2,
        title: 'Explorador Iniciante',
        description: 'Visite 3 localizações diferentes',
        iconUrl: '/icons/explorer.png',
        xpReward: 150
      }
    ];
    res.json(achievements);
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/user-achievements', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Erro ao buscar conquistas do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/api/user-diagnostics', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Erro ao buscar diagnósticos do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Setup server startup
async function startServer() {
  const PORT = Number(process.env.PORT) || 5000;
  
  if (process.env.NODE_ENV === 'development') {
    const server = createServer(app);
    await setupVite(app, server);
    server.listen(PORT, '0.0.0.0', () => {
      log(`serving on port ${PORT}`);
    });
  } else {
    serveStatic(app);
    app.listen(PORT, '0.0.0.0', () => {
      log(`serving on port ${PORT}`);
    });
  }
}

startServer().catch(console.error);