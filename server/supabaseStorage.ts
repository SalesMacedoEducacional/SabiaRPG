import { supabase } from "../db/supabase.js";
import { IStorage } from "./storage";

import {
  User, InsertUser,
  LearningPath, InsertLearningPath,
  Mission, InsertMission,
  Location, InsertLocation,
  UserProgress, InsertUserProgress,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  ForumPost, InsertForumPost,
  ForumReply, InsertForumReply,
  DiagnosticQuestion, InsertDiagnosticQuestion,
  UserDiagnostic, InsertUserDiagnostic
} from "@shared/schema";

/**
 * Implementação do IStorage usando Supabase.
 * Esta é uma implementação inicial que fará a ponte entre nossa interface de armazenamento
 * e o novo esquema do banco de dados Supabase.
 */
export class SupabaseStorage implements IStorage {
  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    // Convertemos o id numérico para o formato de UUID esperado
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    // Converter do formato do banco para o formato esperado pela aplicação
    return this.mapDbUsuarioToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbUsuarioToUser(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // No novo esquema não temos username diretamente, vamos considerar que email é único
    // e pode ser usado como identificador
    return this.getUserByEmail(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    // Adaptar o formato de inserção para o novo esquema
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        email: user.email,
        senha_hash: user.password, // Nota: Idealmente deve ser hash
        papel: this.mapRoleToPapel(user.role)
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);
    
    // Criar um perfil de aluno se o papel for 'aluno'
    if (data.papel === 'aluno') {
      await supabase
        .from('perfis_aluno')
        .insert({
          usuario_id: data.id,
          nivel: user.level || 1,
          xp: user.xp || 0,
          avatar_image: user.avatarUrl
        });
    }
    
    return this.mapDbUsuarioToUser(data);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    // Mapear campos para o formato do novo esquema
    const updates: any = {};
    if (userData.email) updates.email = userData.email;
    if (userData.password) updates.senha_hash = userData.password;
    if (userData.role) updates.papel = this.mapRoleToPapel(userData.role);
    
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    
    // Atualizar perfil de aluno se aplicável
    if ((userData.level || userData.xp || userData.avatarUrl) && existingUser.role === 'student') {
      const perfilUpdates: any = {};
      if (userData.level) perfilUpdates.nivel = userData.level;
      if (userData.xp) perfilUpdates.xp = userData.xp;
      if (userData.avatarUrl) perfilUpdates.avatar_image = userData.avatarUrl;
      
      await supabase
        .from('perfis_aluno')
        .update(perfilUpdates)
        .eq('usuario_id', id);
    }
    
    return this.mapDbUsuarioToUser(data);
  }

  // Métodos de trilhas de aprendizagem
  async getLearningPaths(): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('trilhas')
      .select('*');
    
    if (error) throw new Error(`Erro ao buscar trilhas: ${error.message}`);
    
