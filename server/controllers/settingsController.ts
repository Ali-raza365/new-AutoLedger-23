import { Request, Response, NextFunction } from "express";
import { Settings } from "../models";
import { insertColorSchema, insertSettingsSchema, insertUserSchema, type InsertSettings } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware";

export const getSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let settings = await Settings.findOne({});
  
  if (!settings) {
    // Return default empty settings structure if no settings exist
    const defaultSettings = {
      id: "",
      make: [],
      sources: [],
      years: [],
      status: [],
      model: [],
      colors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    sendSuccess(res, defaultSettings, "Default settings retrieved");
    return;
  }
  
  sendSuccess(res, settings, "Settings retrieved successfully");
});

export const updateSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData: InsertSettings = insertSettingsSchema.parse(req.body);
  
  // Try to update existing settings or create new ones
  let settings = await Settings.findOne({});
  
  if (settings) {
    // Update existing settings
    Object.assign(settings, validatedData);
    settings.updatedAt = new Date();
    await settings.save();
  } else {
    // Create new settings
    settings = await Settings.create({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  sendSuccess(res, settings, "Settings updated successfully");
});

export const resetSettings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Delete all settings
  await Settings.deleteMany({});
  
  // Create default settings
  const defaultSettings = await Settings.create({
    make: ["Ford", "Toyota", "Honda", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Volkswagen", "Subaru", "Mazda", "Lexus", "Acura", "Infiniti", "Cadillac", "Lincoln", "Buick", "GMC", "Ram", "Jeep", "Dodge", "Chrysler"],
    sources: ["Kelley Blue Book", "Direct Purchase", "Trade-In", "Lease Buyout", "Auction", "Fleet Sale", "Wholesale", "Consignment"],
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    status: ["Available", "In Stock", "Sold", "Reserved", "In Transit", "Received", "Pending Inspection", "Dealer Trade", "Service Required", "Demo Vehicle", "Wholesale", "Auction", "On Hold", "Recall"],
    model: [
      {
        name: "Bronco",
        Series: ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak", "Raptor"]
      },
      {
        name: "Bronco Sport",
        Series: ["Base", "Big Bend", "Outer Banks", "Badlands"]
      },
      {
        name: "F-150",
        Series: ["Regular Cab", "SuperCab", "SuperCrew", "XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor", "Lightning"]
      },
      {
        name: "Mustang",
        Series: ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Mach 1", "Shelby GT350", "Shelby GT500"]
      },
      {
        name: "Explorer",
        Series: ["Base", "XLT", "Limited", "Platinum", "ST", "King Ranch"]
      },
      {
        name: "Escape",
        Series: ["S", "SE", "SEL", "Titanium"]
      },
      {
        name: "Edge",
        Series: ["SE", "SEL", "Titanium", "ST"]
      }
    ],
    colors: [
      {code: "PUM", name: "Agate Black"},
      {code: "PDR", name: "Avalanche"},
      {code: "PYZ", name: "Oxford White"},
      {code: "PAZ", name: "Star White"},
      {code: "PA3", name: "Space White"},
      {code: "PG1", name: "Shadow Black"},
      {code: "PHY", name: "Dark Matter"},
      {code: "PM7", name: "Carbonized Gray"},
      {code: "PUJ", name: "Sterling Gray"},
      {code: "PJS", name: "Iconic Silver"},
      {code: "PTN", name: "Silver Gray"},
      {code: "PNE", name: "Fighter Jet Gray"},
      {code: "PAE", name: "Grabber Blue"},
      {code: "PK1", name: "Vapor Blue"},
      {code: "PAB", name: "Blue Tinted Clearcoat"},
      {code: "PE7", name: "Velocity Blue"},
      {code: "PLK", name: "Dark Blue"},
      {code: "PL8", name: "Cinnabar Red"},
      {code: "PD4", name: "Rapid Red Metallic"},
      {code: "PPQ", name: "Race Red"},
      {code: "PCN", name: "Code Orange"},
      {code: "PSB", name: "Cyber Orange"}
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  sendSuccess(res, defaultSettings, "Settings reset to defaults successfully");
});

export const importSettings = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "Request must contain a non-empty array of data" });
  }

  const results = {
    success: [] as any[],
    failed: [] as { row: number; error: string; data: any }[],
    successCount: 0,
    failedCount: 0,
  };

  // Load or create settings doc
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  let currentList: any[] = (settings as any)[type] || [];

  switch (type) {
    case "colors": {
      for (let i = 0; i < data.length; i++) {
        try {
          const parsed = insertColorSchema.parse(data[i]); // { code, name }
          const exists = currentList.some(
            (c: any) => c.code.toLowerCase() === parsed.code.toLowerCase()
          );
          if (exists) {
            results.failed.push({
              row: i + 1,
              error: `Color with code '${parsed.code}' already exists`,
              data: data[i],
            });
            continue;
          }
          currentList.push(parsed);
          results.success.push(parsed);
        } catch (err: any) {
          results.failed.push({ row: i + 1, error: err.message, data: data[i] });
        }
      }
      settings.colors = currentList;
      break;
    }

case "users": {
  for (let i = 0; i < data.length; i++) {
    try {
      const row = {
        ...data[i],
        roles: typeof data[i].roles === "string"
          ? data[i].roles.split(",").map((r: string) => r.trim())
          : [],
      };

      const parsed = insertUserSchema.parse(row); // validate
      const exists = currentList.some(
        (u: any) => u.code.toLowerCase() === parsed.code.toLowerCase()
      );

      if (exists) {
        results.failed.push({
          row: i + 1,
          error: `User with code '${parsed.code}' already exists`,
          data: data[i],
        });
        continue;
      }

      currentList.push(parsed);
      results.success.push(parsed);
    } catch (err: any) {
      results.failed.push({ row: i + 1, error: err.message, data: data[i] });
    }
  }
  console.log(currentList);
  settings.users = currentList;
  break;
}


    case "sources":
    case "lenders":
    case "status": {
      for (let i = 0; i < data.length; i++) {
        const val = typeof data[i] === "string" ? data[i].trim() : "";
        if (!val) {
          results.failed.push({ row: i + 1, error: "Invalid value", data: data[i] });
          continue;
        }
        const exists = currentList.some((s: string) => s.toLowerCase() === val.toLowerCase());
        if (exists) {
          results.failed.push({
            row: i + 1,
            error: `${type.slice(0, -1)} '${val}' already exists`,
            data: data[i],
          });
          continue;
        }
        currentList.push(val);
        results.success.push(val);
      }
      (settings as any)[type] = currentList;
      break;
    }

    default:
      return res.status(400).json({ message: `Unsupported import type: ${type}` });
  }

  results.successCount = results.success.length;
  results.failedCount = results.failed.length;

  settings.updatedAt = new Date();
  await settings.save();

  return sendSuccess(
    res,
    results,
    `Imported ${results.successCount} ${type} successfully, ${results.failedCount} failed`,
    201
  );
});