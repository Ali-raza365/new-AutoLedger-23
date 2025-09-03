import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type JWTPayload, type UserType } from "@shared/schema";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

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
      throw new UnauthorizedError("Access token required");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};

// Role-based Authorization Middleware
export const authorizeRoles = (...allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`));
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
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions);
};

// Utility function to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Utility function to compare password
export const comparePassword = async (
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};