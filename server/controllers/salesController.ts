import { Request, Response, NextFunction } from "express";
import { Sales, Inventory } from "../models";
import { insertSalesSchema, type InsertSales } from "@shared/schema";
import { NotFoundError, ValidationError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware";

export const getAllSales = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const sales = await Sales.find({}).sort({ createdAt: -1 });
  
  sendSuccess(res, sales, "Sales retrieved successfully");
});

export const getSalesById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const sale = await Sales.findById(id);
  if (!sale) {
    throw new NotFoundError("Sales record not found");
  }
  
  sendSuccess(res, sale, "Sales record retrieved successfully");
});

export const createSalesItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData: InsertSales = insertSalesSchema.parse(req.body);
  
  // Verify the stock number exists in inventory
  const inventoryItem = await Inventory.findOne({ stockNumber: validatedData.stockNumber });
  if (!inventoryItem) {
    throw new ValidationError("Stock number not found in inventory");
  }

  console.log(validatedData)

  // Create the sales record first
  const sale = await Sales.create({
    ...validatedData,
    createdAt: new Date(),
  });

  // ✅ After sale is created, update inventory status
  const updatedInventory = await Inventory.findOneAndUpdate(
    { stockNumber: validatedData.stockNumber },
    {
      $set: {
        currentStatus: "Sold",   // or "Delivered" / "Pending" depending on your flow
        statusDate: new Date(),
      }
    },
    { new: true } // return updated document
  );

  // send both sale + updated inventory in response if you like
  sendSuccess(res, { sale, updatedInventory }, "Sales record created successfully", 201);
});


export const updateSalesItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validatedData = insertSalesSchema.partial().parse(req.body);
  
  // If stock number is being updated, verify it exists in inventory
  if (validatedData.stockNumber) {
    const inventoryItem = await Inventory.findOne({ stockNumber: validatedData.stockNumber });
    if (!inventoryItem) {
      throw new ValidationError("Stock number not found in inventory");
    }
  }
  
  const sale = await Sales.findByIdAndUpdate(
    id,
    validatedData,
    { new: true, runValidators: true }
  );
  
  if (!sale) {
    throw new NotFoundError("Sales record not found");
  }
  
  sendSuccess(res, sale, "Sales record updated successfully");
});

export const deleteSalesItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const sale = await Sales.findByIdAndDelete(id);
  if (!sale) {
    throw new NotFoundError("Sales record not found");
  }
  
  sendSuccess(res, null, "Sales record deleted successfully");
});

export const searchSales = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.params;
  
  const searchResults = await Sales.find({
    $or: [
      { dealNumber: { $regex: query, $options: "i" } },
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { customerNumber: { $regex: query, $options: "i" } },
      { stockNumber: { $regex: query, $options: "i" } },
    ]
  }).sort({ createdAt: -1 });
  
  sendSuccess(res, searchResults, `Found ${searchResults.length} matching sales records`);
});

export const getSalesStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Get sales this month
  const salesThisMonth = await Sales.find({
    createdAt: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lt: new Date(currentYear, currentMonth + 1, 1)
    }
  });

  // Calculate total revenue this month
  const totalRevenue = salesThisMonth.reduce((sum, sale) => {
    return sum + Number(sale.salesPrice);
  }, 0);

  // Get inventory stats
  const totalInventory = await Inventory.countDocuments();
  
  // Calculate average age of inventory
  const inventoryItems = await Inventory.find({}, { age: 1 });
  const avgAge = inventoryItems.length > 0 
    ? inventoryItems.reduce((sum, item) => sum + (item.age || 0), 0) / inventoryItems.length 
    : 0;

  sendSuccess(res, {
    totalInventory,
    salesThisMonth: salesThisMonth.length,
    revenue: totalRevenue,
    avgDaysInLot: Math.round(avgAge),
  }, "Statistics retrieved successfully");
});