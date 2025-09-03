import { Router } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers";
import { 
  authenticateToken, 
  requireAdmin, 
  requireManagerOrAdmin,
  validateBody
} from "../middleware";
import { registerUserSchema, loginUserSchema } from "@shared/schema";

const router = Router();

// Public routes
router.post("/register", validateBody(registerUserSchema), registerUser);
router.post("/login", validateBody(loginUserSchema), loginUser);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

// Admin/Manager routes
router.get("/", authenticateToken, requireManagerOrAdmin, getAllUsers);
router.get("/:id", authenticateToken, requireManagerOrAdmin, getUserById);
router.put("/:id", authenticateToken, requireManagerOrAdmin, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

export default router;