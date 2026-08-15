import type { User as PrismaUser } from "@prisma/client";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

import "express-session";

declare module "express-session" {
  interface SessionData {
    // Keep this empty unless your application has custom session fields.
  }
}