"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
var zod_1 = require("zod");
var response_1 = require("../utils/response");
var validateBody = function (schema) {
    return function (req, res, next) {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                (0, response_1.sendValidationError)(res, error.errors, "Request validation failed");
                return;
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
var validateParams = function (schema) {
    return function (req, res, next) {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                (0, response_1.sendValidationError)(res, error.errors, "Parameter validation failed");
                return;
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
var validateQuery = function (schema) {
    return function (req, res, next) {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                (0, response_1.sendValidationError)(res, error.errors, "Query validation failed");
                return;
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
