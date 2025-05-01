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
        message: `Erro ao conectar com Supabase: ${error.message}` 
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
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
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

  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
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
