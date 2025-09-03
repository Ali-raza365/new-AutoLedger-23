import { Request, Response, NextFunction } from "express";
import { Settings } from "../models";
import { insertSettingsSchema, type InsertSettings } from "@shared/schema";
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