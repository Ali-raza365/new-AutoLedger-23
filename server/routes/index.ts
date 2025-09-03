import { Router } from "express";
import userRoutes from "./userRoutes";
import inventoryRoutes from "./inventoryRoutes";
import salesRoutes from "./salesRoutes";
import settingsRoutes from "./settingsRoutes";

const router = Router();

// Mount route modules
router.use("/auth", userRoutes);
router.use("/users", userRoutes); // For admin user management
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/settings", settingsRoutes);

// Add a compatibility route for stats that was in the old routes
router.get("/stats", async (req, res, next) => {
  try {
    // Import the getSalesStats controller dynamically
    const { getSalesStats } = await import("../controllers");
    const { authenticateToken, requireAnyRole } = await import("../middleware");
    // Apply middleware manually
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      requireAnyRole(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return getSalesStats(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;