import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, storagePromise } from "./storage";
import { 
  insertInventorySchema, 
  insertSalesSchema,
  registerUserSchema,
  loginUserSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { 
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireManagerOrAdmin,
  requireAnyRole,
  generateToken,
  comparePassword
} from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Wait for storage to be initialized
  await storagePromise;

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        userType: user.userType
      });
      
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType
        },
        token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const userDoc = await storage.getUserByEmail(validatedData.email);
      if (!userDoc) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValidPassword = await comparePassword(validatedData.password, userDoc.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generateToken({
        userId: userDoc._id!.toString(),
        email: userDoc.email,
        userType: userDoc.userType
      });
      
      res.json({
        message: "Login successful",
        user: {
          id: userDoc._id!.toString(),
          username: userDoc.username,
          email: userDoc.email,
          userType: userDoc.userType
        },
        token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Protected route to get current user
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Inventory routes - All roles can view inventory
  app.get("/api/inventory", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/:id", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.get("/api/inventory/vin/:vin", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const item = await storage.getInventoryByVin(req.params.vin);
      if (!item) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to search by VIN" });
    }
  });

  app.post("/api/inventory", authenticateToken, requireManagerOrAdmin, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      
      // Check for duplicate VIN or Stock Number
      const existingVin = await storage.getInventoryByVin(validatedData.vin);
      if (existingVin) {
        return res.status(400).json({ message: "A vehicle with this VIN already exists" });
      }
      
      const existingStock = await storage.getInventoryByStockNumber(validatedData.stockNumber);
      if (existingStock) {
        return res.status(400).json({ message: "A vehicle with this stock number already exists" });
      }

      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", authenticateToken, requireManagerOrAdmin, async (req, res) => {
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      if (error instanceof Error && error.message === "Inventory item not found") {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteInventoryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  app.get("/api/inventory/search/:query", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const results = await storage.searchInventory(req.params.query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Sales routes - All roles can view sales data
  app.get("/api/sales", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const item = await storage.getSalesItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Sales record not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales record" });
    }
  });

  app.post("/api/sales", authenticateToken, requireManagerOrAdmin, async (req, res) => {
    try {
      const validatedData = insertSalesSchema.parse(req.body);
      
      // Verify the stock number exists in inventory
      const inventoryItem = await storage.getInventoryByStockNumber(validatedData.stockNumber);
      if (!inventoryItem) {
        return res.status(400).json({ message: "Stock number not found in inventory" });
      }

      const item = await storage.createSalesItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create sales record" });
    }
  });

  app.put("/api/sales/:id", authenticateToken, requireManagerOrAdmin, async (req, res) => {
    try {
      const validatedData = insertSalesSchema.partial().parse(req.body);
      const item = await storage.updateSalesItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      if (error instanceof Error && error.message === "Sales item not found") {
        return res.status(404).json({ message: "Sales record not found" });
      }
      res.status(500).json({ message: "Failed to update sales record" });
    }
  });

  app.delete("/api/sales/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSalesItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Sales record not found" });
      }
      res.json({ message: "Sales record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sales record" });
    }
  });

  app.get("/api/sales/search/:query", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const results = await storage.searchSales(req.params.query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Dashboard stats - All roles can view stats
  app.get("/api/stats", authenticateToken, requireAnyRole, async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const sales = await storage.getSales();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const salesThisMonth = sales.filter(sale => {
        const saleDate = sale.createdAt ? new Date(sale.createdAt) : new Date();
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      });

      const totalRevenue = salesThisMonth.reduce((sum, sale) => sum + Number(sale.salesPrice), 0);
      
      const avgAge = inventory.length > 0 
        ? inventory.reduce((sum, item) => sum + (item.age || 0), 0) / inventory.length 
        : 0;

      res.json({
        totalInventory: inventory.length,
        salesThisMonth: salesThisMonth.length,
        revenue: totalRevenue,
        avgDaysInLot: Math.round(avgAge),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
