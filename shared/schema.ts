import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullname: text("fullname").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullname: true,
  gender: true,
  email: true,
});

// Progress tracking
export interface Progress {
  progress: number;
  score: number;
  completedChallenges: number[];
}

export interface ModuleProgress {
  [moduleId: string]: Progress;
}

export interface UserProgress {
  userId: number;
  overallProgress: number;
  modules: ModuleProgress;
}

export const moduleProgress = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: text("module_id").notNull(),
  progress: integer("progress").notNull().default(0),
  score: integer("score").notNull().default(0),
  completedChallenges: json("completed_challenges").$type<number[]>().default([]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
