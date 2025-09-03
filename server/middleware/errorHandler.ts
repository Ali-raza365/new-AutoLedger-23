import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { sendError, sendValidationError } from "../utils/response";
import { isDevelopment } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return sendValidationError(res, err.errors, "Validation failed");
  }

  // Handle operational errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle MongoDB duplicate key errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return sendError(res, `Duplicate value for field: ${field}`, 409);
  }

  // Handle MongoDB validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map((e: any) => e.message);
    return sendValidationError(res, errors, "Database validation failed");
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  // Log unexpected errors in development
  if (isDevelopment) {
    console.error("Unexpected error:", err);
  }

  // Default error response
  return sendError(res, "Internal server error", 500);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};