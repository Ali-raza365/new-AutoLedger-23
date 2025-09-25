"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var controllers_1 = require("../controllers");
var middleware_1 = require("../middleware");
var schema_1 = require("@shared/schema");
var router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authenticateToken);
// View routes (all roles can view settings)
router.get("/", middleware_1.requireAnyRole, controllers_1.getSettings);
// Update routes (admin only)
router.put("/", middleware_1.requireAdmin, (0, middleware_1.validateBody)(schema_1.insertSettingsSchema), controllers_1.updateSettings);
router.post("/reset", middleware_1.requireAdmin, controllers_1.resetSettings);
exports.default = router;
