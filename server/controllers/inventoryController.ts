import { Request, Response, NextFunction } from "express";
import { Inventory } from "../models";
import { insertInventorySchema, type InsertInventory } from "@shared/schema";
import { NotFoundError, ConflictError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware";

export const getAllInventory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const inventory = await Inventory.find({}).sort({ createdAt: -1 });
  
  sendSuccess(res, inventory, "Inventory retrieved successfully");
});

export const getInventoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const item = await Inventory.findById(id);
  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }
  
  sendSuccess(res, item, "Inventory item retrieved successfully");
});

export const getInventoryByVin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { vin } = req.params;
  
  const item = await Inventory.findOne({ vin: vin.toUpperCase() });
  if (!item) {
    throw new NotFoundError("Vehicle not found");
  }
  
  sendSuccess(res, item, "Vehicle retrieved successfully");
});

export const getInventoryByStockNumber = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { stockNumber } = req.params;
  
  const item = await Inventory.findOne({ stockNumber });
  if (!item) {
    throw new NotFoundError("Vehicle not found");
  }
  
  sendSuccess(res, item, "Vehicle retrieved successfully");
});

export const createInventoryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData: InsertInventory = insertInventorySchema.parse(req.body);
  
  // Check for duplicate VIN
  const existingVin = await Inventory.findOne({ vin: validatedData.vin.toUpperCase() });
  if (existingVin) {
    throw new ConflictError("A vehicle with this VIN already exists");
  }
  
  // Check for duplicate Stock Number
  const existingStock = await Inventory.findOne({ stockNumber: validatedData.stockNumber });
  if (existingStock) {
    throw new ConflictError("A vehicle with this stock number already exists");
  }
  
  // Create the inventory item
  const item = await Inventory.create({
    ...validatedData,
    vin: validatedData.vin.toUpperCase(), // Ensure VIN is uppercase
    createdAt: new Date(),
  });
  
  sendSuccess(res, item, "Inventory item created successfully", 201);
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validatedData = insertInventorySchema.partial().parse(req.body);
  
  // If VIN is being updated, check for duplicates
  if (validatedData.vin) {
    const existingVin = await Inventory.findOne({ 
      vin: validatedData.vin.toUpperCase(),
      _id: { $ne: id }
    });
    if (existingVin) {
      throw new ConflictError("A vehicle with this VIN already exists");
    }
    validatedData.vin = validatedData.vin.toUpperCase();
  }
  
  // If stock number is being updated, check for duplicates
  if (validatedData.stockNumber) {
    const existingStock = await Inventory.findOne({ 
      stockNumber: validatedData.stockNumber,
      _id: { $ne: id }
    });
    if (existingStock) {
      throw new ConflictError("A vehicle with this stock number already exists");
    }
  }
  
  const item = await Inventory.findByIdAndUpdate(
    id,
    validatedData,
    { new: true, runValidators: true }
  );
  
  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }
  
  sendSuccess(res, item, "Inventory item updated successfully");
});

export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const item = await Inventory.findByIdAndDelete(id);
  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }
  
  sendSuccess(res, null, "Inventory item deleted successfully");
});

export const searchInventory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.params;
  
  // Use MongoDB text search if available, otherwise use regex
  const searchResults = await Inventory.find({
    $or: [
      { vin: { $regex: query, $options: "i" } },
      { make: { $regex: query, $options: "i" } },
      { model: { $regex: query, $options: "i" } },
      { stockNumber: { $regex: query, $options: "i" } },
      { color: { $regex: query, $options: "i" } },
      { series: { $regex: query, $options: "i" } },
    ]
  }).sort({ createdAt: -1 });
  
  sendSuccess(res, searchResults, `Found ${searchResults.length} matching vehicles`);
});