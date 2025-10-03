import { Router } from "express";
import {
  getSettings,
  updateSettings,
  resetSettings,
  importSettings
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

// ✅ Import route (admin only)
router.post(
  "/import/:type",
  requireAdmin,
  importSettings
);

export default router;