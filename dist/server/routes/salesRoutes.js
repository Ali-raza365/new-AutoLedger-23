"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var controllers_1 = require("../controllers");
var middleware_1 = require("../middleware");
var schema_1 = require("@shared/schema");
var router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authenticateToken);
// View routes (all roles)
router.get("/", middleware_1.requireAnyRole, controllers_1.getAllSales);
router.get("/search/:query", middleware_1.requireAnyRole, controllers_1.searchSales);
router.get("/:id", middleware_1.requireAnyRole, controllers_1.getSalesById);
// Create/Update routes (managers and admins)
router.post("/", middleware_1.requireManagerOrAdmin, (0, middleware_1.validateBody)(schema_1.insertSalesSchema), controllers_1.createSalesItem);
router.put("/:id", middleware_1.requireManagerOrAdmin, controllers_1.updateSalesItem);
// Delete routes (admin only)
router.delete("/:id", middleware_1.requireAdmin, controllers_1.deleteSalesItem);
exports.default = router;
