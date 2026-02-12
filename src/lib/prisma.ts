import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
