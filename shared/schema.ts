import { z } from "zod";
import { ObjectId } from "mongodb";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

// User types for authentication
export type UserType = "admin" | "manager" | "employee";

// Audit trail entry for tracking changes
export interface AuditTrailEntry {
  user: string;
  action: string;
  timestamp: Date;
}

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
  stockNumber: string;
  dateLogged: Date;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  series?: string;
  color: string;
  certified: boolean;
  body: string;
  odometer: number;
  newUsed: string;

  // Purchase Information
  purchaseDate?: Date | null;
  channel?: string | null; // Trade-In, Auction, Private Party, Service Drive, Wholesale
  specificSource?: string | null;
  buyerName?: string | null;
  buyerId?: string | null;
  storeLocation?: string | null;
  purchasePrice?: string | null;
  customerName?: string | null;
  dealNumber?: string | null;

  // Financial Analysis
  price: number; // Current listing price
  bookValue?: number | null;
  cost?: number | null;
  markup?: number | null;
  mmrValue?: string | null;
  kbbWholesale?: string | null;
  marketVariance?: string | null;
  plannedRetail?: string | null;
  estReconCost?: string | null;
  projectedGross?: string | null;

  // Status & Approval
  hqAppraisalSuggested?: boolean;
  redFlagStatus?: string | null;
  currentStatus?: string | null;
  statusDate?: Date | null;

  // Legacy fields for backward compatibility
  age?: number | null;
  createdAt: Date;

  // Audit Trail
  auditTrail?: AuditTrailEntry[];
}

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

  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas for client-side form validation
export const insertInventorySchema = z.object({
  // Basic Vehicle Information
  stockNumber: z.string().min(1, "Stock number is required"),
  dateLogged: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().default(() => new Date()),

  vin: z.string().length(17, "VIN must be exactly 17 characters"),
  year: z.number().min(1900).max(2030).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  newUsed: z.string().optional(),
  trim: z.string().optional(),
  series: z.string().optional(),
  color: z.string().optional(),
  certified: z.boolean().default(false),
  body: z.string().optional(),
  odometer: z.number().min(0, "Odometer cannot be negative"),

  // Purchase Information
  purchaseDate: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().default(() => new Date()),
  channel: z.string().optional().nullable(),
  specificSource: z.string().optional().nullable(),
  buyerName: z.string().optional().nullable(),
  buyerId: z.string().optional().nullable(),
  storeLocation: z.string().optional().nullable(),
  purchasePrice: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  dealNumber: z.string().optional().nullable(),

  // Financial Analysis
  price: z.number().min(0, "Price must be a positive number"),
  bookValue: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  markup: z.number().optional().nullable(),
  mmrValue: z.string().optional().nullable(),
  kbbWholesale: z.string().optional().nullable(),
  marketVariance: z.string().optional().nullable(),
  plannedRetail: z.string().optional().nullable(),
  estReconCost: z.string().optional().nullable(),
  projectedGross: z.string().optional().nullable(),

  // Status & Approval
  hqAppraisalSuggested: z.boolean().optional().default(false),
  redFlagStatus: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
  statusDate: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()).optional().default(() => new Date()),

  // Legacy fields for backward compatibility
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
});

// Client-facing types (without MongoDB ObjectId)
export interface Inventory {
  id: string;
  // Basic Vehicle Information
  stockNumber: string;
  dateLogged: Date;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  series?: string | null;
  color: string;
  certified: boolean;
  body: string;
  odometer: number;
  newUsed: string;

  // Purchase Information
  purchaseDate?: Date | null;
  channel?: string | null;
  specificSource?: string | null;
  buyerName?: string | null;
  buyerId?: string | null;
  storeLocation?: string | null;
  purchasePrice?: string | null;
  customerName?: string | null;
  dealNumber?: string | null;

  // Financial Analysis
  price: number;
  bookValue?: number | null;
  cost?: number | null;
  markup?: number | null;
  mmrValue?: string | null;
  kbbWholesale?: string | null;
  marketVariance?: string | null;
  plannedRetail?: string | null;
  estReconCost?: string | null;
  projectedGross?: string | null;

  // Status & Approval
  hqAppraisalSuggested?: boolean;
  redFlagStatus?: string | null;
  currentStatus?: string | null;
  statusDate?: Date | null;

  // Legacy fields for backward compatibility
  age?: number | null;
  createdAt: Date;

  // Audit Trail
  auditTrail?: AuditTrailEntry[];
}

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

// Client-facing Settings interface
export interface Settings {
  id: string;
  // Vehicle Configuration
  sources: string[];
  years: number[];
  status: string[];
  colors: ColorOptionType[];

  // Business Configuration
  rooftopCode?: string;
  hqPriceThreshold?: number;
  minGrossProfit?: number;
  maxReconPercentage?: number;
  buyers?: BuyerInfo[];
  channels?: string[];

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