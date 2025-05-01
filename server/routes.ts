import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import { z } from "zod";
import MemoryStore from "memorystore";
import { 
  insertUserSchema,
  insertLearningPathSchema,
  insertMissionSchema,
  insertLocationSchema,
  insertUserProgressSchema,
  insertAchievementSchema,
  insertUserAchievementSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertDiagnosticQuestionSchema,
  insertUserDiagnosticSchema
} from "@shared/schema";
import { 
  generateFeedback, 
  generateDiagnosticRecommendation, 
  generatePersonalizedRecommendations 
} from "./openai";
import OpenAI from "openai";
import { initializeDatabase } from "../db/supabase";

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey 
  ? new OpenAI({ apiKey: openaiApiKey }) 
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'sabia-rpg-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 }, // 24 hours
    store: new SessionStore({ checkPeriod: 86400000 }) // prune expired entries every 24h
  }));
  
  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  
  // Rota para testar a conexão com o Supabase
  app.get("/api/test/supabase", async (_req, res) => {
    try {
      // Tentar buscar os usuários do banco de dados Supabase
      const users = await storage.getUsers();
      res.json({ 
        status: "ok", 
        message: "Conexão com Supabase bem-sucedida", 
        usersCount: users.length,
        // Não expomos dados sensíveis, apenas email para testes
        users: users.map(user => ({ id: user.id, email: user.email, role: user.role }))
      });
    } catch (error) {
      console.error("Erro ao testar conexão com Supabase:", error);
      res.status(500).json({ 
        status: "error", 
        message: `Erro ao conectar com Supabase: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    }
  });
  
  // Rota para inicializar o banco de dados
  app.post("/api/test/initialize-database", async (req, res) => {
    try {
      // SQL para criar as tabelas
      const sqlSchema = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS escolas (
          id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome          text        NOT NULL,
          codigo_escola text        UNIQUE NOT NULL,
          criado_em     timestamp   DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS usuarios (
          id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
          email         text        UNIQUE NOT NULL,
          senha_hash    text        NOT NULL,
          papel         text        NOT NULL CHECK (papel IN ('aluno','professor','gestor')),
          criado_em     timestamp   DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS matriculas (
          id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          escola_id        uuid      REFERENCES escolas(id) ON DELETE CASCADE,
          numero_matricula text      UNIQUE NOT NULL,
          nome_aluno       text      NOT NULL,
          turma            text,
          criado_em        timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS perfis_aluno (
          id             uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          usuario_id     uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
          matricula_id   uuid      REFERENCES matriculas(id) ON DELETE RESTRICT,
          avatar_image   text,
          nivel          integer   DEFAULT 1,
          xp             integer   DEFAULT 0,
          criado_em      timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS trilhas (
          id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          titulo     text      NOT NULL,
          disciplina text      NOT NULL,
          nivel      integer   NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS missoes (
          id            uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          trilha_id     uuid      REFERENCES trilhas(id) ON DELETE CASCADE,
          titulo        text      NOT NULL,
          descricao     text      NOT NULL,
          ordem         integer   NOT NULL,
          xp_recompensa integer   DEFAULT 10
        );
        
        CREATE TABLE IF NOT EXISTS progresso_aluno (
          id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          perfil_id        uuid      REFERENCES perfis_aluno(id) ON DELETE CASCADE,
          missao_id        uuid      REFERENCES missoes(id) ON DELETE CASCADE,
          status           text      NOT NULL CHECK (status IN ('pendente','concluida','falhada')),
          resposta         text,
          feedback_ia      text,
          xp_ganho         integer,
          atualizado_em    timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS conquistas (
          id        uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome      text    NOT NULL,
          icone     text,
          criterio  text
        );
        
        CREATE TABLE IF NOT EXISTS aluno_conquistas (
          id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          perfil_id        uuid      REFERENCES perfis_aluno(id) ON DELETE CASCADE,
          conquista_id     uuid      REFERENCES conquistas(id) ON DELETE CASCADE,
          concedido_em     timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS notificacoes (
          id              uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          destinatario_id uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
          tipo            text      NOT NULL,
          conteudo        text      NOT NULL,
          enviado_em      timestamp DEFAULT now(),
          lido_em         timestamp
        );
        
        CREATE TABLE IF NOT EXISTS foruns (
          id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          titulo     text      NOT NULL,
          criado_em  timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS posts_forum (
          id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          forum_id   uuid      REFERENCES foruns(id) ON DELETE CASCADE,
          usuario_id uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
          conteudo   text      NOT NULL,
          criado_em  timestamp DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS configuracoes (
          chave   text PRIMARY KEY,
          valor   text
        );
        
        CREATE TABLE IF NOT EXISTS logs_auditoria (
          id          uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
          usuario_id  uuid      REFERENCES usuarios(id),
          acao        text      NOT NULL,
          detalhes    text,
          criado_em   timestamp DEFAULT now()
        );
        
        -- Tabelas específicas para o mapa
        CREATE TABLE IF NOT EXISTS locais (
          id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome        text        NOT NULL,
          descricao   text        NOT NULL,
          coordenada_x integer     NOT NULL,
          coordenada_y integer     NOT NULL,
          icone       text        NOT NULL,
          nivel_req   integer     DEFAULT 1
        );
      `;
      
      // Inicializando o banco de dados
      const result = await initializeDatabase(sqlSchema);
      
      if (result) {
        return res.json({
          status: "ok",
          message: "Banco de dados inicializado com sucesso"
        });
      } else {
        return res.status(500).json({
          status: "error",
          message: "Não foi possível inicializar o banco de dados. Verifique os logs para mais detalhes."
        });
      }
    } catch (error) {
      console.error("Erro ao inicializar banco de dados:", error);
      return res.status(500).json({
        status: "error",
        message: `Erro ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  });
  
  // Rota de teste para missões e conquistas
  app.get("/api/test/game-content", async (_req, res) => {
    try {
      // Buscar missões com logs
      console.log("Buscando missões...");
      const missions = await storage.getMissions();
      console.log(`Missões encontradas: ${missions.length}`);
      
      // Buscar conquistas com logs
      console.log("Buscando conquistas...");
      const achievements = await storage.getAchievements();
      console.log(`Conquistas encontradas: ${achievements.length}`);

      // Buscar localizações com logs
      console.log("Buscando localizações...");
      const locations = await storage.getLocations();
      console.log(`Localizações encontradas: ${locations.length}`);
      
      // Buscar trilhas de aprendizagem com logs
      console.log("Buscando trilhas...");
      const learningPaths = await storage.getLearningPaths();
      console.log(`Trilhas encontradas: ${learningPaths.length}`);
      
      return res.json({
        status: "ok",
        data: {
          missions: missions.slice(0, 3), // limitar para 3 itens
          missionsCount: missions.length,
          achievements: achievements.slice(0, 3), // limitar para 3 itens 
          achievementsCount: achievements.length,
          locations: locations.slice(0, 3),
          locationsCount: locations.length,
          learningPaths: learningPaths.slice(0, 3),
          learningPathsCount: learningPaths.length
        }
      });
    } catch (error) {
      console.error("Erro ao buscar conteúdo do jogo:", error);
      return res.status(500).json({
        status: "error",
        message: `Erro ao buscar conteúdo do jogo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  });
  
  // Rota para acessar os dados simulados de desenvolvimento
  app.get("/api/test/mock-data", async (_req, res) => {
    try {
      // Acesso às collections de dados simulados
      // Verificamos se o storage é uma instância de SupabaseStorage para acessar os dados simulados
      const mockData: any = {
        locations: [],
        learningPaths: [],
        missions: [],
        achievements: []
      };
      
      // Verificamos se o storage tem as propriedades mockLocations, etc.
      if ('mockLocations' in storage) {
        // Convertemos os Maps para arrays
        const storageWithMocks = storage as any;
        
        // Convertemos os mapas para arrays
        if (storageWithMocks.mockLocations) {
          mockData.locations = Array.from(storageWithMocks.mockLocations.values());
        }
        
        if (storageWithMocks.mockLearningPaths) {
          mockData.learningPaths = Array.from(storageWithMocks.mockLearningPaths.values());
        }
        
        if (storageWithMocks.mockMissions) {
          mockData.missions = Array.from(storageWithMocks.mockMissions.values());
        }
        
        if (storageWithMocks.mockAchievements) {
          mockData.achievements = Array.from(storageWithMocks.mockAchievements.values());
        }
      }
      
      return res.json({
        status: "ok",
        message: "Dados simulados para desenvolvimento",
        data: mockData,
        counts: {
          locations: mockData.locations.length,
          learningPaths: mockData.learningPaths.length,
          missions: mockData.missions.length,
          achievements: mockData.achievements.length
        }
      });
    } catch (error) {
      console.error("Erro ao acessar dados simulados:", error);
      return res.status(500).json({
        status: "error",
        message: `Erro ao acessar dados simulados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  });
  
  // Função auxiliar para atrasar a execução
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Rota para adicionar dados de demonstração para testes
  app.post("/api/test/seed-demo-data", async (_req, res) => {
    try {
      // Criar uma localização se não existir nenhuma
      const locations = await storage.getLocations();
      let locationId = 0;
      
      if (locations.length === 0) {
        const newLocation = await storage.createLocation({
          name: "Teresina",
          description: "Capital do Piauí",
          coordinates: { x: 50, y: 50 },
          icon: "castle",
          unlockLevel: 1
        });
        locationId = newLocation.id;
      } else {
        locationId = locations[0].id;
      }

      // Pequeno delay para garantir IDs únicos
      await delay(10);
      
      // Criar um learning path
      const learningPath = await storage.createLearningPath({
        title: "Matemática Básica",
        description: "Trilha de aprendizado para matemática fundamental",
        area: "mathematics",
        difficulty: 1,
        requiredLevel: 1,
        imageUrl: "math_path.jpg",
        locationId
      });
      
      // Pequeno delay para garantir IDs únicos
      await delay(10);
      
      // Criar missões
      const mission1 = await storage.createMission({
        title: "Operações Básicas",
        description: "Aprenda a somar, subtrair, multiplicar e dividir",
        area: "mathematics",
        difficulty: 1,
        xpReward: 100,
        pathId: learningPath.id,
        estimatedTime: 30,
        sequence: 1,
        content: {
          sections: [
            {
              title: "Adição e Subtração",
              content: "Conteúdo da seção sobre adição e subtração"
            },
            {
              title: "Multiplicação e Divisão",
              content: "Conteúdo da seção sobre multiplicação e divisão"
            }
          ]
        },
        objectives: ["Somar números naturais", "Subtrair números naturais", "Multiplicar números naturais", "Dividir números naturais"]
      });
      
      // Pequeno delay para garantir IDs únicos
      await delay(10);
      
      const mission2 = await storage.createMission({
        title: "Frações",
        description: "Aprenda os conceitos básicos de frações",
        area: "mathematics",
        difficulty: 1,
        xpReward: 150,
        pathId: learningPath.id,
        estimatedTime: 45,
        sequence: 2,
        objectives: ["Entender o conceito de fração", "Somar frações", "Subtrair frações"]
      });
      
      // Pequeno delay para garantir IDs únicos
      await delay(10);
      
      // Criar conquistas
      const achievement1 = await storage.createAchievement({
        title: "Primeiro Passo",
        description: "Completou sua primeira missão",
        area: "general",
        iconName: "trophy",
        category: "beginner",
        points: 10
      });
      
      // Pequeno delay para garantir IDs únicos
      await delay(10);
      
      const achievement2 = await storage.createAchievement({
        title: "Matemático Iniciante",
        description: "Completou 3 missões de matemática",
        area: "mathematics",
        iconName: "calculator",
        category: "subject",
        points: 25
      });
      
      return res.json({
        status: "ok",
        message: "Dados de demonstração criados com sucesso",
        data: {
          location: { id: locationId },
          learningPath: { id: learningPath.id },
          missions: [
            { id: mission1.id },
            { id: mission2.id }
          ],
          achievements: [
            { id: achievement1.id },
            { id: achievement2.id }
          ]
        }
      });
    } catch (error) {
      console.error("Erro ao criar dados de demonstração:", error);
      return res.status(500).json({
        status: "error",
        message: `Erro ao criar dados de demonstração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  });

  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Role authorization middleware
  const authorize = (roles: string[]) => {
    return async (req: Request, res: Response, next: Function) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    };
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log("Login attempt:", { email });
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Debug usuarios de teste
      if (email === 'aluno@exemplo.com' && password === 'Senha123!') {
        // Criar um usuário simulado para testes
        const testUser = {
          id: 1001,
          email: 'aluno@exemplo.com',
          username: 'aluno_teste',
          fullName: 'Aluno de Teste',
          role: 'student',
          level: 1,
          xp: 0,
          createdAt: new Date()
        };
        
        // Set session
        req.session.userId = testUser.id;
        req.session.userRole = testUser.role;
        
        console.log("Login successful for test user (student):", testUser.email);
        console.log("Session:", req.session);
        
        return res.status(200).json(testUser);
      }
      
      if (email === 'professor@exemplo.com' && password === 'Senha123!') {
        // Criar um usuário simulado para testes
        const testUser = {
          id: 1002,
          email: 'professor@exemplo.com',
          username: 'professor_teste',
          fullName: 'Professor de Teste',
          role: 'teacher',
          level: 5,
          xp: 500,
          createdAt: new Date()
        };
        
        // Set session
        req.session.userId = testUser.id;
        req.session.userRole = testUser.role;
        
        console.log("Login successful for test user (teacher):", testUser.email);
        console.log("Session:", req.session);
        
        return res.status(200).json(testUser);
      }
      
      if (email === 'gestor@exemplo.com' && password === 'Senha123!') {
        // Criar um usuário simulado para testes
        const testUser = {
          id: 1003,
          email: 'gestor@exemplo.com',
          username: 'gestor_teste',
          fullName: 'Gestor de Teste',
          role: 'manager',
          level: 10,
          xp: 1000,
          createdAt: new Date()
        };
        
        // Set session
        req.session.userId = testUser.id;
        req.session.userRole = testUser.role;
        
        console.log("Login successful for test user (manager):", testUser.email);
        console.log("Session:", req.session);
        
        return res.status(200).json(testUser);
      }
      
      // Find user from database (para usuários normais)
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      console.log("Login successful for user:", user.email);
      console.log("Session:", req.session);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log("Session check on /api/auth/me:", req.session);
      
      // Check if the user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Handle test users
      if (req.session.userId === 1001) {
        // Aluno de teste
        return res.status(200).json({
          id: 1001,
          email: 'aluno@exemplo.com',
          username: 'aluno_teste',
          fullName: 'Aluno de Teste',
          role: 'student',
          level: 1,
          xp: 0,
          createdAt: new Date()
        });
      }
      
      if (req.session.userId === 1002) {
        // Professor de teste
        return res.status(200).json({
          id: 1002,
          email: 'professor@exemplo.com',
          username: 'professor_teste',
          fullName: 'Professor de Teste',
          role: 'teacher',
          level: 5,
          xp: 500,
          createdAt: new Date()
        });
      }
      
      if (req.session.userId === 1003) {
        // Gestor de teste
        return res.status(200).json({
          id: 1003,
          email: 'gestor@exemplo.com',
          username: 'gestor_teste',
          fullName: 'Gestor de Teste',
          role: 'manager',
          level: 10,
          xp: 1000,
          createdAt: new Date()
        });
      }
      
      // Get user from database for regular users
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error fetching user" });
    }
  });

  // User routes
  app.get("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only return public user data for other users
      if (req.session.userId !== userId) {
        return res.status(200).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          level: user.level,
          xp: user.xp
        });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user" });
    }
  });

  app.patch("/api/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Ensure users can only update their own data unless they're managers
      if (req.session.userId !== userId && req.session.userRole !== "manager") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error updating user" });
    }
  });

  // Learning paths routes
  app.get("/api/learning-paths", authenticate, async (req, res) => {
    try {
      const area = req.query.area as string | undefined;
      
      let paths;
      if (area) {
        paths = await storage.getLearningPathsByArea(area);
      } else {
        paths = await storage.getLearningPaths();
      }
      
      res.status(200).json(paths);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", authenticate, async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      if (isNaN(pathId)) {
        return res.status(400).json({ message: "Invalid path ID" });
      }
      
      const path = await storage.getLearningPath(pathId);
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      res.status(200).json(path);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching learning path" });
    }
  });

  app.post("/api/learning-paths", authorize(["teacher", "manager"]), async (req, res) => {
    try {
      const pathData = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(pathData);
      res.status(201).json(path);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating learning path" });
    }
  });

  // Missions routes
  app.get("/api/missions", authenticate, async (req, res) => {
    try {
      const pathId = req.query.pathId ? parseInt(req.query.pathId as string) : undefined;
      
      let missions;
      if (pathId && !isNaN(pathId)) {
        missions = await storage.getMissionsByPath(pathId);
      } else {
        missions = await storage.getMissions();
      }
      
      res.status(200).json(missions);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching missions" });
    }
  });

  app.get("/api/missions/:id", authenticate, async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      if (isNaN(missionId)) {
        return res.status(400).json({ message: "Invalid mission ID" });
      }
      
      const mission = await storage.getMission(missionId);
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }
      
      res.status(200).json(mission);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching mission" });
    }
  });

  app.post("/api/missions", authorize(["teacher", "manager"]), async (req, res) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(missionData);
      res.status(201).json(mission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating mission" });
    }
  });

  // Locations routes
  app.get("/api/locations", authenticate, async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching locations" });
    }
  });

  app.get("/api/locations/:id", authenticate, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const location = await storage.getLocation(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching location" });
    }
  });

  app.post("/api/locations", authorize(["manager"]), async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating location" });
    }
  });

  // User progress routes
  app.get("/api/user-progress", authenticate, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.session.userId;
      
      // Teachers and managers can view progress for any user
      if (userId !== req.session.userId && !["teacher", "manager"].includes(req.session.userRole!)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const progress = await storage.getUserProgress(userId!);
      res.status(200).json(progress);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user progress" });
    }
  });

  app.post("/api/user-progress", authenticate, async (req, res) => {
    try {
      // Users can only track progress for themselves
      if (req.body.userId !== req.session.userId) {
        return res.status(403).json({ message: "Cannot track progress for another user" });
      }
      
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating user progress" });
    }
  });

  app.patch("/api/user-progress/:id", authenticate, async (req, res) => {
    try {
      const progressId = parseInt(req.params.id);
      if (isNaN(progressId)) {
        return res.status(400).json({ message: "Invalid progress ID" });
      }
      
      // Update progress
      const updatedProgress = await storage.updateUserProgress(progressId, req.body);
      if (!updatedProgress) {
        return res.status(404).json({ message: "Progress record not found" });
      }
      
      // Update user XP if mission was completed
      if (req.body.completed && !req.body.completedBefore) {
        const mission = await storage.getMission(updatedProgress.missionId);
        if (mission) {
          const user = await storage.getUser(updatedProgress.userId);
          if (user) {
            const newXP = user.xp + mission.xpReward;
            
            // Simple level calculation (adjust as needed)
            let newLevel = user.level;
            const xpPerLevel = 1000; // Base XP needed per level
            const nextLevelXP = user.level * xpPerLevel;
            
            if (newXP >= nextLevelXP) {
              newLevel = Math.floor(newXP / xpPerLevel) + 1;
            }
            
            await storage.updateUser(user.id, { xp: newXP, level: newLevel });
          }
        }
      }
      
      res.status(200).json(updatedProgress);
    } catch (error) {
      res.status(500).json({ message: "Server error updating user progress" });
    }
  });

  // Achievements routes
  app.get("/api/achievements", authenticate, async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching achievements" });
    }
  });

  app.get("/api/user-achievements", authenticate, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.session.userId;
      
      const userAchievements = await storage.getUserAchievements(userId!);
      
      // Get the full achievement details
      const achievementIds = userAchievements.map(ua => ua.achievementId);
      const achievements = await Promise.all(
        achievementIds.map(id => storage.getAchievement(id))
      );
      
      // Combine with earned dates
      const result = userAchievements.map(ua => {
        const achievement = achievements.find(a => a && a.id === ua.achievementId);
        return {
          ...achievement,
          earnedAt: ua.earnedAt
        };
      });
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user achievements" });
    }
  });

  app.post("/api/user-achievements", authorize(["teacher", "manager"]), async (req, res) => {
    try {
      const achievementData = insertUserAchievementSchema.parse(req.body);
      const userAchievement = await storage.grantUserAchievement(achievementData);
      res.status(201).json(userAchievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error granting achievement" });
    }
  });

  // Forum routes
  app.get("/api/forum-posts", authenticate, async (req, res) => {
    try {
      const pathId = req.query.pathId ? parseInt(req.query.pathId as string) : undefined;
      
      let posts;
      if (pathId && !isNaN(pathId)) {
        posts = await storage.getForumPostsByPath(pathId);
      } else {
        posts = await storage.getForumPosts();
      }
      
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching forum posts" });
    }
  });

  app.post("/api/forum-posts", authenticate, async (req, res) => {
    try {
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating forum post" });
    }
  });

  app.get("/api/forum-posts/:id/replies", authenticate, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const replies = await storage.getForumReplies(postId);
      res.status(200).json(replies);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching forum replies" });
    }
  });

  app.post("/api/forum-replies", authenticate, async (req, res) => {
    try {
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating forum reply" });
    }
  });

  // Diagnostic questions routes
  app.get("/api/diagnostic-questions", authenticate, async (req, res) => {
    try {
      const area = req.query.area as string | undefined;
      
      let questions;
      if (area) {
        questions = await storage.getDiagnosticQuestionsByArea(area);
      } else {
        questions = await storage.getDiagnosticQuestions();
      }
      
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching diagnostic questions" });
    }
  });

  app.post("/api/diagnostic-questions", authorize(["teacher", "manager"]), async (req, res) => {
    try {
      const questionData = insertDiagnosticQuestionSchema.parse(req.body);
      const question = await storage.createDiagnosticQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating diagnostic question" });
    }
  });

  app.get("/api/user-diagnostics", authenticate, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.session.userId;
      
      // Teachers and managers can view diagnostics for any user
      if (userId !== req.session.userId && !["teacher", "manager"].includes(req.session.userRole!)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const diagnostics = await storage.getUserDiagnostics(userId!);
      res.status(200).json(diagnostics);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user diagnostics" });
    }
  });

  app.post("/api/user-diagnostics", authenticate, async (req, res) => {
    try {
      // Users can only submit diagnostics for themselves
      if (req.body.userId !== req.session.userId) {
        return res.status(403).json({ message: "Cannot submit diagnostics for another user" });
      }
      
      const diagnosticData = insertUserDiagnosticSchema.parse(req.body);
      const diagnostic = await storage.createUserDiagnostic(diagnosticData);
      res.status(201).json(diagnostic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error creating user diagnostic" });
    }
  });

  // OpenAI integration for feedback
  app.post("/api/generate-feedback", authenticate, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ message: "AI feedback unavailable - missing API key" });
      }
      
      const { progress, missionContent, userAnswers } = req.body;
      
      if (!progress || !missionContent || !userAnswers) {
        return res.status(400).json({ message: "Missing required data" });
      }
      
      const prompt = `
        You are an educational RPG game assistant providing feedback to a student.
        
        Mission: ${missionContent.title}
        Description: ${missionContent.description}
        Subject Area: ${missionContent.area}
        
        Student's performance:
        - Score: ${progress.score || 0}
        - Attempts: ${progress.attempts || 1}
        
        Student's answers: ${JSON.stringify(userAnswers)}
        
        Based on this information, provide constructive feedback in a medieval RPG narrative style.
        Include:
        1. What the student did well
        2. Areas that need improvement
        3. Specific suggestions to improve
        4. An encouraging statement to continue their learning journey
        
        The feedback should be in the style of a medieval mentor or sage speaking to an apprentice.
        Keep the feedback under 200 words.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });
      
      const feedback = response.choices[0].message.content;
      
      // Update the user progress with the feedback
      if (progress.id) {
        await storage.updateUserProgress(progress.id, { feedback });
      }
      
      res.status(200).json({ feedback });
    } catch (error) {
      console.error("OpenAI error:", error);
      res.status(500).json({ message: "Error generating AI feedback", error: error.message });
    }
  });

  // AI-powered feedback and recommendation routes
  app.post("/api/generate-feedback", authenticate, async (req, res) => {
    try {
      if (!openaiApiKey) {
        return res.status(503).json({ 
          message: "OpenAI API is not configured. Please add OPENAI_API_KEY to environment variables."
        });
      }

      const { missionContent, progress, userAnswers } = req.body;
      
      if (!missionContent || !progress || !userAnswers) {
        return res.status(400).json({ message: "Missing required data" });
      }

      const feedback = await generateFeedback({
        missionTitle: missionContent.title,
        area: missionContent.area,
        score: progress.score || 0,
        attempts: progress.attempts || 1,
        userAnswers
      });

      res.status(200).json({ feedback });
    } catch (error) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ 
        message: "Failed to generate feedback",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/generate-diagnostic-recommendation", authenticate, async (req, res) => {
    try {
      if (!openaiApiKey) {
        return res.status(503).json({ 
          message: "OpenAI API is not configured. Please add OPENAI_API_KEY to environment variables."
        });
      }

      const { area, score, answers, studentName } = req.body;
      
      if (!area || score === undefined || !answers) {
        return res.status(400).json({ message: "Missing required data" });
      }

      const recommendation = await generateDiagnosticRecommendation({
        area,
        score,
        answers,
        studentName
      });

      res.status(200).json({ recommendation });
    } catch (error) {
      console.error("Error generating diagnostic recommendation:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendation",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/generate-recommendations", authenticate, async (req, res) => {
    try {
      if (!openaiApiKey) {
        return res.status(503).json({ 
          message: "OpenAI API is not configured. Please add OPENAI_API_KEY to environment variables."
        });
      }

      const { username, completedMissions, strengths, areas_for_improvement } = req.body;
      
      if (!username || !completedMissions || !strengths || !areas_for_improvement) {
        return res.status(400).json({ message: "Missing required data" });
      }

      const recommendations = await generatePersonalizedRecommendations({
        username,
        completedMissions,
        strengths,
        areas_for_improvement
      });

      res.status(200).json({ recommendations });
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
