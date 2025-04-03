import { Pool } from 'pg';  // Use standard pg package for local PostgreSQL
import { drizzle } from 'drizzle-orm/pg';  // Correct import for pg
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a standard PostgreSQL pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema });
