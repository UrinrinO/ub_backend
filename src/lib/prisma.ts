import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Put it in server/.env");
}

const pool = new Pool({
  connectionString,
  // Neon often needs SSL; your URL has sslmode=require, but pg doesn't always honor it.
  // This makes it explicit and avoids handshake issues.
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });