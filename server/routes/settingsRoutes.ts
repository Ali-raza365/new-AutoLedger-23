import { Router } from "express";
import {
  getSettings,
  updateSettings,
  resetSettings
} from "../controllers";
import { 
  authenticateToken, 
  requireAdmin,
  requireAnyRole,
  validateBody
} from "../middleware";
import { insertSettingsSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// View routes (all roles can view settings)
router.get("/", requireAnyRole, getSettings);

// Update routes (admin only)
router.put("/", requireAdmin, validateBody(insertSettingsSchema), updateSettings);
router.post("/reset", requireAdmin, resetSettings);

export default router;