// lib/db.ts
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10 // Neon free tier limit
});

export const db = drizzle(pool);
