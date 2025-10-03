import { z } from "zod";
import { ObjectId } from "mongodb";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

// User types for authentication
export type UserType = "admin" | "manager" | "employee";

// Audit trail entry for tracking changes


// Buyer information for settings
export interface BuyerInfo {
  id: string;
  name: string;
}


// Stock number generation rule types
export type StockNumberRuleType = "none" | "source" | "buyer" | "custom";

// Stock number rule configuration (discriminated union for type safety)
export type StockNumberRule =
  | { type: "none" }
  | { type: "source" }
  | { type: "buyer" }
  | { type: "custom"; customValue: string };

export type UserOptionType = {
  code: string;
  name: string;
  roles: ('sales' | 'closer' | 'manager' | 'finance' | 'source')[];
};

// NHTSA VIN decode result interface
export interface VINDecodeResult {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  bodyClass?: string;
  series?: string;
  error?: string;
  newUsed?: string;
  seriesDetail?: string;
  price?: any;
}

// MongoDB Document interfaces
export interface UserDocument {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  userType: UserType;
  createdAt: Date;
}
export interface InventoryDocument {
  _id?: ObjectId;

  // Basic Vehicle Information
  stockNumber: string;                        // "Stock #"
  vin: string;                                // "VIN"
  year: number;                               // "Year"
  make: string;                               // "Make"
  model: string;                              // "Model"
  series?: string;                            // "Series"
  seriesDetail?: string;                      // "Series Detail"
  color: string;                              // "Color"
  interiorDescription?: string;               // "Interior Description"
  exitStrategy?: string;                      // "Exit Strategy"
  certified: boolean;                         // "Certified"
  body: string;                               // "Body"
  odometer: number;                           // "Odometer"
  newUsed: "New" | "Used";                    // required
  source?: string;                             // "Specific Source"

  // Financial Analysis
  price: number;                              // "Price"
  pendingPrice?: number | null;               // "Pending Price"
  bookValue?: number | null;                  // "Book Value"
  cost?: number | null;                       // "Cost"
  applicableCost?: number | null;             // "Applicable Cost"
  originalCost?: number | null;               // "Original Cost"
  costDifference?: number | null;             // "Cost Difference"
  markup?: number | null;                     // "Markup"
  water?: number | null;                      // "Water"
  applicableWater?: number | null;            // "Applicable Water"

  // Market / Analytics
  overall?: number | null;                    // "Overall"
  marketDaysSupplyLikeMine?: number | null;   // "Market Days Supply Like Mine"
  costToMarketPct?: number | null;            // "% Cost To Market"
  applicableCostToMarketPct?: number | null;  // "Applicable % Cost To Market"
  marketPct?: number | null;                  // "% Mkt"

  // Ranking
  priceRank?: string | null;                  // "Price Rank"
  vRank?: string | null;                      // "vRank"
  priceRankBucket?: string | null;            // "Price Rank Bucket"
  vRankBucket?: string | null;                // "vRank Bucket"

  // Status & Approval
  currentStatus?: string | null;              // ✅ keep
  statusDate?: Date ;                   // ✅ keep

  // Legacy / compatibility
  age?: number | null;                        // "Age"

  // Metadata
  dateLogged: Date;
  createdAt: Date;
}
export type Inventory = Omit<InventoryDocument, "_id"> & {
  id: string;
};



export interface SalesDocument {
  _id?: ObjectId;
  dealNumber: string;
  customerNumber?: string | null;
  firstName: string;
  lastName: string;
  zip?: string | null;
  exteriorColor?: string | null;
  newUsed: string;
  stockNumber: string;
  deliveryDate?: Date | null;
  deliveryMileage?: number | null;
  trade1Vin?: string | null;
  trade1Year?: number | null;
  trade1Make?: string | null;
  trade1Model?: string | null;
  trade1Odometer?: number | null;
  trade1ACV?: string | null;
  trade2Vin?: string | null;
  trade2Year?: number | null;
  trade2Make?: string | null;
  trade2Model?: string | null;
  trade2Odometer?: number | null;
  trade2ACV?: string | null;
  closingManagerNumber?: string | null;
  closingManagerName?: string | null;
  financeManagerNumber?: string | null;
  financeManagerName?: string | null;
  salesmanNumber?: string | null;
  salesmanName?: string | null;
  msrp?: string | null;
  listPrice?: string | null;
  salesPrice: string;
  createdAt: Date;
}

// Settings Document interfaces  
export interface SettingsDocument {
  _id?: ObjectId;
  // Vehicle Configuration  
  sources: string[];
  years: number[];
  status: string[];
  users: UserOptionType[];
  colors: ColorOptionType[];


