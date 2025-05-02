import { pgTable, text, uuid, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum("papel_usuario", ["aluno", "professor", "gestor"]);

// Interface de permissões para cada perfil
export const permissionSets = {
  aluno: [
    "view:missions", "submit:mission-answers", "view:own-progress", 
    "view:forum", "post:forum", "view:own-diagnostics"
  ],
  professor: [
    "view:missions", "view:forum", "post:forum", "view:class-progress", 
    "view:class-diagnostics", "create:missions", "edit:missions", 
    "grade:mission-answers", "view:class-reports"
  ],
  gestor: [
    // Permissões de visualização
    "view:missions", "view:forum", "view:school-progress", "view:school-diagnostics",
    "view:school-reports", "view:region-reports", "view:access-logs", "view:error-logs", 
    "view:usage-statistics",
    // Permissões de gerenciamento escolar
    "manage:school-settings", "manage:school-calendar", "manage:school-integrations",
    "manage:users", "manage:teachers", "manage:students", "manage:enrollments",
    "export:school-data", "send:school-notifications", "create:announcements"
  ]
};

// Subject areas enum
export const subjectAreaEnum = pgEnum("disciplina", [
  "matematica", 
  "linguagens", 
  "ciencias", 
  "historia",
  "geografia",
  "artes"
]);

// Status enum
export const statusEnum = pgEnum("status", ["pendente", "concluida", "falhada"]);

// Escolas table - Expandida para atender necessidades dos gestores
export const escolas = pgTable("escolas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  codigoEscola: text("codigo_escola").notNull().unique(),
  endereco: text("endereco"),
  telefone: text("telefone"),
  configTrilhas: json("config_trilhas").default({}), // Configurações de trilhas específicas da escola
  calendarioTriagens: json("calendario_triagens").default({}), // Calendário de triagens diagnósticas
  criadoEm: timestamp("criado_em").defaultNow(),
  ativo: boolean("ativo").default(true),
});

// Usuarios table
export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: userRoleEnum("papel").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Matriculas table
export const matriculas = pgTable("matriculas", {
  id: uuid("id").primaryKey().defaultRandom(),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "cascade" }),
  numeroMatricula: text("numero_matricula").notNull().unique(),
  nomeAluno: text("nome_aluno").notNull(),
  turma: text("turma"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Perfis de aluno table
export const perfisAluno = pgTable("perfis_aluno", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  matriculaId: uuid("matricula_id").references(() => matriculas.id, { onDelete: "restrict" }),
  avatarImage: text("avatar_image"),
  nivel: integer("nivel").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Trilhas de aprendizagem table
export const trilhas = pgTable("trilhas", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  disciplina: text("disciplina").notNull(),
  nivel: integer("nivel").notNull(),
});

// Missões table
export const missoes = pgTable("missoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  trilhaId: uuid("trilha_id").references(() => trilhas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao").notNull(),
  ordem: integer("ordem").notNull(),
  xpRecompensa: integer("xp_recompensa").default(10),
});

// Progresso do aluno table
export const progressoAluno = pgTable("progresso_aluno", {
  id: uuid("id").primaryKey().defaultRandom(),
  perfilId: uuid("perfil_id").references(() => perfisAluno.id, { onDelete: "cascade" }),
  missaoId: uuid("missao_id").references(() => missoes.id, { onDelete: "cascade" }),
  status: statusEnum("status").notNull(),
  resposta: text("resposta"),
  feedbackIa: text("feedback_ia"),
  xpGanho: integer("xp_ganho"),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Conquistas table
export const conquistas = pgTable("conquistas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  icone: text("icone"),
  criterio: text("criterio"),
});

// Conquistas do aluno table
export const alunoConquistas = pgTable("aluno_conquistas", {
  id: uuid("id").primaryKey().defaultRandom(),
  perfilId: uuid("perfil_id").references(() => perfisAluno.id, { onDelete: "cascade" }),
  conquistaId: uuid("conquista_id").references(() => conquistas.id, { onDelete: "cascade" }),
  concedidoEm: timestamp("concedido_em").defaultNow(),
});

// Notificações table
export const notificacoes = pgTable("notificacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  destinatarioId: uuid("destinatario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  conteudo: text("conteudo").notNull(),
  enviadoEm: timestamp("enviado_em").defaultNow(),
  lidoEm: timestamp("lido_em"),
});

