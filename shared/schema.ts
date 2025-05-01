import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "manager"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subject areas enum
export const subjectAreaEnum = pgEnum("subject_area", [
  "mathematics", 
  "languages", 
  "sciences", 
  "history",
  "geography",
  "arts"
]);

// Learning paths table
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  area: subjectAreaEnum("area").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  requiredLevel: integer("required_level").notNull().default(1),
  imageUrl: text("image_url"),
  locationId: integer("location_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Missions table
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  area: subjectAreaEnum("area").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  xpReward: integer("xp_reward").notNull().default(50),
  pathId: integer("path_id").notNull(),
  content: json("content").notNull(), // Questions, challenges, narrative
  estimatedTime: integer("estimated_time").notNull(), // In minutes
  sequence: integer("sequence").notNull(), // Order in the path
  createdAt: timestamp("created_at").defaultNow(),
});

// Map locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  coordinates: json("coordinates").notNull(), // {x, y} position on map
  icon: text("icon").notNull().default("castle"),
  unlockLevel: integer("unlock_level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  missionId: integer("mission_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  attempts: integer("attempts").notNull().default(0),
  feedback: text("feedback"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  area: subjectAreaEnum("area"),
  iconName: text("icon_name").notNull(),
  criteria: json("criteria").notNull(), // Requirements to earn
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Forum posts table
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pathId: integer("path_id"),
  missionId: integer("mission_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum replies table
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Diagnostic questions table
export const diagnosticQuestions = pgTable("diagnostic_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  area: subjectAreaEnum("area").notNull(),
  options: json("options").notNull(), // Array of options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct answer
  difficulty: integer("difficulty").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// User diagnostic results table
export const userDiagnostics = pgTable("user_diagnostics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  area: subjectAreaEnum("area").notNull(),
  score: integer("score").notNull(),
  recommendedDifficulty: integer("recommended_difficulty").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true, createdAt: true });
export const insertMissionSchema = createInsertSchema(missions).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, createdAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true });
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ id: true, createdAt: true });
export const insertDiagnosticQuestionSchema = createInsertSchema(diagnosticQuestions).omit({ id: true, createdAt: true });
export const insertUserDiagnosticSchema = createInsertSchema(userDiagnostics).omit({ id: true, completedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type DiagnosticQuestion = typeof diagnosticQuestions.$inferSelect;
export type InsertDiagnosticQuestion = z.infer<typeof insertDiagnosticQuestionSchema>;

export type UserDiagnostic = typeof userDiagnostics.$inferSelect;
export type InsertUserDiagnostic = z.infer<typeof insertUserDiagnosticSchema>;
