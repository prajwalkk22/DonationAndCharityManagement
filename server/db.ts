import * as dotenv from "dotenv";

// In development (VS Code), load from .env / .env.local
// In production (Render), do NOT override env vars
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

// 🔍 DEBUG: log the DB URL host in Render logs (safe)
try {
  const parsed = new URL(process.env.DATABASE_URL);
  console.log("[db] Using DATABASE_URL host:", parsed.host);
} catch (e) {
  console.log("[db] Invalid DATABASE_URL format:", process.env.DATABASE_URL);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL for external connections
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