  // Business Configuration
  rooftopCode?: string;
  hqPriceThreshold?: number;
  minGrossProfit?: number;
  maxReconPercentage?: number;
  buyers?: BuyerInfo[];
  channels?: string[]; // Trade-In, Auction, Private Party, Service Drive, Wholesale

  // Stock Number Generation Rules
  stockNumberPrefixRule: StockNumberRule;
  stockNumberSuffixRule: StockNumberRule;
  stockNumberSequentialCounter: number;


  // Stock Number Generation Rules - Used Vehicles
  usedStockNumberPrefixRule?: StockNumberRule;
  usedStockNumberSuffixRule?: StockNumberRule;
  usedStockNumberSequentialCounter?: number;

  // Stock Number Generation Rules - New Vehicles
  newStockNumberPrefixRule?: StockNumberRule;
  newStockNumberSuffixRule?: StockNumberRule;
  newStockNumberSequentialCounter?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const insertInventorySchema = z.object({
  // Basic Vehicle Information
  stockNumber: z.string().min(1, "Stock number is required"),
  vin: z.string().length(17, "VIN must be exactly 17 characters"),
  year: z.number().min(1900).max(2030),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  series: z.string().optional(),
  seriesDetail: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  interiorDescription: z.string().optional(),
  exitStrategy: z.string().optional(),
  certified: z.boolean().default(false),
  body: z.string().min(1, "Body is required"),
  source: z.string().min(1, "source is required"),

  odometer: z.number().min(0, "Odometer cannot be negative"),
  newUsed: z.enum(["New", "Used"], {
    required_error: "New/Used must be specified",
  }),

  // Financial Analysis
  price: z.number().min(1, "Price is required"),
  pendingPrice: z.number().optional().nullable(),
  bookValue: z.number().optional().nullable(),
  cost: z.number().optional().nullable(),
  applicableCost: z.number().optional().nullable(),
  originalCost: z.number().optional().nullable(),
  costDifference: z.number().optional().nullable(),
  markup: z.number().optional().nullable(),
  water: z.number().optional().nullable(),
  applicableWater: z.number().optional().nullable(),

  // Market / Analytics
  overall: z.number().optional().nullable(),
  marketDaysSupplyLikeMine: z.number().optional().nullable(),
  costToMarketPct: z.number().optional().nullable(),
  applicableCostToMarketPct: z.number().optional().nullable(),
  marketPct: z.number().optional().nullable(),

  // Ranking
  priceRank: z.string().optional().nullable(),
  vRank: z.string().optional().nullable(),
  priceRankBucket: z.string().optional().nullable(),
  vRankBucket: z.string().optional().nullable(),

  // Status & Approval
  currentStatus: z.string().optional().nullable(),
  statusDate: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().nullable(),
  dateLogged: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().default(() => new Date()),

  // Legacy
  age: z.number().optional().nullable(),
});



export const colorOptionSchema = z.object({
  code: z.string().min(1, "Color code is required"),
  name: z.string().min(1, "Color name is required"),
});

export const insertSalesSchema = z.object({
  dealNumber: z.string().min(1, "Deal number is required"),
  customerNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  zip: z.string().optional(),
  exteriorColor: z.string().optional(),
  newUsed: z.string().min(1, "New/Used status is required"),
  stockNumber: z.string().min(1, "Stock number is required"),
  deliveryDate: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().default(() => new Date()),
  deliveryMileage: z.number().optional(),
  trade1Vin: z.string().length(17).optional().or(z.literal("")),
  trade1Year: z.number().optional(),
  trade1Make: z.string().optional(),
  trade1Model: z.string().optional(),
  trade1Odometer: z.number().optional(),
  trade1ACV: z.string().optional().nullable(),
  trade2Vin: z.string().length(17).optional().or(z.literal("")),
  trade2Year: z.number().optional(),
  trade2Make: z.string().optional(),
  trade2Model: z.string().optional(),
  trade2Odometer: z.number().optional(),
  trade2ACV: z.string().optional().nullable(),
  closingManagerNumber: z.string().optional(),
  closingManagerName: z.string().optional(),
  financeManagerNumber: z.string().optional(),
  financeManagerName: z.string().optional(),
  salesmanNumber: z.string().optional(),
  salesmanName: z.string().optional(),
  msrp: z.string().optional().nullable(),
  listPrice: z.string().optional().nullable(),
  salesPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Sales price must be positive"),
});

// Settings validation schemas
export const buyerInfoSchema = z.object({
  id: z.string().min(1, "Buyer ID is required"),
  name: z.string().min(1, "Buyer name is required"),
});

export const userOptionSchema = z.object({
  code: z.string().min(1, "User code is required."),
  name: z.string().min(1, "User name is required."),
  roles: z.array(z.enum(['sales', 'closer', 'manager', 'finance', 'source'])).default([]),
});

export const insertSettingsSchema = z.object({
  // Vehicle Configuration
  sources: z.array(z.string().min(1, "Source cannot be empty")),
  years: z.array(z.number().min(1900).max(2100)),
  status: z.array(z.string().min(1, "Status cannot be empty")),
  users: z.array(userOptionSchema),
  colors: z.array(colorOptionSchema),

  // Business Configuration
  rooftopCode: z.string().nullable().optional(),
  hqPriceThreshold: z.number().min(0).nullable().optional(),
  minGrossProfit: z.number().min(0).nullable().optional(),
  maxReconPercentage: z.number().min(0).max(1).nullable().optional(),

  buyers: z.array(buyerInfoSchema).optional(),
  channels: z.array(z.string().min(1, "Channel cannot be empty")).optional(),


  stockNumberPrefixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  stockNumberSuffixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  stockNumberSequentialCounter: z.number().min(1).optional(),

  // Used Vehicles Stock Number Rules
  usedStockNumberPrefixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  usedStockNumberSuffixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  usedStockNumberSequentialCounter: z.number().min(1).optional(),

  // New Vehicles Stock Number Rules
  newStockNumberPrefixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  newStockNumberSuffixRule: z.object({
    type: z.enum(["none", "source", "buyer", "custom"]),
    customValue: z.string().optional(),
  }).optional(),
  newStockNumberSequentialCounter: z.number().min(1).optional(),
});

// Client-facing types (without MongoDB ObjectId)


export interface Sales {
  id: string;
  dealNumber: string;
  customerNumber?: string | null;
  firstName: string;
  lastName: string;
  zip?: string | null;
  exteriorColor?: string | null;
  newUsed: string;
  stockNumber: string;
  deliveryDate?: Date | null;
  deliveryMileage?: number | null;
  trade1Vin?: string | null;
  trade1Year?: number | null;
  trade1Make?: string | null;
  trade1Model?: string | null;
  trade1Odometer?: number | null;
  trade1ACV?: string | null;
  trade2Vin?: string | null;
  trade2Year?: number | null;
  trade2Make?: string | null;
  trade2Model?: string | null;
  trade2Odometer?: number | null;
  trade2ACV?: string | null;
  closingManagerNumber?: string | null;
  closingManagerName?: string | null;
  financeManagerNumber?: string | null;
  financeManagerName?: string | null;
  salesmanNumber?: string | null;
  salesmanName?: string | null;
  msrp?: string | null;
  listPrice?: string | null;
  salesPrice: string;
  createdAt: Date;
}

/**
 * Color option schema
 * Mirrors Mongoose: { code: string, name: string }
 */
export const insertColorSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .toUpperCase(), // will normalize to uppercase
  name: z.string().trim().min(1, "Name is required"),
});

