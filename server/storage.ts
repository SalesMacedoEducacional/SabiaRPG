import {
  users, User, InsertUser,
  learningPaths, LearningPath, InsertLearningPath,
  missions, Mission, InsertMission,
  locations, Location, InsertLocation,
  userProgress, UserProgress, InsertUserProgress,
  achievements, Achievement, InsertAchievement,
  userAchievements, UserAchievement, InsertUserAchievement,
  forumPosts, ForumPost, InsertForumPost,
  forumReplies, ForumReply, InsertForumReply,
  diagnosticQuestions, DiagnosticQuestion, InsertDiagnosticQuestion,
  userDiagnostics, UserDiagnostic, InsertUserDiagnostic
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Learning paths
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPathsByArea(area: string): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;

  // Missions
  getMissions(): Promise<Mission[]>;
  getMissionsByPath(pathId: number): Promise<Mission[]>;
  getMission(id: number): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;

  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;

  // User progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByMission(userId: number, missionId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // User achievements
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  grantUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;

  // Forum
  getForumPosts(): Promise<ForumPost[]>;
  getForumPostsByPath(pathId: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  // Forum replies
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // Diagnostic questions
  getDiagnosticQuestions(): Promise<DiagnosticQuestion[]>;
  getDiagnosticQuestionsByArea(area: string): Promise<DiagnosticQuestion[]>;
  getDiagnosticQuestion(id: number): Promise<DiagnosticQuestion | undefined>;
  createDiagnosticQuestion(question: InsertDiagnosticQuestion): Promise<DiagnosticQuestion>;

  // User diagnostics
  getUserDiagnostics(userId: number): Promise<UserDiagnostic[]>;
  getUserDiagnosticByArea(userId: number, area: string): Promise<UserDiagnostic | undefined>;
  createUserDiagnostic(diagnostic: InsertUserDiagnostic): Promise<UserDiagnostic>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningPaths: Map<number, LearningPath>;
  private missions: Map<number, Mission>;
  private locations: Map<number, Location>;
  private userProgress: Map<number, UserProgress>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private diagnosticQuestions: Map<number, DiagnosticQuestion>;
  private userDiagnostics: Map<number, UserDiagnostic>;
  
  private currentId: { [key: string]: number } = {};

  constructor() {
    this.users = new Map();
    this.learningPaths = new Map();
    this.missions = new Map();
    this.locations = new Map();
    this.userProgress = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.diagnosticQuestions = new Map();
    this.userDiagnostics = new Map();

    this.currentId = {
      users: 1,
      learningPaths: 1,
      missions: 1,
      locations: 1,
      userProgress: 1,
      achievements: 1,
      userAchievements: 1,
      forumPosts: 1,
      forumReplies: 1,
      diagnosticQuestions: 1,
      userDiagnostics: 1
    };

    // Initialize with some data
    this.initializeData();
  }

  private initializeData() {
    // Add map locations for Piauí
    const teresinaLocation: InsertLocation = {
      name: "Teresina",
      description: "Capital - Centro de Conhecimento",
      coordinates: { x: 40, y: 25 },
      icon: "castle",
      unlockLevel: 1
    };
    this.createLocation(teresinaLocation);

    const parnaibaLocation: InsertLocation = {
      name: "Parnaíba",
      description: "Porto das Ciências",
      coordinates: { x: 25, y: 15 },
      icon: "water",
      unlockLevel: 3
    };
    this.createLocation(parnaibaLocation);

    const oeirasLocation: InsertLocation = {
      name: "Oeiras",
      description: "Antiga Capital - História",
      coordinates: { x: 55, y: 60 },
      icon: "landmark",
      unlockLevel: 5
    };
    this.createLocation(oeirasLocation);

    const picosLocation: InsertLocation = {
      name: "Picos",
      description: "Terra das Montanhas",
      coordinates: { x: 70, y: 70 },
      icon: "mountain",
      unlockLevel: 7
    };
    this.createLocation(picosLocation);

    // Add some achievements
    const achievements: InsertAchievement[] = [
      {
        title: "Sábio Matemático",
        description: "Complete 5 missões de matemática com nota máxima",
        area: "mathematics",
        iconName: "square-root-alt",
        criteria: { area: "mathematics", completedMissions: 5, minScore: 100 }
      },
      {
        title: "Poeta Laureado",
        description: "Escreva 3 redações com avaliação excelente",
        area: "languages",
        iconName: "book",
        criteria: { area: "languages", completedMissions: 3, minScore: 90 }
      },
      {
        title: "Explorador Intrépido",
        description: "Visite todas as cidades do mapa",
        area: null,
        iconName: "compass",
        criteria: { visitedLocations: [1, 2, 3, 4] }
      },
      {
        title: "Historiador",
        description: "Complete a trilha de história de Oeiras",
        area: "history",
        iconName: "landmark",
        criteria: { pathId: 3, completed: true }
      },
      {
        title: "Cientista",
        description: "Realize 10 experimentos científicos virtuais",
        area: "sciences",
        iconName: "flask",
        criteria: { area: "sciences", activities: "experiments", count: 10 }
      },
      {
        title: "Mestre do Conhecimento",
        description: "Alcance o nível 10 em todas as áreas de conhecimento",
        area: null,
        iconName: "crown",
        criteria: { minLevel: 10, allAreas: true }
      }
    ];
    
    achievements.forEach(achievement => this.createAchievement(achievement));

    // Add some diagnostic questions
    const questions: InsertDiagnosticQuestion[] = [
      {
        question: "Se uma cidade tem 360 habitantes e sua população aumenta 5% ao ano, qual será a população após 2 anos?",
        area: "mathematics",
        options: [
          "396 habitantes",
          "378 habitantes",
          "390 habitantes",
          "397,8 habitantes"
        ],
        correctAnswer: 3,
        difficulty: 2
      },
      {
        question: "Qual é a capital do Piauí?",
        area: "geography",
        options: [
          "Fortaleza",
          "Teresina",
          "São Luís",
          "Parnaíba"
        ],
        correctAnswer: 1,
        difficulty: 1
      },
      {
        question: "Qual a função sintática do termo sublinhado: 'Ele comprou um livro INTERESSANTE'?",
        area: "languages",
        options: [
          "Sujeito",
          "Objeto direto",
          "Adjunto adnominal",
          "Predicativo do sujeito"
        ],
        correctAnswer: 2,
        difficulty: 2
      }
    ];

    questions.forEach(question => this.createDiagnosticQuestion(question));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Learning paths methods
  async getLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }

  async getLearningPathsByArea(area: string): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values()).filter(path => path.area === area);
  }

  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }

  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = this.currentId.learningPaths++;
    const timestamp = new Date();
    const path: LearningPath = { ...insertPath, id, createdAt: timestamp };
    this.learningPaths.set(id, path);
    return path;
  }

  // Missions methods
  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMissionsByPath(pathId: number): Promise<Mission[]> {
    return Array.from(this.missions.values())
      .filter(mission => mission.pathId === pathId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async getMission(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const id = this.currentId.missions++;
    const timestamp = new Date();
    const mission: Mission = { ...insertMission, id, createdAt: timestamp };
    this.missions.set(id, mission);
    return mission;
  }

  // Locations methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId.locations++;
    const timestamp = new Date();
    const location: Location = { ...insertLocation, id, createdAt: timestamp };
    this.locations.set(id, location);
    return location;
  }

  // User progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserProgressByMission(userId: number, missionId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      progress => progress.userId === userId && progress.missionId === missionId
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentId.userProgress++;
    const timestamp = new Date();
    const progress: UserProgress = { ...insertProgress, id, createdAt: timestamp, completedAt: null };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = this.userProgress.get(id);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...progressData };
    if (progressData.completed && !progress.completed) {
      updatedProgress.completedAt = new Date();
    }
    
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Achievements methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId.achievements++;
    const timestamp = new Date();
    const achievement: Achievement = { ...insertAchievement, id, createdAt: timestamp };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // User achievements methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async grantUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentId.userAchievements++;
    const userAchievement: UserAchievement = { ...insertUserAchievement, id };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  // Forum posts methods
  async getForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values());
  }

  async getForumPostsByPath(pathId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(post => post.pathId === pathId);
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }

  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = this.currentId.forumPosts++;
    const timestamp = new Date();
    const post: ForumPost = { ...insertPost, id, createdAt: timestamp };
    this.forumPosts.set(id, post);
    return post;
  }

  // Forum replies methods
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values()).filter(reply => reply.postId === postId);
  }

  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const id = this.currentId.forumReplies++;
    const timestamp = new Date();
    const reply: ForumReply = { ...insertReply, id, createdAt: timestamp };
    this.forumReplies.set(id, reply);
    return reply;
  }

  // Diagnostic questions methods
  async getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
    return Array.from(this.diagnosticQuestions.values());
  }

  async getDiagnosticQuestionsByArea(area: string): Promise<DiagnosticQuestion[]> {
    return Array.from(this.diagnosticQuestions.values()).filter(question => question.area === area);
  }

  async getDiagnosticQuestion(id: number): Promise<DiagnosticQuestion | undefined> {
    return this.diagnosticQuestions.get(id);
  }

  async createDiagnosticQuestion(insertQuestion: InsertDiagnosticQuestion): Promise<DiagnosticQuestion> {
    const id = this.currentId.diagnosticQuestions++;
    const timestamp = new Date();
    const question: DiagnosticQuestion = { ...insertQuestion, id, createdAt: timestamp };
    this.diagnosticQuestions.set(id, question);
    return question;
  }

  // User diagnostics methods
  async getUserDiagnostics(userId: number): Promise<UserDiagnostic[]> {
    return Array.from(this.userDiagnostics.values()).filter(diagnostic => diagnostic.userId === userId);
  }

  async getUserDiagnosticByArea(userId: number, area: string): Promise<UserDiagnostic | undefined> {
    return Array.from(this.userDiagnostics.values()).find(
      diagnostic => diagnostic.userId === userId && diagnostic.area === area
    );
  }

  async createUserDiagnostic(insertDiagnostic: InsertUserDiagnostic): Promise<UserDiagnostic> {
    const id = this.currentId.userDiagnostics++;
    const timestamp = new Date();
    const diagnostic: UserDiagnostic = { ...insertDiagnostic, id, completedAt: timestamp };
    this.userDiagnostics.set(id, diagnostic);
    return diagnostic;
  }
}

export const storage = new MemStorage();
