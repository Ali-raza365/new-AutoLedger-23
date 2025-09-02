import { z } from "zod";
import { ObjectId } from "mongodb";

// User types for authentication
export type UserType = "admin" | "manager" | "employee";

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
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  series?: string;
  color: string;
  certified: boolean;
  body: string;
  price: string;
  bookValue?: string | null;
  cost?: string | null;
  markup?: string | null;
  odometer: number;
  age?: number | null;
  createdAt: Date;
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
  make: string[];
  sources: string[];
  years: number[];
  status: string[];
  model: ModelSeriesType[];
  colors: ColorOptionType[];
  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas for client-side form validation
export const insertInventorySchema = z.object({
  stockNumber: z.string().min(1, "Stock number is required"),
  vin: z.string().length(17, "VIN must be exactly 17 characters"),
  year: z.number().min(1900).max(2030),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  series: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  certified: z.boolean().default(false),
  body: z.string().min(1, "Body type is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  bookValue: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  markup: z.string().optional().nullable(),
  odometer: z.number().min(0, "Odometer cannot be negative"),
  age: z.number().optional().nullable(),
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
  deliveryDate: z.date().optional(),
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
export const modelSeriesSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  Series: z.array(z.string().min(1, "Series name cannot be empty")),
});

export const colorOptionSchema = z.object({
  code: z.string().min(1, "Color code is required"),
  name: z.string().min(1, "Color name is required"),
});

export const insertSettingsSchema = z.object({
  make: z.array(z.string().min(1, "Make cannot be empty")),
  sources: z.array(z.string().min(1, "Source cannot be empty")),
  years: z.array(z.number().min(1900).max(2100)),
  status: z.array(z.string().min(1, "Status cannot be empty")),
  model: z.array(modelSeriesSchema),
  colors: z.array(colorOptionSchema),
});

// Client-facing types (without MongoDB ObjectId)
export interface Inventory {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  series?: string | null;
  color: string;
  certified: boolean;
  body: string;
  price: string;
  bookValue?: string | null;
  cost?: string | null;
  markup?: string | null;
  odometer: number;
  age?: number | null;
  createdAt: Date;
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
  make: string[];
  sources: string[];
  years: number[];
  status: string[];
  model: ModelSeriesType[];
  colors: ColorOptionType[];
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
export type ModelSeriesType = z.infer<typeof modelSeriesSchema>;
export type ColorOptionType = z.infer<typeof colorOptionSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;