export type InsertColorInput = z.infer<typeof insertColorSchema>;

/**
 * User schema
 * Mirrors Mongoose: { code: string, name: string, roles: string[] }
 */
export const insertUserSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  roles: z
    .array(z.enum(["sales", "closer", "manager", "finance", "source"]))
    .default([]),
});

export type InsertUserInput = z.infer<typeof insertUserSchema>;

// Client-facing Settings interface
export interface Settings {
  id: string;
  // Vehicle Configuration
  sources: string[];
  years: number[];
  status: string[];
  colors: ColorOptionType[];
  users: any[];

  // Business Configuration
  rooftopCode?: string;
  hqPriceThreshold?: number;
  minGrossProfit?: number;
  maxReconPercentage?: number;
  buyers?: BuyerInfo[];
  channels?: string[];


  // Stock Number Generation Rules - Used Vehicles
  usedStockNumberPrefixRule?: StockNumberRule;
  usedStockNumberSuffixRule?: StockNumberRule;
  usedStockNumberSequentialCounter?: number;

  // Stock Number Generation Rules - New Vehicles
  newStockNumberPrefixRule?: StockNumberRule;
  newStockNumberSuffixRule?: StockNumberRule;
  newStockNumberSequentialCounter?: number;

  // Stock Number Generation Rules (Enhanced) 
  stockNumberPrefixRule?: StockNumberRule;
  stockNumberSuffixRule?: StockNumberRule;
  stockNumberSequentialCounter?: number;

  // Legacy fields for backward compatibility (deprecated)
  stockNumberPrefix?: string;
  stockNumberSuffix?: string;
  stockNumberFormat?: string;

  createdAt: Date;
  updatedAt: Date;
}

// User authentication schemas
export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["admin", "manager", "employee"]),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Client-facing User type (without password)
export interface User {
  id: string;
  username: string;
  email: string;
  userType: UserType;
  createdAt: Date;
}

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  userType: UserType;
}

// Type inference from Zod schemas
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertSales = z.infer<typeof insertSalesSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type ColorOptionType = z.infer<typeof colorOptionSchema>;