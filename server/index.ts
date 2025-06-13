import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';
import { createServer } from 'vite';

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

// Setup server startup
async function startServer() {
  // Setup Vite dev server for frontend
  if (process.env.NODE_ENV === 'development') {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: join(__dirname, '../')
    });
    
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(join(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, '../dist/index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

startServer().catch(console.error);