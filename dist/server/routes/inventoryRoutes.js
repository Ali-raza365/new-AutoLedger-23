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
router.get("/", middleware_1.requireAnyRole, controllers_1.getAllInventory);
router.get("/search/:query", middleware_1.requireAnyRole, controllers_1.searchInventory);
router.get("/vin-lookup/:vin", middleware_1.requireAnyRole, controllers_1.lookupVinData);
router.get("/vin/:vin", middleware_1.requireAnyRole, controllers_1.getInventoryByVin);
router.get("/stock/:stockNumber", middleware_1.requireAnyRole, controllers_1.getInventoryByStockNumber);
router.get("/:id", middleware_1.requireAnyRole, controllers_1.getInventoryById);
// Create/Update routes (managers and admins)
router.post("/", middleware_1.requireManagerOrAdmin, (0, middleware_1.validateBody)(schema_1.insertInventorySchema), controllers_1.createInventoryItem);
router.put("/:id", middleware_1.requireManagerOrAdmin, controllers_1.updateInventoryItem);
// Delete routes (admin only)
router.delete("/:id", middleware_1.requireAdmin, controllers_1.deleteInventoryItem);
exports.default = router;
