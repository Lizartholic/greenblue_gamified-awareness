import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

export const gameModules = pgTable("game_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  totalChallenges: integer("total_challenges").notNull(),
  iconClass: text("icon_class").notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  completedChallenges: integer("completed_challenges").default(0),
  points: integer("points").default(0),
  timeSpent: integer("time_spent").default(0), // in minutes
  isCompleted: boolean("is_completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullname: true,
  gender: true,
  email: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  moduleId: true,
  completedChallenges: true,
  points: true,
  timeSpent: true,
  isCompleted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type GameModule = typeof gameModules.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
