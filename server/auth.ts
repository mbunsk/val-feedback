import { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: string;
  googleId: string | null;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Middleware to require authentication
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    req.user = req.user as AuthenticatedUser;
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware for optional authentication
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    req.user = req.user as AuthenticatedUser;
  }
  next();
}

// Helper function to get current user
export function getCurrentUser(req: Request): AuthenticatedUser | undefined {
  return req.isAuthenticated() ? req.user as AuthenticatedUser : undefined;
}