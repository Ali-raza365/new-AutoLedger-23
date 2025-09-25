"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
var zod_1 = require("zod");
var errors_1 = require("../utils/errors");
var response_1 = require("../utils/response");
var env_1 = require("../config/env");
var errorHandler = function (err, req, res, next) {
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return (0, response_1.sendValidationError)(res, err.errors, "Validation failed");
    }
    // Handle operational errors
    if (err instanceof errors_1.AppError) {
        return (0, response_1.sendError)(res, err.message, err.statusCode);
    }
    // Handle MongoDB duplicate key errors
    if (err.name === "MongoServerError" && err.code === 11000) {
        var field = Object.keys(err.keyValue)[0];
        return (0, response_1.sendError)(res, "Duplicate value for field: ".concat(field), 409);
    }
    // Handle MongoDB validation errors
    if (err.name === "ValidationError") {
        var errors = Object.values(err.errors).map(function (e) { return e.message; });
        return (0, response_1.sendValidationError)(res, errors, "Database validation failed");
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return (0, response_1.sendError)(res, "Invalid token", 401);
    }
    if (err.name === "TokenExpiredError") {
        return (0, response_1.sendError)(res, "Token expired", 401);
    }
    // Log unexpected errors in development
    if (env_1.isDevelopment) {
        console.error("Unexpected error:", err);
    }
    // Default error response
    return (0, response_1.sendError)(res, "Internal server error", 500);
};
exports.errorHandler = errorHandler;
// Async error wrapper to catch async errors
var asyncHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
