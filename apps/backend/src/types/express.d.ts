export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      googleId: string;
      name: string;
      email: string;
      avatar?: string | null;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}