import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stockNumber: text("stock_number").notNull().unique(),
  vin: varchar("vin", { length: 17 }).notNull().unique(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  series: text("series"),
  color: text("color").notNull(),
  certified: boolean("certified").default(false),
  body: text("body").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  bookValue: decimal("book_value", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  markup: decimal("markup", { precision: 10, scale: 2 }),
  odometer: integer("odometer").notNull(),
  age: integer("age"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealNumber: text("deal_number").notNull().unique(),
  customerNumber: text("customer_number"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  zip: text("zip"),
  exteriorColor: text("exterior_color"),
  newUsed: text("new_used").notNull(),
  stockNumber: text("stock_number").notNull(),
  deliveryDate: timestamp("delivery_date"),
  deliveryMileage: integer("delivery_mileage"),
  trade1Vin: varchar("trade1_vin", { length: 17 }),
  trade1Year: integer("trade1_year"),
  trade1Make: text("trade1_make"),
  trade1Model: text("trade1_model"),
  trade1Odometer: integer("trade1_odometer"),
  trade1ACV: decimal("trade1_acv", { precision: 10, scale: 2 }),
  trade2Vin: varchar("trade2_vin", { length: 17 }),
  trade2Year: integer("trade2_year"),
  trade2Make: text("trade2_make"),
  trade2Model: text("trade2_model"),
  trade2Odometer: integer("trade2_odometer"),
  trade2ACV: decimal("trade2_acv", { precision: 10, scale: 2 }),
  closingManagerNumber: text("closing_manager_number"),
  closingManagerName: text("closing_manager_name"),
  financeManagerNumber: text("finance_manager_number"),
  financeManagerName: text("finance_manager_name"),
  salesmanNumber: text("salesman_number"),
  salesmanName: text("salesman_name"),
  msrp: decimal("msrp", { precision: 10, scale: 2 }),
  listPrice: decimal("list_price", { precision: 10, scale: 2 }),
  salesPrice: decimal("sales_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
}).extend({
  year: z.number().min(1900).max(2030),
  vin: z.string().length(17, "VIN must be exactly 17 characters"),
  price: z.number().positive("Price must be positive"),
  odometer: z.number().min(0, "Odometer cannot be negative"),
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
}).extend({
  salesPrice: z.number().positive("Sales price must be positive"),
  trade1Vin: z.string().length(17).optional().or(z.literal("")),
  trade2Vin: z.string().length(17).optional().or(z.literal("")),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertSales = z.infer<typeof insertSalesSchema>;
export type Sales = typeof sales.$inferSelect;
