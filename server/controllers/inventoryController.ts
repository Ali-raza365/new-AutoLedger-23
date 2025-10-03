import { Request, Response, NextFunction } from "express";
import { Inventory } from "../models";
import { insertInventorySchema, type InsertInventory } from "@shared/schema";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware";
import { NHTSAService } from "../services/nhtsaService";
import { StockNumberService } from "../services/stockNumberService";
import { parseDate, parseInteger, parseNumber } from "server/utils/helper";

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
  if(item.currentStatus === "Sold" ){
    throw new NotFoundError("Vehicle is Sold");
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
  // Basic validation first (without strict required fields)
  const inputData = insertInventorySchema.parse(req.body);

  // Normalize VIN early
  const normalizedVin = inputData.vin.toUpperCase();

  // Check for duplicate VIN
  const existingVin = await Inventory.findOne({ vin: normalizedVin });
  if (existingVin) {
    throw new ConflictError("A vehicle with this VIN already exists");
  }

  // Check for duplicate Stock Number
  const existingStock = await Inventory.findOne({ stockNumber: inputData.stockNumber });
  if (existingStock) {
    throw new ConflictError("A vehicle with this stock number already exists");
  }

  // Auto-populate vehicle details from VIN if not provided
  let finalData = { ...inputData, vin: normalizedVin };

  if (!inputData.make || !inputData.model || !inputData.body) {
    try {
      console.log(`[Create Inventory] Auto-populating vehicle details for VIN: ${normalizedVin}`);
      const vehicleData = await NHTSAService.decodeVIN(normalizedVin, inputData.year);

      // Use NHTSA data to fill missing fields
      finalData = {
        ...finalData,
        make: inputData.make || vehicleData.make,
        model: inputData.model || vehicleData.model,
        year: inputData.year || vehicleData.year || inputData.year,
        trim: inputData.trim || vehicleData.trim,
        series: inputData.series || vehicleData.series,
        body: inputData.body || vehicleData.bodyClass,
        dateLogged: new Date(),
      };

    } catch (error) {
      console.warn(`[Create Inventory] VIN decode failed for ${normalizedVin}:`, error);
      // Continue with original data if VIN decode fails
    }
  }

  // Validate required fields after auto-population
  if (!finalData.make) {
    throw new ValidationError("Make is required. Please ensure VIN is valid or provide the make manually.");
  }
  if (!finalData.model) {
    throw new ValidationError("Model is required. Please ensure VIN is valid or provide the model manually.");
  }
  if (!finalData.body) {
    throw new ValidationError("Body type is required. Please ensure VIN is valid or provide the body type manually.");
  }

const stockNumber = await StockNumberService.generateStockNumber({
    condition: finalData.newUsed,
    sourceCode:finalData.source,
    buyerId: undefined,
  });

  // Create the inventory item
  const item = await Inventory.create({
    ...finalData,
    createdAt: new Date(),
  });

  sendSuccess(res, item, "Inventory item created successfully", 201);
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validatedData = insertInventorySchema.partial().parse(req.body);

  let finalData = { ...validatedData };

  // If VIN is being updated, check for duplicates and auto-populate
  if (validatedData.vin) {
    const existingVin = await Inventory.findOne({
      vin: validatedData.vin.toUpperCase(),
      _id: { $ne: id }
    });
    if (existingVin) {
      throw new ConflictError("A vehicle with this VIN already exists");
    }
    finalData.vin = validatedData.vin.toUpperCase();

    // Auto-populate vehicle details from VIN if updating VIN
    try {
      console.log(`[Update Inventory] Auto-populating vehicle details for VIN: ${validatedData.vin}`);
      const vehicleData = await NHTSAService.decodeVIN(validatedData.vin, validatedData.year);

      // Only update fields that aren't explicitly provided in the update
      if (!validatedData.make && vehicleData.make) finalData.make = vehicleData.make;
      if (!validatedData.model && vehicleData.model) finalData.model = vehicleData.model;
      if (!validatedData.year && vehicleData.year) finalData.year = vehicleData.year;
      // if (!validatedData.trim && vehicleData.trim) finalData.trim = vehicleData.trim;
      if (!validatedData.series && vehicleData.series) finalData.series = vehicleData.series;
      if (!validatedData.body && vehicleData.bodyClass) finalData.body = vehicleData.bodyClass;

      console.log(`[Update Inventory] Auto-populated data:`, {
        make: finalData.make,
        model: finalData.model,
        year: finalData.year,
        // trim: finalData.trim
      });
    } catch (error) {
      console.warn(`[Update Inventory] VIN decode failed for ${validatedData.vin}:`, error);
      // Continue with original data if VIN decode fails
    }
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
    finalData,
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

// VIN Lookup using NHTSA API
export const lookupVinData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { vin } = req.params;

  if (!vin || vin.length !== 17) {
    throw new Error("VIN must be exactly 17 characters");
  }

  try {
    // Get optional model year from query params for better accuracy
    const modelYear = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

    console.log(`[VIN Lookup] Decoding VIN: ${vin}`);

    // Call NHTSA service to decode VIN
    const vehicleData = await NHTSAService.decodeVIN(vin);
    // console.log(vehicleData)
    // Check if vehicle already exists in inventory
    const existingVehicle = await Inventory.findOne({ vin: vin.toUpperCase() });

    const response = {
      vehicleData,
      // existsInInventory: !!existingVehicle,
      // inventoryData: existingVehicle || null
    };

    sendSuccess(res, response, "VIN decoded successfully");
  } catch (error) {
    console.error(`[VIN Lookup] Error decoding VIN ${vin}:`, error);

    // Send user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "Failed to decode VIN";
    throw new Error(errorMessage);
  }
});


