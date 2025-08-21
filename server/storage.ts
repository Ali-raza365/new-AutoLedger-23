import { type Inventory, type InsertInventory, type Sales, type InsertSales } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Inventory methods
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  getInventoryByVin(vin: string): Promise<Inventory | undefined>;
  getInventoryByStockNumber(stockNumber: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: string): Promise<boolean>;

  // Sales methods
  getSales(): Promise<Sales[]>;
  getSalesItem(id: string): Promise<Sales | undefined>;
  createSalesItem(item: InsertSales): Promise<Sales>;
  updateSalesItem(id: string, item: Partial<InsertSales>): Promise<Sales>;
  deleteSalesItem(id: string): Promise<boolean>;

  // Search methods
  searchInventory(query: string): Promise<Inventory[]>;
  searchSales(query: string): Promise<Sales[]>;
}

export class MemStorage implements IStorage {
  private inventory: Map<string, Inventory>;
  private sales: Map<string, Sales>;

  constructor() {
    this.inventory = new Map();
    this.sales = new Map();
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async getInventoryByVin(vin: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(item => item.vin === vin);
  }

  async getInventoryByStockNumber(stockNumber: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(item => item.stockNumber === stockNumber);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const item: Inventory = {
      ...insertItem,
      id,
      createdAt: new Date(),
      markup: insertItem.price && insertItem.cost 
        ? String(Number(insertItem.price) - Number(insertItem.cost))
        : insertItem.markup || null
    };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: string, updateData: Partial<InsertInventory>): Promise<Inventory> {
    const existing = this.inventory.get(id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }

    const updated: Inventory = {
      ...existing,
      ...updateData,
      markup: updateData.price && updateData.cost 
        ? String(Number(updateData.price) - Number(updateData.cost))
        : updateData.markup || existing.markup
    };
    
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Sales methods
  async getSales(): Promise<Sales[]> {
    return Array.from(this.sales.values());
  }

  async getSalesItem(id: string): Promise<Sales | undefined> {
    return this.sales.get(id);
  }

  async createSalesItem(insertItem: InsertSales): Promise<Sales> {
    const id = randomUUID();
    const item: Sales = {
      ...insertItem,
      customerNumber: insertItem.customerNumber || null,
      id,
      createdAt: new Date(),
    };
    this.sales.set(id, item);
    return item;
  }

  async updateSalesItem(id: string, updateData: Partial<InsertSales>): Promise<Sales> {
    const existing = this.sales.get(id);
    if (!existing) {
      throw new Error("Sales item not found");
    }

    const updated: Sales = { ...existing, ...updateData };
    this.sales.set(id, updated);
    return updated;
  }

  async deleteSalesItem(id: string): Promise<boolean> {
    return this.sales.delete(id);
  }

  // Search methods
  async searchInventory(query: string): Promise<Inventory[]> {
    const items = Array.from(this.inventory.values());
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => 
      item.vin.toLowerCase().includes(lowerQuery) ||
      item.make.toLowerCase().includes(lowerQuery) ||
      item.model.toLowerCase().includes(lowerQuery) ||
      item.stockNumber.toLowerCase().includes(lowerQuery) ||
      item.color.toLowerCase().includes(lowerQuery)
    );
  }

  async searchSales(query: string): Promise<Sales[]> {
    const items = Array.from(this.sales.values());
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => 
      item.dealNumber.toLowerCase().includes(lowerQuery) ||
      item.firstName.toLowerCase().includes(lowerQuery) ||
      item.lastName.toLowerCase().includes(lowerQuery) ||
      item.customerNumber?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
