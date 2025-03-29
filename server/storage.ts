import { users, userProgress, gameModules, type User, type InsertUser, type GameModule, type UserProgress, type InsertUserProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllModules(): Promise<GameModule[]>;
  getModuleById(id: number): Promise<GameModule | undefined>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByModule(userId: number, moduleId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, GameModule>;
  private progress: Map<number, UserProgress>;
  sessionStore: session.SessionStore;
  currentId: number;
  currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.currentProgressId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with default game modules
    this.initializeGameModules();
  }

  private initializeGameModules() {
    const defaultModules: GameModule[] = [
      {
        id: 1,
        title: "Spot the Scam",
        description: "Learn to identify phishing attempts and online scams through interactive examples.",
        difficulty: "Beginner",
        type: "phishing",
        totalChallenges: 5,
        iconClass: "bx bx-search-alt"
      },
      {
        id: 2,
        title: "Password Challenge",
        description: "Master the art of creating strong, memorable passwords and test your knowledge.",
        difficulty: "Intermediate",
        type: "password",
        totalChallenges: 5,
        iconClass: "bx bx-lock-alt"
      },
      {
        id: 3,
        title: "Safe Browsing",
        description: "Learn how to browse the web safely and protect your privacy online.",
        difficulty: "Advanced",
        type: "browsing",
        totalChallenges: 5,
        iconClass: "bx bx-globe"
      }
    ];
    
    defaultModules.forEach(module => {
      this.modules.set(module.id, module);
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
    return user;
  }

  async getAllModules(): Promise<GameModule[]> {
    return Array.from(this.modules.values());
  }

  async getModuleById(id: number): Promise<GameModule | undefined> {
    return this.modules.get(id);
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.progress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async getUserProgressByModule(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    return Array.from(this.progress.values()).find(
      (progress) => progress.userId === userId && progress.moduleId === moduleId
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = { ...insertProgress, id };
    this.progress.set(id, progress);
    return progress;
  }

  async updateUserProgress(id: number, updatedProgress: Partial<InsertUserProgress>): Promise<UserProgress> {
    const currentProgress = this.progress.get(id);
    if (!currentProgress) {
      throw new Error('Progress not found');
    }
    
    const progress: UserProgress = {
      ...currentProgress,
      ...updatedProgress
    };
    
    this.progress.set(id, progress);
    return progress;
  }
}

export const storage = new MemStorage();
