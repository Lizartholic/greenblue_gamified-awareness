import { users, type User, type InsertUser, type Progress, moduleProgress, UserProgress, ModuleProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import mysql from 'mysql2/promise';
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progressData: Map<number, UserProgress>;
  currentId: number;
  sessionStore: session.Store;

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

export class PostgreSQLStorage implements IStorage {
  private pool: mysql.Pool;
  sessionStore: session.Store;
  
  constructor() {
    // Use PostgreSQL environment variables
    this.pool = mysql.createPool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: parseInt(process.env.PGPORT || '5432', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Use PostgreSQL session store
    // This will automatically create a 'session' table if it doesn't exist
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: parseInt(process.env.PGPORT || '5432', 10),
      },
      createTableIfMissing: true
    });
    
    // Initialize database tables
    this.initDatabase();
  }
  
  private async initDatabase() {
    try {
      // Create users table if it doesn't exist
      // Adjust syntax for PostgreSQL if needed
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          fullname VARCHAR(255) NOT NULL,
          gender VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL
        )
      `);
      
      // Create module_progress table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS module_progress (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          module_id VARCHAR(50) NOT NULL,
          progress INT NOT NULL DEFAULT 0,
          score INT NOT NULL DEFAULT 0,
          completed_challenges JSON DEFAULT '[]',
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      console.log('Database tables initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      // PostgreSQL uses $1, $2, etc. for parameters instead of ?
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
        'SELECT * FROM users WHERE id = $1', 
        [id]
      );
      
      if (rows.length === 0) {
        return undefined;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        fullname: userData.fullname,
        gender: userData.gender,
        email: userData.email
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (rows.length === 0) {
        return undefined;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        fullname: userData.fullname,
        gender: userData.gender,
        email: userData.email
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // In PostgreSQL, we can use RETURNING to get the inserted ID
      const result = await this.pool.query(
        'INSERT INTO users (username, password, fullname, gender, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [
          insertUser.username,
          insertUser.password,
          insertUser.fullname,
          insertUser.gender,
          insertUser.email
        ]
      );
      
      // Extract ID from the result - result structure might be different in PostgreSQL vs MySQL
      // This approach is more generic
      const userId = (result[0] as any)?.id || ((result as any)?.rows?.[0]?.id);
      
      if (!userId) {
        throw new Error('Failed to get inserted user ID');
      }
      
      // Initialize empty progress for the new user - PostgreSQL multi-value insert syntax
      await this.pool.query(
        `INSERT INTO module_progress (user_id, module_id, progress, score, completed_challenges) VALUES 
         ($1, $2, $3, $4, $5), 
         ($1, $6, $3, $4, $5)`,
        [
          userId, 'phishing', 0, 0, JSON.stringify([]),
          'password'
        ]
      );
      
      return {
        id: userId,
        ...insertUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    try {
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
        'SELECT * FROM module_progress WHERE user_id = $1',
        [userId]
      );
      
      if (rows.length === 0) {
        return undefined;
      }
      
      const modules: ModuleProgress = {};
      rows.forEach(row => {
        modules[row.module_id] = {
          progress: row.progress,
          score: row.score,
          completedChallenges: JSON.parse(row.completed_challenges || '[]')
        };
      });
      
      // Calculate overall progress
      const moduleValues = Object.values(modules);
      const overallProgress = moduleValues.reduce((sum, module) => sum + (module?.progress || 0), 0) / moduleValues.length;
      
      return {
        userId,
        overallProgress,
        modules
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return undefined;
    }
  }
  
  async updateUserProgress(userId: number, moduleId: string, data: Partial<Progress>): Promise<UserProgress> {
    try {
      // Check if progress entry exists
      const [checkRows] = await this.pool.query<mysql.RowDataPacket[]>(
        'SELECT * FROM module_progress WHERE user_id = $1 AND module_id = $2',
        [userId, moduleId]
      );
      
      if (checkRows.length === 0) {
        // Create new progress entry if it doesn't exist
        await this.pool.query(
          'INSERT INTO module_progress (user_id, module_id, progress, score, completed_challenges) VALUES ($1, $2, $3, $4, $5)',
          [userId, moduleId, data.progress || 0, data.score || 0, JSON.stringify(data.completedChallenges || [])]
        );
      } else {
        // Update existing progress
        const currentProgress = {
          progress: checkRows[0].progress,
          score: checkRows[0].score,
          completedChallenges: JSON.parse(checkRows[0].completed_challenges || '[]')
        };
        
        const updatedProgress = {
          progress: data.progress !== undefined ? data.progress : currentProgress.progress,
          score: data.score !== undefined ? data.score : currentProgress.score,
          completedChallenges: data.completedChallenges || currentProgress.completedChallenges
        };
        
        await this.pool.query(
          'UPDATE module_progress SET progress = $1, score = $2, completed_challenges = $3 WHERE user_id = $4 AND module_id = $5',
          [
            updatedProgress.progress,
            updatedProgress.score,
            JSON.stringify(updatedProgress.completedChallenges),
            userId,
            moduleId
          ]
        );
      }
      
      // Get updated progress
      const userProgress = await this.getUserProgress(userId);
      if (!userProgress) {
        throw new Error('Failed to retrieve updated progress');
      }
      
      return userProgress;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw new Error('Failed to update progress');
    }
  }
}

// Choose which storage implementation to use
// You can switch between MemStorage and PostgreSQLStorage here
// export const storage = new MemStorage(); 
// Using PostgreSQL for persistent storage
export const storage = new PostgreSQLStorage();
