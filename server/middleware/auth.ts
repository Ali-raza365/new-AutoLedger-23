import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JWTPayload, type UserType } from "@shared/schema";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

// JWT Authentication Middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ message: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};

// Role-based Authorization Middleware
export const authorizeRoles = (...allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      res.status(403).json({ 
        message: "Access denied. Insufficient permissions.",
        required: allowedRoles,
        current: req.user.userType
      });
      return;
    }

    next();
  };
};

// Specific role authorization helpers
export const requireAdmin = authorizeRoles("admin");
export const requireManagerOrAdmin = authorizeRoles("admin", "manager");
export const requireAnyRole = authorizeRoles("admin", "manager", "employee");

// Utility function to generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn 
  });
};

// Utility function to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import("bcryptjs");
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Utility function to compare password
export const comparePassword = async (
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plainPassword, hashedPassword);
};