export const bulkImportInventory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Request must contain a non-empty array of items to import",
      });
    }

    const results = {
      success: [] as any[],
      failed: [] as { row: number; error: string; data: any }[],
      successCount: 0,
      failedCount: 0,
    };

    const validatedItems: any[] = [];

    // 1️⃣ Normalize keys and validate items
    for (let i = 0; i < items.length; i++) {
      try {
        const itemData = items[i];

        if (!itemData["Stock #"]) {
          throw new Error("Missing Stock # - cannot import without it");
        }

        // Normalize headers: replace line breaks with space and trim
        const normalizedItem: any = {};
        for (const key in itemData) {
          const cleanKey = key.replace(/\r?\n/g, " ").trim();
          normalizedItem[cleanKey] = itemData[key];
        }

        const parsedData: any = {
          stockNumber: normalizedItem["Stock #"],
          vin: normalizedItem.VIN ? normalizedItem.VIN.toUpperCase() : "",
          year: parseInteger(normalizedItem.Year),
          make: normalizedItem.Make || "",
          model: normalizedItem.Model || "",
          series: normalizedItem.Series || undefined,
          seriesDetail: normalizedItem["Series Detail"] || undefined,
          color: normalizedItem.Color || "",
          interiorDescription: normalizedItem["Interior Description"] || undefined,
          exitStrategy: normalizedItem["Exit Strategy"] || undefined,
          body: normalizedItem["Body"] || normalizedItem["Body Style"] || "",
          certified: normalizedItem.Certified
            ? ["yes", "true", "1"].includes(String(normalizedItem.Certified).toLowerCase())
            : false,
          price: parseNumber(normalizedItem.Price) ?? 0,
          pendingPrice: parseNumber(normalizedItem["Pending Price"]),
          bookValue: parseNumber(normalizedItem["Book Value"]),
          cost: parseNumber(normalizedItem.Cost),
          applicableCost: parseNumber(normalizedItem["Applicable Cost"]),
          originalCost: parseNumber(normalizedItem["Original Cost"]),
          costDifference: parseNumber(normalizedItem["Cost Difference"]),
          markup: parseNumber(normalizedItem.Markup),
          water: parseNumber(normalizedItem.Water),
          applicableWater: parseNumber(normalizedItem["Applicable Water"]),
          overall: parseNumber(normalizedItem.Overall),
          marketDaysSupplyLikeMine: parseInteger(normalizedItem["Market Days Supply Like Mine"]),
          costToMarketPct: parseNumber(normalizedItem["% Cost To Market"]),
          applicableCostToMarketPct: parseNumber(normalizedItem["Applicable % Cost To Market"]),
          marketPct: parseNumber(normalizedItem["% Mkt"]),
          priceRank: normalizedItem["Price Rank"] || undefined,
          vRank: normalizedItem["vRank"] || undefined,
          priceRankBucket: normalizedItem["Price Rank Bucket"] || undefined,
          vRankBucket: normalizedItem["vRank Bucket"] || undefined,
          odometer: parseInteger(normalizedItem.Odometer) ?? 0,
          age: parseInteger(normalizedItem.Age),
          newUsed: normalizedItem["New/Used"] || (normalizedItem["vRank"] && normalizedItem["Price Rank"] ? "Used" : "New"),
          currentStatus: normalizedItem["Current Status"] || "Available",
          statusDate: parseDate(normalizedItem["Status Date"]) || new Date(),
          dateLogged: parseDate(normalizedItem["Date Logged"]) || new Date(),
          source: normalizedItem.Source || "",
        };

        const validatedData = insertInventorySchema.parse(parsedData);
        validatedItems.push({ validatedData, row: i + 1, original: itemData });
      } catch (error: any) {
        results.failed.push({
          row: i + 1,
          error: error.message || "Validation error",
          data: items[i],
        });
      }
    }

    if (validatedItems.length === 0) {
      return sendSuccess(res, results, `No valid items to import.`, 400);
    }

    // 2️⃣ Bulk check for duplicates
    const vins = validatedItems.map(i => i.validatedData.vin.toUpperCase());
    const stockNumbers = validatedItems.map(i => i.validatedData.stockNumber);

    const existingItems = await Inventory.find({
      $or: [{ vin: { $in: vins } }, { stockNumber: { $in: stockNumbers } }],
    }).lean();

    const existingVins = new Set(existingItems.map(i => i.vin.toUpperCase()));
    const existingStocks = new Set(existingItems.map(i => i.stockNumber));

    const itemsToInsert = validatedItems
      .filter(item => {
        if (existingVins.has(item.validatedData.vin)) {
          results.failed.push({
            row: item.row,
            error: `Vehicle with VIN ${item.validatedData.vin} already exists`,
            data: item.original,
          });
          return false;
        }
        if (existingStocks.has(item.validatedData.stockNumber)) {
          results.failed.push({
            row: item.row,
            error: `Stock # ${item.validatedData.stockNumber} already exists`,
            data: item.original,
          });
          return false;
        }
        return true;
      })
      .map(i => ({
        ...i.validatedData,
        vin: i.validatedData.vin.toUpperCase(),
        createdAt: new Date(),
      }));

    // 3️⃣ Bulk insert
    if (itemsToInsert.length > 0) {
      const inserted = await Inventory.insertMany(itemsToInsert, { ordered: false });
      results.success.push(...inserted);
      results.successCount = inserted.length;
    }

    results.failedCount = results.failed.length;
    console.log(results)
    sendSuccess(
      res,
      results,
      `Imported ${results.successCount} items successfully, ${results.failedCount} failed`,
      201
    );
  }
);
