import { Router } from "express";
import {
  getAllInventory,
  getInventoryById,
  getInventoryByVin,
  getInventoryByStockNumber,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventory,
  lookupVinData,
    bulkImportInventory
} from "../controllers";
import { 
  authenticateToken, 
  requireAdmin, 
  requireManagerOrAdmin,
  requireAnyRole,
  validateBody
} from "../middleware";
import { insertInventorySchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// View routes (all roles)
router.get("/", requireAnyRole, getAllInventory);
router.get("/search/:query", requireAnyRole, searchInventory);
router.get("/vin-lookup/:vin", requireAnyRole, lookupVinData);
router.get("/vin/:vin", requireAnyRole, getInventoryByVin);
router.get("/stock/:stockNumber", requireAnyRole, getInventoryByStockNumber);
router.get("/:id", requireAnyRole, getInventoryById);

// Create/Update routes (managers and admins)
router.post("/", requireManagerOrAdmin, validateBody(insertInventorySchema), createInventoryItem);
router.post("/bulk-import", requireManagerOrAdmin, bulkImportInventory);

router.put("/:id", requireManagerOrAdmin, updateInventoryItem);


// Delete routes (admin only)
router.delete("/:id", requireAdmin, deleteInventoryItem);

export default router;