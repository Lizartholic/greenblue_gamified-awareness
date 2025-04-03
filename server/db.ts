// For ESM imports, we need to use a different approach for pg
import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';  // Correct import for node-postgres
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Extract Pool from the pg package this way for ESM compatibility
const { Pool } = pkg;

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
