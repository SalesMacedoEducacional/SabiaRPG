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
  private mapRoleToPapel(role: string): 'aluno' | 'professor' | 'gestor' {
    switch (role) {
      case 'student': return 'aluno';
      case 'teacher': return 'professor';
      case 'manager': return 'gestor';
      default: return 'aluno';
    }
  }

  private mapPapelToRole(papel: string): 'student' | 'teacher' | 'manager' {
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

  // Implementação dos métodos de localização
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locais')
      .select('*');
    
    if (error) throw new Error(`Erro ao buscar locais: ${error.message}`);
    
    return data.map(this.mapDbLocalToLocation);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const { data, error } = await supabase
      .from('locais')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbLocalToLocation(data);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const { data, error } = await supabase
      .from('locais')
      .insert({
        nome: location.name,
        descricao: location.description,
        coordenada_x: location.coordX,
        coordenada_y: location.coordY,
        imagem_url: location.imageUrl
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar local: ${error.message}`);
    
    return this.mapDbLocalToLocation(data);
  }

  // Implementação dos métodos de progresso do usuário
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('progresso_missoes')
      .select(`
        *,
        missoes (id, titulo)
      `)
      .eq('usuario_id', userId);
    
    if (error) throw new Error(`Erro ao buscar progresso do usuário: ${error.message}`);
    
    return data.map(this.mapDbProgressoToUserProgress);
  }

  async getUserProgressByMission(userId: number, missionId: number): Promise<UserProgress | undefined> {
    const { data, error } = await supabase
      .from('progresso_missoes')
      .select(`
        *,
        missoes (id, titulo)
      `)
      .eq('usuario_id', userId)
      .eq('missao_id', missionId)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbProgressoToUserProgress(data);
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('progresso_missoes')
      .insert({
        usuario_id: progress.userId,
        missao_id: progress.missionId,
        progresso: progress.progress,
        pontuacao: progress.score,
        status: progress.status,
        tempo_gasto: progress.timeSpent
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar progresso: ${error.message}`);
    
    return this.mapDbProgressoToUserProgress(data);
  }

  async updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined> {
    // Primeiro verifica se o registro existe
    const { data: existingData, error: existingError } = await supabase
      .from('progresso_missoes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (existingError || !existingData) return undefined;
    
    // Mapear campos para o formato do banco
    const updates: any = {};
    if (progress.progress !== undefined) updates.progresso = progress.progress;
    if (progress.score !== undefined) updates.pontuacao = progress.score;
    if (progress.status !== undefined) updates.status = progress.status;
    if (progress.timeSpent !== undefined) updates.tempo_gasto = progress.timeSpent;
    if (progress.completedAt !== undefined) updates.concluido_em = progress.completedAt;
    
    const { data, error } = await supabase
      .from('progresso_missoes')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        missoes (id, titulo)
      `)
      .single();
    
    if (error) throw new Error(`Erro ao atualizar progresso: ${error.message}`);
    
    return this.mapDbProgressoToUserProgress(data);
  }
  
  // Métodos auxiliares adicionais para mapeamento
  private mapDbLocalToLocation(dbLocal: any): Location {
    return {
      id: dbLocal.id,
      name: dbLocal.nome,
      description: dbLocal.descricao,
      coordX: dbLocal.coordenada_x,
      coordY: dbLocal.coordenada_y,
      imageUrl: dbLocal.imagem_url,
      createdAt: new Date(dbLocal.criado_em)
    };
  }
  
  private mapDbProgressoToUserProgress(dbProgresso: any): UserProgress {
    return {
      id: dbProgresso.id,
      userId: dbProgresso.usuario_id,
      missionId: dbProgresso.missao_id,
      progress: dbProgresso.progresso,
      score: dbProgresso.pontuacao,
      status: dbProgresso.status,
      timeSpent: dbProgresso.tempo_gasto,
      createdAt: new Date(dbProgresso.criado_em),
      completedAt: dbProgresso.concluido_em ? new Date(dbProgresso.concluido_em) : null,
      missionTitle: dbProgresso.missoes?.titulo
    };
  }

  // Implementação dos métodos de conquistas
  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('conquistas')
      .select('*');
    
    if (error) throw new Error(`Erro ao buscar conquistas: ${error.message}`);
    
    return data.map(this.mapDbConquistaToAchievement);
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const { data, error } = await supabase
      .from('conquistas')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbConquistaToAchievement(data);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const { data, error } = await supabase
      .from('conquistas')
      .insert({
        titulo: achievement.title,
        descricao: achievement.description,
        categoria: achievement.category,
        icone_url: achievement.iconUrl,
        requisito: achievement.requirement,
        pontos: achievement.points || 10
      })
      .select()
      .single();
    
    if (error) throw new Error(`Erro ao criar conquista: ${error.message}`);
    
    return this.mapDbConquistaToAchievement(data);
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('usuario_conquistas')
      .select(`
        *,
        conquistas (id, titulo, descricao, icone_url)
      `)
      .eq('usuario_id', userId);
    
    if (error) throw new Error(`Erro ao buscar conquistas do usuário: ${error.message}`);
    
    return data.map(this.mapDbUsuarioConquistaToUserAchievement);
  }

  async grantUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const { data, error } = await supabase
      .from('usuario_conquistas')
      .insert({
        usuario_id: userAchievement.userId,
        conquista_id: userAchievement.achievementId,
        data_conquista: new Date().toISOString()
      })
      .select(`
        *,
        conquistas (id, titulo, descricao, icone_url)
      `)
      .single();
    
    if (error) throw new Error(`Erro ao conceder conquista ao usuário: ${error.message}`);
    
    return this.mapDbUsuarioConquistaToUserAchievement(data);
  }

  // Implementação dos métodos de fórum
  async getForumPosts(): Promise<ForumPost[]> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        usuarios (id, email, nome),
        trilhas (id, titulo)
      `)
      .order('criado_em', { ascending: false });
    
    if (error) throw new Error(`Erro ao buscar posts do fórum: ${error.message}`);
    
    return data.map(this.mapDbForumPostToForumPost);
  }

  async getForumPostsByPath(pathId: number): Promise<ForumPost[]> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        usuarios (id, email, nome),
        trilhas (id, titulo)
      `)
      .eq('trilha_id', pathId)
      .order('criado_em', { ascending: false });
    
    if (error) throw new Error(`Erro ao buscar posts do fórum por trilha: ${error.message}`);
    
    return data.map(this.mapDbForumPostToForumPost);
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        usuarios (id, email, nome),
        trilhas (id, titulo)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return this.mapDbForumPostToForumPost(data);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        usuario_id: post.userId,
        trilha_id: post.pathId,
        titulo: post.title,
        conteudo: post.content,
        tipo: post.type || 'duvida'
      })
      .select(`
        *,
        usuarios (id, email, nome),
        trilhas (id, titulo)
      `)
      .single();
    
    if (error) throw new Error(`Erro ao criar post no fórum: ${error.message}`);
    
    return this.mapDbForumPostToForumPost(data);
  }

  async getForumReplies(postId: number): Promise<ForumReply[]> {
    const { data, error } = await supabase
      .from('forum_respostas')
      .select(`
        *,
        usuarios (id, email, nome)
      `)
      .eq('post_id', postId)
      .order('criado_em', { ascending: true });
    
    if (error) throw new Error(`Erro ao buscar respostas do fórum: ${error.message}`);
    
    return data.map(this.mapDbForumReplyToForumReply);
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const { data, error } = await supabase
      .from('forum_respostas')
      .insert({
        post_id: reply.postId,
        usuario_id: reply.userId,
        conteudo: reply.content,
        melhor_resposta: reply.bestAnswer || false
      })
      .select(`
        *,
        usuarios (id, email, nome)
      `)
      .single();
    
    if (error) throw new Error(`Erro ao criar resposta no fórum: ${error.message}`);
    
    return this.mapDbForumReplyToForumReply(data);
  }
  
  // Métodos auxiliares adicionais para mapeamento
  private mapDbConquistaToAchievement(dbConquista: any): Achievement {
    return {
      id: dbConquista.id,
      title: dbConquista.titulo,
      description: dbConquista.descricao,
      category: dbConquista.categoria,
      iconUrl: dbConquista.icone_url,
      requirement: dbConquista.requisito,
      points: dbConquista.pontos,
      createdAt: new Date(dbConquista.criado_em)
    };
  }
  
  private mapDbUsuarioConquistaToUserAchievement(dbUsuarioConquista: any): UserAchievement {
    return {
      id: dbUsuarioConquista.id,
      userId: dbUsuarioConquista.usuario_id,
      achievementId: dbUsuarioConquista.conquista_id,
      earnedAt: new Date(dbUsuarioConquista.data_conquista),
      achievementTitle: dbUsuarioConquista.conquistas?.titulo,
      achievementDescription: dbUsuarioConquista.conquistas?.descricao,
      achievementIconUrl: dbUsuarioConquista.conquistas?.icone_url
    };
  }
  
  private mapDbForumPostToForumPost(dbForumPost: any): ForumPost {
    return {
      id: dbForumPost.id,
      userId: dbForumPost.usuario_id,
      pathId: dbForumPost.trilha_id,
      title: dbForumPost.titulo,
      content: dbForumPost.conteudo,
      type: dbForumPost.tipo,
      createdAt: new Date(dbForumPost.criado_em),
      authorName: dbForumPost.usuarios?.nome || dbForumPost.usuarios?.email,
      pathTitle: dbForumPost.trilhas?.titulo,
      replyCount: dbForumPost.contagem_respostas || 0
    };
  }
  
  private mapDbForumReplyToForumReply(dbForumReply: any): ForumReply {
    return {
      id: dbForumReply.id,
      postId: dbForumReply.post_id,
      userId: dbForumReply.usuario_id,
      content: dbForumReply.conteudo,
      bestAnswer: dbForumReply.melhor_resposta,
      createdAt: new Date(dbForumReply.criado_em),
      authorName: dbForumReply.usuarios?.nome || dbForumReply.usuarios?.email
    };
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