"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var controllers_1 = require("../controllers");
var middleware_1 = require("../middleware");
var schema_1 = require("@shared/schema");
var router = (0, express_1.Router)();
// Public routes
router.post("/register", (0, middleware_1.validateBody)(schema_1.registerUserSchema), controllers_1.registerUser);
router.post("/login", (0, middleware_1.validateBody)(schema_1.loginUserSchema), controllers_1.loginUser);
// Protected routes
router.get("/me", middleware_1.authenticateToken, controllers_1.getCurrentUser);
// Admin/Manager routes
router.get("/", middleware_1.authenticateToken, middleware_1.requireManagerOrAdmin, controllers_1.getAllUsers);
router.get("/:id", middleware_1.authenticateToken, middleware_1.requireManagerOrAdmin, controllers_1.getUserById);
router.put("/:id", middleware_1.authenticateToken, middleware_1.requireManagerOrAdmin, controllers_1.updateUser);
router.delete("/:id", middleware_1.authenticateToken, middleware_1.requireAdmin, controllers_1.deleteUser);
exports.default = router;