    return data.map(this.mapDbTrilhaToLearningPath);
  }

  async getLearningPathsByArea(area: string): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('trilhas')
      .select('*')
      .eq('disciplina', this.mapAreaToDisciplina(area));
    
    if (error) throw new Error(`Erro ao buscar trilhas por área: ${error.message}`);
    
    return data.map(this.mapDbTrilhaToLearningPath);
  }

  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    const { data, error } = await supabase
      .from('trilhas')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbTrilhaToLearningPath(data);
  }

  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const { data, error } = await supabase
      .from('trilhas')
      .insert({
        titulo: path.title,
        disciplina: this.mapAreaToDisciplina(path.area),
        nivel: path.difficulty || 1
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar trilha: ${error.message}`);
    
    return this.mapDbTrilhaToLearningPath(data);
  }

  // Métodos de missões
  async getMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missoes')
      .select('*');
    
    if (error) throw new Error(`Erro ao buscar missões: ${error.message}`);
    
    return data.map(this.mapDbMissaoToMission);
  }

  async getMissionsByPath(pathId: number): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missoes')
      .select('*')
      .eq('trilha_id', pathId)
      .order('ordem', { ascending: true });
    
    if (error) throw new Error(`Erro ao buscar missões por trilha: ${error.message}`);
    
    return data.map(this.mapDbMissaoToMission);
  }

  async getMission(id: number): Promise<Mission | undefined> {
    const { data, error } = await supabase
      .from('missoes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbMissaoToMission(data);
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const { data, error } = await supabase
      .from('missoes')
      .insert({
        trilha_id: mission.pathId,
        titulo: mission.title,
        descricao: mission.description,
        ordem: mission.sequence,
        xp_recompensa: mission.xpReward || 10
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar missão: ${error.message}`);
    
    return this.mapDbMissaoToMission(data);
  }

  // Métodos auxiliares para mapear entre formatos de dados
  private mapRoleToPapel(role: string): string {
    switch (role) {
      case 'student': return 'aluno';
      case 'teacher': return 'professor';
      case 'manager': return 'gestor';
      default: return 'aluno';
    }
  }

  private mapPapelToRole(papel: string): string {
    switch (papel) {
      case 'aluno': return 'student';
      case 'professor': return 'teacher';
      case 'gestor': return 'manager';
      default: return 'student';
    }
  }

  private mapAreaToDisciplina(area: string): string {
    switch (area) {
      case 'mathematics': return 'matematica';
      case 'languages': return 'linguagens';
      case 'sciences': return 'ciencias';
      case 'history': return 'historia';
      case 'geography': return 'geografia';
      case 'arts': return 'artes';
      default: return 'matematica';
    }
  }

  private mapDisciplinaToArea(disciplina: string): string {
    switch (disciplina) {
      case 'matematica': return 'mathematics';
      case 'linguagens': return 'languages';
      case 'ciencias': return 'sciences';
      case 'historia': return 'history';
      case 'geografia': return 'geography';
      case 'artes': return 'arts';
      default: return 'mathematics';
    }
  }

  private mapDbUsuarioToUser(dbUsuario: any): User {
    return {
      id: dbUsuario.id,
      email: dbUsuario.email,
      password: dbUsuario.senha_hash,
      username: dbUsuario.email, // Adaptação: email como username
      fullName: dbUsuario.nome || 'Usuário',
      role: this.mapPapelToRole(dbUsuario.papel),
      level: 1, // Valores padrão, precisaria buscar do perfil_aluno
      xp: 0,
      createdAt: new Date(dbUsuario.criado_em)
    };
  }

  private mapDbTrilhaToLearningPath(dbTrilha: any): LearningPath {
    return {
      id: dbTrilha.id,
      title: dbTrilha.titulo,
      description: 'Descrição da trilha', // Campo adaptado
      area: this.mapDisciplinaToArea(dbTrilha.disciplina),
      difficulty: dbTrilha.nivel,
      requiredLevel: dbTrilha.nivel - 1 || 1, // Adaptação
      locationId: 1, // Valor padrão ou adaptação
      createdAt: new Date()
    };
  }

  private mapDbMissaoToMission(dbMissao: any): Mission {
    return {
      id: dbMissao.id,
      title: dbMissao.titulo,
      description: dbMissao.descricao,
      area: 'mathematics', // Valor padrão, precisaria ser obtido da trilha
      difficulty: 1, // Valor padrão
      xpReward: dbMissao.xp_recompensa,
      pathId: dbMissao.trilha_id,
      content: {}, // Conteúdo vazio por padrão
      estimatedTime: 30, // Valor padrão em minutos
      sequence: dbMissao.ordem,
      createdAt: new Date()
    };
  }

  // Implementações restantes da interface IStorage - métodos não implementados ainda
  async getLocations(): Promise<Location[]> {
    throw new Error("Método não implementado: getLocations");
  }

  async getLocation(id: number): Promise<Location | undefined> {
    throw new Error("Método não implementado: getLocation");
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    throw new Error("Método não implementado: createLocation");
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    throw new Error("Método não implementado: getUserProgress");
  }

  async getUserProgressByMission(userId: number, missionId: number): Promise<UserProgress | undefined> {
    throw new Error("Método não implementado: getUserProgressByMission");
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    throw new Error("Método não implementado: createUserProgress");
  }

  async updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined> {
    throw new Error("Método não implementado: updateUserProgress");
  }

  async getAchievements(): Promise<Achievement[]> {
    throw new Error("Método não implementado: getAchievements");
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    throw new Error("Método não implementado: getAchievement");
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    throw new Error("Método não implementado: createAchievement");
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    throw new Error("Método não implementado: getUserAchievements");
  }

  async grantUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    throw new Error("Método não implementado: grantUserAchievement");
  }

  async getForumPosts(): Promise<ForumPost[]> {
    throw new Error("Método não implementado: getForumPosts");
  }

  async getForumPostsByPath(pathId: number): Promise<ForumPost[]> {
    throw new Error("Método não implementado: getForumPostsByPath");
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    throw new Error("Método não implementado: getForumPost");
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    throw new Error("Método não implementado: createForumPost");
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    throw new Error("Método não implementado: getForumReplies");
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    throw new Error("Método não implementado: createForumReply");
  }

  async getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
    throw new Error("Método não implementado: getDiagnosticQuestions");
  }

  async getDiagnosticQuestionsByArea(area: string): Promise<DiagnosticQuestion[]> {
    throw new Error("Método não implementado: getDiagnosticQuestionsByArea");
  }

  async getDiagnosticQuestion(id: number): Promise<DiagnosticQuestion | undefined> {
    throw new Error("Método não implementado: getDiagnosticQuestion");
  }

  async createDiagnosticQuestion(question: InsertDiagnosticQuestion): Promise<DiagnosticQuestion> {
    throw new Error("Método não implementado: createDiagnosticQuestion");
  }

  async getUserDiagnostics(userId: number): Promise<UserDiagnostic[]> {
    throw new Error("Método não implementado: getUserDiagnostics");
  }

  async getUserDiagnosticByArea(userId: number, area: string): Promise<UserDiagnostic | undefined> {
    throw new Error("Método não implementado: getUserDiagnosticByArea");
  }

  async createUserDiagnostic(diagnostic: InsertUserDiagnostic): Promise<UserDiagnostic> {
    throw new Error("Método não implementado: createUserDiagnostic");
  }
}

// Exportamos uma instância para uso imediato
// Nota: Comentado por enquanto até que o banco esteja configurado
// export const storage = new SupabaseStorage();