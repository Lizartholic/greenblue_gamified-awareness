import { users, type User, type InsertUser, type Progress, moduleProgress, UserProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Progress tracking
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, moduleId: string, data: Partial<Progress>): Promise<UserProgress>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progressData: Map<number, UserProgress>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.progressData = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Initialize empty progress for the new user
    this.progressData.set(id, {
      userId: id,
      overallProgress: 0,
      modules: {
        phishing: { progress: 0, score: 0, completedChallenges: [] },
        password: { progress: 0, score: 0, completedChallenges: [] }
      }
    });
    
    return user;
  }
  
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return this.progressData.get(userId);
  }
  
  async updateUserProgress(userId: number, moduleId: string, data: Partial<Progress>): Promise<UserProgress> {
    const userProgress = this.progressData.get(userId) || {
      userId,
      overallProgress: 0,
      modules: {
        phishing: { progress: 0, score: 0, completedChallenges: [] },
        password: { progress: 0, score: 0, completedChallenges: [] }
      }
    };
    
    // Update the specific module progress
    if (userProgress.modules[moduleId]) {
      userProgress.modules[moduleId] = {
        ...userProgress.modules[moduleId],
        ...data
      };
      
      // Recalculate overall progress (average of all modules)
      const moduleValues = Object.values(userProgress.modules);
      userProgress.overallProgress = moduleValues.reduce((sum, module) => sum + module.progress, 0) / moduleValues.length;
    }
    
    this.progressData.set(userId, userProgress);
    return userProgress;
  }
}

export const storage = new MemStorage();
