import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  tinyint,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isVerified: tinyint("isVerified", { unsigned: true }).default(1).notNull(),
  emailVerified: tinyint("emailVerified", { unsigned: true }).default(0).notNull(),
  failedLoginAttempts: int("failedLoginAttempts", { unsigned: true }).default(0).notNull(),
  accountLockedUntil: timestamp("accountLockedUntil"),
  acceptedTermsAt: timestamp("acceptedTermsAt"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
  lastReminderSentAt: timestamp("lastReminderSentAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Lesson progress tracking
export const lessonProgress = mysqlTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  lessonId: varchar("lessonId", { length: 100 }).notNull(),
  chapterType: varchar("chapterType", { length: 50 }).notNull(), // 'tech-mech' | 'dc-circuit'
  completed: tinyint("completed", { unsigned: true }).default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds", { unsigned: true }).default(0),
  score: int("score", { unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Generator practice stats
export const generatorStats = mysqlTable("generator_stats", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  difficulty: int("difficulty", { unsigned: true }).notNull(),
  completed: int("completed", { unsigned: true }).default(0).notNull(),
  correct: int("correct", { unsigned: true }).default(0).notNull(),
  totalTimeMs: int("totalTimeMs", { unsigned: true }).default(0),
  currentStreak: int("currentStreak", { unsigned: true }).default(0),
  bestStreak: int("bestStreak", { unsigned: true }).default(0),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Exercise attempts
export const exerciseAttempts = mysqlTable("exercise_attempts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  exerciseId: varchar("exerciseId", { length: 50 }).notNull(),
  correct: tinyint("correct", { unsigned: true }).notNull(),
  timeSpentSeconds: int("timeSpentSeconds", { unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type GeneratorStat = typeof generatorStats.$inferSelect;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;

// Chat rooms
export const chatRooms = mysqlTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  topic: varchar("topic", { length: 100 }).default("general").notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Chat messages
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("userName", { length: 255 }),
  userAvatar: text("userAvatar"),
  content: text("content").notNull(),
  isAi: tinyint("isAi", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// AI tutor conversations (per-user private chat history)
export const aiConversations = mysqlTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// AI tutor messages
export const aiMessages = mysqlTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type AIConversation = typeof aiConversations.$inferSelect;
export type AIMessage = typeof aiMessages.$inferSelect;

// Password reset tokens (token column stores SHA-256 hash of the raw token)
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: tinyint("used", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// OTP verification tokens (for registration and sensitive actions)
export const otpTokens = mysqlTable("otp_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  otp: varchar("otp", { length: 255 }).notNull(),
  purpose: varchar("purpose", { length: 30 }).notNull(), // 'REGISTER' | 'RESET_PASSWORD' | 'SENSITIVE_ACTION'
  expiresAt: timestamp("expiresAt").notNull(),
  used: tinyint("used", { unsigned: true }).default(0).notNull(),
  attempts: int("attempts", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpToken = typeof otpTokens.$inferSelect;

// Login/auth activity log
export const loginActivity = mysqlTable("login_activity", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  username: varchar("username", { length: 30 }),
  email: varchar("email", { length: 320 }),
  action: varchar("action", { length: 30 }).notNull(), // 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'OTP_VERIFY' | 'PASSWORD_RESET' | 'PASSWORD_CHANGE'
  success: tinyint("success", { unsigned: true }).default(1).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  details: varchar("details", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginActivity = typeof loginActivity.$inferSelect;

// Password history (to prevent reuse of previous passwords)
export const passwordHistory = mysqlTable("password_history", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordHistoryEntry = typeof passwordHistory.$inferSelect;

//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