// Fóruns table
export const foruns = pgTable("foruns", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Posts no fórum table
export const postsForum = pgTable("posts_forum", {
  id: uuid("id").primaryKey().defaultRandom(),
  forumId: uuid("forum_id").references(() => foruns.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  conteudo: text("conteudo").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Configurações table
export const configuracoes = pgTable("configuracoes", {
  chave: text("chave").primaryKey(),
  valor: text("valor"),
});

// Perfis de Gestores table
export const perfilGestor = pgTable("perfis_gestor", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "restrict" }),
  cargo: text("cargo"),
  permissoesEspeciais: json("permissoes_especiais").default({}),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Perfis de Professores table 
export const perfilProfessor = pgTable("perfis_professor", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "restrict" }),
  disciplinas: text("disciplinas").array(),
  turmas: text("turmas").array(),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Configurações Escolares table para gerenciamento pelo Gestor
export const configuracoesEscolares = pgTable("configuracoes_escolares", {
  id: uuid("id").primaryKey().defaultRandom(),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "cascade" }),
  chave: text("chave").notNull(),
  valor: json("valor"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Integrações Externas table
export const integracoesExternas = pgTable("integracoes_externas", {
  id: uuid("id").primaryKey().defaultRandom(),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(), // SIGE, Google Classroom, etc.
  configJSON: json("config_json"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tokens API para integrações
export const tokensAPI = pgTable("tokens_api", {
  id: uuid("id").primaryKey().defaultRandom(),
  integracaoId: uuid("integracao_id").references(() => integracoesExternas.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiraEm: timestamp("expira_em"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Relatórios para acessos de gestores
export const relatorios = pgTable("relatorios", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: text("tipo").notNull(), // turma, escola, região
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "cascade" }),
  turmaId: text("turma_id"), // opcional, dependendo do tipo de relatório
  periodo: json("periodo"), // período de tempo do relatório
  dadosJSON: json("dados_json"),
  geradoEm: timestamp("gerado_em").defaultNow(),
});

// Comunicados table
export const comunicados = pgTable("comunicados", {
  id: uuid("id").primaryKey().defaultRandom(),
  escolaId: uuid("escola_id").references(() => escolas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo").notNull(),
  destinatarios: text("destinatarios").array(), // tipos de destinatários: todos, professores, alunos, etc.
  enviadoEm: timestamp("enviado_em").defaultNow(),
  expiraEm: timestamp("expira_em"),
});

// Logs de acesso para monitoramento
export const logsAcesso = pgTable("logs_acesso", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id),
  rota: text("rota").notNull(),
  metodo: text("metodo").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  sucesso: boolean("sucesso").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Logs de erros para monitoramento
export const logsErro = pgTable("logs_erro", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id),
  mensagem: text("mensagem").notNull(),
  stackTrace: text("stack_trace"),
  rota: text("rota"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Logs de auditoria table
export const logsAuditoria = pgTable("logs_auditoria", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id),
  acao: text("acao").notNull(),
  detalhes: text("detalhes"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Insert schemas para o novo esquema Supabase
export const insertEscolaSchema = createInsertSchema(escolas).omit({ id: true, criadoEm: true });
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({ id: true, criadoEm: true });
export const insertMatriculaSchema = createInsertSchema(matriculas).omit({ id: true, criadoEm: true });
export const insertPerfilAlunoSchema = createInsertSchema(perfisAluno).omit({ id: true, criadoEm: true });
export const insertPerfilGestorSchema = createInsertSchema(perfilGestor).omit({ id: true, criadoEm: true });
export const insertPerfilProfessorSchema = createInsertSchema(perfilProfessor).omit({ id: true, criadoEm: true });
export const insertTrilhaSchema = createInsertSchema(trilhas).omit({ id: true });
export const insertMissaoSchema = createInsertSchema(missoes).omit({ id: true });
export const insertProgressoAlunoSchema = createInsertSchema(progressoAluno).omit({ id: true, atualizadoEm: true });
export const insertConquistaSchema = createInsertSchema(conquistas).omit({ id: true });
export const insertAlunoConquistaSchema = createInsertSchema(alunoConquistas).omit({ id: true, concedidoEm: true });
export const insertNotificacaoSchema = createInsertSchema(notificacoes).omit({ id: true, enviadoEm: true, lidoEm: true });
export const insertForumSchema = createInsertSchema(foruns).omit({ id: true, criadoEm: true });
export const insertPostForumSchema = createInsertSchema(postsForum).omit({ id: true, criadoEm: true });
export const insertConfiguracaoSchema = createInsertSchema(configuracoes);
export const insertConfiguracoesEscolaresSchema = createInsertSchema(configuracoesEscolares).omit({ id: true, criadoEm: true, atualizadoEm: true });
export const insertIntegracoesExternasSchema = createInsertSchema(integracoesExternas).omit({ id: true, criadoEm: true, atualizadoEm: true });
export const insertTokensAPISchema = createInsertSchema(tokensAPI).omit({ id: true, criadoEm: true });
export const insertRelatoriosSchema = createInsertSchema(relatorios).omit({ id: true, geradoEm: true });
export const insertComunicadosSchema = createInsertSchema(comunicados).omit({ id: true, enviadoEm: true });
export const insertLogsAcessoSchema = createInsertSchema(logsAcesso).omit({ id: true, criadoEm: true });
export const insertLogsErroSchema = createInsertSchema(logsErro).omit({ id: true, criadoEm: true });
export const insertLogAuditoriaSchema = createInsertSchema(logsAuditoria).omit({ id: true, criadoEm: true });

// Esquemas de compatibilidade para o código existente
// Vamos definir schemas compat usando Zod
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  fullName: z.string(),
  role: z.enum(["student", "teacher", "manager"]).default("student"),
  avatarUrl: z.string().optional(),
  level: z.number().default(1),
  xp: z.number().default(0),
});

export const insertLearningPathSchema = z.object({
  title: z.string(),
  description: z.string(),
  area: z.enum(["mathematics", "languages", "sciences", "history", "geography", "arts"]),
  difficulty: z.number().default(1),
  requiredLevel: z.number().default(1),
  imageUrl: z.string().optional(),
  locationId: z.number(),
});

export const insertMissionSchema = z.object({
  title: z.string(),
  description: z.string(),
  area: z.enum(["mathematics", "languages", "sciences", "history", "geography", "arts"]),
  difficulty: z.number().default(1),
  xpReward: z.number().default(50),
  pathId: z.number(),
  content: z.any(),
  estimatedTime: z.number(),
  sequence: z.number(),
});

export const insertLocationSchema = z.object({
  name: z.string(),
  description: z.string(),
  coordinates: z.object({ x: z.number(), y: z.number() }),
  icon: z.string().default("castle"),
  unlockLevel: z.number().default(1),
});

export const insertUserProgressSchema = z.object({
  userId: z.number(),
  missionId: z.number(),
  completed: z.boolean().default(false),
  score: z.number().optional(),
  attempts: z.number().default(0),
  feedback: z.string().optional(),
  completedAt: z.date().optional().nullable(),
});

export const insertAchievementSchema = z.object({
  title: z.string(),
  description: z.string(),
  area: z.enum(["mathematics", "languages", "sciences", "history", "geography", "arts"]).optional().nullable(),
  iconName: z.string(),
  criteria: z.any().optional(),
  // Campos estendidos para compatibilidade com Supabase
  category: z.string().optional(),
  iconUrl: z.string().optional(),
  requirement: z.string().optional(),
  points: z.number().optional(),
});

export const insertUserAchievementSchema = z.object({
  userId: z.number(),
  achievementId: z.number(),
});

export const insertForumPostSchema = z.object({
  userId: z.number(),
  title: z.string(),
  content: z.string(),
  pathId: z.number().optional(),
  missionId: z.number().optional(),
  // Campos estendidos para compatibilidade com Supabase
  type: z.string().optional(),
});

export const insertForumReplySchema = z.object({
  postId: z.number(),
  userId: z.number(),
  content: z.string(),
  // Campos estendidos para compatibilidade com Supabase
  bestAnswer: z.boolean().optional(),
});

export const insertDiagnosticQuestionSchema = z.object({
  question: z.string(),
  area: z.enum(["mathematics", "languages", "sciences", "history", "geography", "arts"]),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  difficulty: z.number().default(1),
});

export const insertUserDiagnosticSchema = z.object({
  userId: z.number(),
  area: z.enum(["mathematics", "languages", "sciences", "history", "geography", "arts"]),
  score: z.number(),
  recommendedDifficulty: z.number(),
});

// Types para o novo esquema Supabase
export type Escola = typeof escolas.$inferSelect;
export type InsertEscola = z.infer<typeof insertEscolaSchema>;

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

export type Matricula = typeof matriculas.$inferSelect;
export type InsertMatricula = z.infer<typeof insertMatriculaSchema>;

export type PerfilAluno = typeof perfisAluno.$inferSelect;
export type InsertPerfilAluno = z.infer<typeof insertPerfilAlunoSchema>;

export type PerfilGestor = typeof perfilGestor.$inferSelect;
export type InsertPerfilGestor = z.infer<typeof insertPerfilGestorSchema>;

export type PerfilProfessor = typeof perfilProfessor.$inferSelect;
export type InsertPerfilProfessor = z.infer<typeof insertPerfilProfessorSchema>;

export type Trilha = typeof trilhas.$inferSelect;
export type InsertTrilha = z.infer<typeof insertTrilhaSchema>;

export type Missao = typeof missoes.$inferSelect;
export type InsertMissao = z.infer<typeof insertMissaoSchema>;

export type ProgressoAluno = typeof progressoAluno.$inferSelect;
export type InsertProgressoAluno = z.infer<typeof insertProgressoAlunoSchema>;

export type Conquista = typeof conquistas.$inferSelect;
export type InsertConquista = z.infer<typeof insertConquistaSchema>;

export type AlunoConquista = typeof alunoConquistas.$inferSelect;
export type InsertAlunoConquista = z.infer<typeof insertAlunoConquistaSchema>;

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = z.infer<typeof insertNotificacaoSchema>;

export type Forum = typeof foruns.$inferSelect;
export type InsertForum = z.infer<typeof insertForumSchema>;

export type PostForum = typeof postsForum.$inferSelect;
export type InsertPostForum = z.infer<typeof insertPostForumSchema>;

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = z.infer<typeof insertConfiguracaoSchema>;

export type ConfiguracaoEscolar = typeof configuracoesEscolares.$inferSelect;
export type InsertConfiguracaoEscolar = z.infer<typeof insertConfiguracoesEscolaresSchema>;

export type IntegracaoExterna = typeof integracoesExternas.$inferSelect;
export type InsertIntegracaoExterna = z.infer<typeof insertIntegracoesExternasSchema>;

export type TokenAPI = typeof tokensAPI.$inferSelect;
export type InsertTokenAPI = z.infer<typeof insertTokensAPISchema>;

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = z.infer<typeof insertRelatoriosSchema>;

export type Comunicado = typeof comunicados.$inferSelect;
export type InsertComunicado = z.infer<typeof insertComunicadosSchema>;

export type LogAcesso = typeof logsAcesso.$inferSelect;
export type InsertLogAcesso = z.infer<typeof insertLogsAcessoSchema>;

export type LogErro = typeof logsErro.$inferSelect;
export type InsertLogErro = z.infer<typeof insertLogsErroSchema>;

export type LogAuditoria = typeof logsAuditoria.$inferSelect;
export type InsertLogAuditoria = z.infer<typeof insertLogAuditoriaSchema>;

// Types de compatibilidade para o código existente
// Esses são tipos temporários que servem para manter a compatibilidade com o código existente
export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  fullName: string;
  role: "student" | "teacher" | "manager";
  avatarUrl?: string;
  level: number;
  xp: number;
  createdAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  area: string;
  difficulty: number;
  requiredLevel: number;
  imageUrl?: string;
  locationId: number;
  createdAt: Date;
}

export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export interface Mission {
  id: number;
  title: string;
  description: string;
  area: string;
  difficulty: number;
  xpReward: number;
  pathId: number;
  content?: any; // Tornando opcional para compatibilidade
  estimatedTime: number;
  sequence: number;
  createdAt: Date;
  // Campos opcionais para compatibilidade com Supabase
  location?: string;
  type?: string;
  objectives?: string[];
}

export type InsertMission = z.infer<typeof insertMissionSchema>;

export interface Location {
  id: number;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  icon: string;
  unlockLevel: number;
  createdAt: Date;
}

export type InsertLocation = z.infer<typeof insertLocationSchema>;

export interface UserProgress {
  id: number;
  userId: number;
  missionId: number;
  completed: boolean;
  score?: number;
  attempts: number;
  feedback?: string;
  completedAt: Date | null;
  createdAt: Date;
}

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export interface Achievement {
  id: number;
  title: string;
  description: string;
  area: string | null;
  iconName: string;
  criteria?: any; // Tornando opcional para compatibilidade
  createdAt: Date;
  // Campos estendidos para compatibilidade com Supabase
  category?: string;
  iconUrl?: string;
  requirement?: string;
  points?: number;
}

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: Date;
  // Campos estendidos para compatibilidade com Supabase
  achievementTitle?: string;
  achievementDescription?: string;
  achievementIconUrl?: string;
}

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export interface ForumPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  pathId?: number;
  missionId?: number;
  createdAt: Date;
  // Campos estendidos para compatibilidade com Supabase
  type?: string;
  authorName?: string;
  pathTitle?: string;
  replyCount?: number;
}

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export interface ForumReply {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
  // Campos estendidos para compatibilidade com Supabase
  bestAnswer?: boolean;
  authorName?: string;
}

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export interface DiagnosticQuestion {
  id: number;
  question: string;
  area: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
  createdAt: Date;
}

export type InsertDiagnosticQuestion = z.infer<typeof insertDiagnosticQuestionSchema>;

export interface UserDiagnostic {
  id: number;
  userId: number;
  area: string;
  score: number;
  recommendedDifficulty: number;
  completedAt: Date;
}

export type InsertUserDiagnostic = z.infer<typeof insertUserDiagnosticSchema>;
