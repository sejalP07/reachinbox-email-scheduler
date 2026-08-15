import type { User as PrismaUser } from "@prisma/client";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface User extends PrismaUser {}
  }
}