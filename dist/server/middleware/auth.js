"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = exports.generateToken = exports.requireAnyRole = exports.requireManagerOrAdmin = exports.requireAdmin = exports.authorizeRoles = exports.authenticateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var env_1 = require("../config/env");
var errors_1 = require("../utils/errors");
// JWT Authentication Middleware
var authenticateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded;
    return __generator(this, function (_a) {
        try {
            authHeader = req.headers.authorization;
            token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                throw new errors_1.UnauthorizedError("Access token required");
            }
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                next(new errors_1.UnauthorizedError("Invalid token"));
            }
            else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                next(new errors_1.UnauthorizedError("Token expired"));
            }
            else {
                next(error);
            }
        }
        return [2 /*return*/];
    });
}); };
exports.authenticateToken = authenticateToken;
// Role-based Authorization Middleware
var authorizeRoles = function () {
    var allowedRoles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedRoles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        if (!req.user) {
            next(new errors_1.UnauthorizedError("Authentication required"));
            return;
        }
        if (!allowedRoles.includes(req.user.userType)) {
            next(new errors_1.ForbiddenError("Access denied. Required roles: ".concat(allowedRoles.join(", "))));
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Specific role authorization helpers
exports.requireAdmin = (0, exports.authorizeRoles)("admin");
exports.requireManagerOrAdmin = (0, exports.authorizeRoles)("admin", "manager");
exports.requireAnyRole = (0, exports.authorizeRoles)("admin", "manager", "employee");
// Utility function to generate JWT token
var generateToken = function (payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN
    });
};
exports.generateToken = generateToken;
// Utility function to hash password
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    var saltRounds;
    return __generator(this, function (_a) {
        saltRounds = 12;
        return [2 /*return*/, bcryptjs_1.default.hash(password, saltRounds)];
    });
}); };
exports.hashPassword = hashPassword;
// Utility function to compare password
var comparePassword = function (plainPassword, hashedPassword) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, bcryptjs_1.default.compare(plainPassword, hashedPassword)];
    });
}); };
exports.comparePassword = comparePassword;
