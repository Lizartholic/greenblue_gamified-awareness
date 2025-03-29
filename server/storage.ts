import { users, type User, type InsertUser, type Progress, moduleProgress, UserProgress, ModuleProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import mysql from 'mysql2/promise';

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

export class MySQLStorage implements IStorage {
  private pool: mysql.Pool;
  sessionStore: session.Store;
  
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'cybersafe',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // You would need a MySQL session store package
    // For now, using memory store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize database tables
    this.initDatabase();
  }
  
  private async initDatabase() {
    try {
      // Create users table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
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
          id INT AUTO_INCREMENT PRIMARY KEY,
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
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?', 
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
        'SELECT * FROM users WHERE username = ?',
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
      const [result] = await this.pool.query<mysql.ResultSetHeader>(
        'INSERT INTO users (username, password, fullname, gender, email) VALUES (?, ?, ?, ?, ?)',
        [
          insertUser.username,
          insertUser.password,
          insertUser.fullname,
          insertUser.gender,
          insertUser.email
        ]
      );
      
      const userId = result.insertId;
      
      // Initialize empty progress for the new user
      await this.pool.query(
        'INSERT INTO module_progress (user_id, module_id, progress, score, completed_challenges) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
        [
          userId, 'phishing', 0, 0, JSON.stringify([]),
          userId, 'password', 0, 0, JSON.stringify([])
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
        'SELECT * FROM module_progress WHERE user_id = ?',
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
        'SELECT * FROM module_progress WHERE user_id = ? AND module_id = ?',
        [userId, moduleId]
      );
      
      if (checkRows.length === 0) {
        // Create new progress entry if it doesn't exist
        await this.pool.query(
          'INSERT INTO module_progress (user_id, module_id, progress, score, completed_challenges) VALUES (?, ?, ?, ?, ?)',
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
          'UPDATE module_progress SET progress = ?, score = ?, completed_challenges = ? WHERE user_id = ? AND module_id = ?',
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
// You can switch between MemStorage and MySQLStorage here
export const storage = new MemStorage(); 
// To use MySQL instead, comment the line above and uncomment the line below:
// export const storage = new MySQLStorage();
