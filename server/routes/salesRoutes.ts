import { Router } from "express";
import {
  getAllSales,
  getSalesById,
  createSalesItem,
  updateSalesItem,
  deleteSalesItem,
  searchSales
} from "../controllers";
import { 
  authenticateToken, 
  requireAdmin, 
  requireManagerOrAdmin,
  requireAnyRole,
  validateBody
} from "../middleware";
import { insertSalesSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// View routes (all roles)
router.get("/", requireAnyRole, getAllSales);
router.get("/search/:query", requireAnyRole, searchSales);
router.get("/:id", requireAnyRole, getSalesById);

// Create/Update routes (managers and admins)
router.post("/", requireManagerOrAdmin, validateBody(insertSalesSchema), createSalesItem);
router.put("/:id", requireManagerOrAdmin, updateSalesItem);

// Delete routes (admin only)
router.delete("/:id", requireAdmin, deleteSalesItem);

export default router;