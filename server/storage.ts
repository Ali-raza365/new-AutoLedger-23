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
    this.initializeDummyData();
  }

  private initializeDummyData() {
    // Add dummy inventory data
    const dummyInventory = [
      {
        id: randomUUID(),
        stockNumber: "A2024001",
        vin: "1HGBH41JXMN109186",
        year: 2023,
        make: "Honda",
        model: "Accord",
        series: "LX",
        color: "Silver Metallic",
        certified: "Yes",
        body: "Sedan",
        price: "28450",
        bookValue: "26500",
        cost: "24000",
        markup: "4450",
        odometer: 15420,
        age: 45,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        stockNumber: "B2024002",
        vin: "3GNKBKRS5NS123456",
        year: 2022,
        make: "Chevrolet",
        model: "Equinox",
        series: "LS",
        color: "Pearl White",
        certified: "No",
        body: "SUV",
        price: "32995",
        bookValue: "30200",
        cost: "28500",
        markup: "4495",
        odometer: 28750,
        age: 32,
        createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        stockNumber: "C2024003",
        vin: "1FA6P8TH5N5123789",
        year: 2024,
        make: "Ford",
        model: "Mustang",
        series: "GT",
        color: "Racing Red",
        certified: "Yes",
        body: "Coupe",
        price: "45750",
        bookValue: "43200",
        cost: "39800",
        markup: "5950",
        odometer: 2850,
        age: 18,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        stockNumber: "D2024004",
        vin: "JM1CX1GL5N0456123",
        year: 2023,
        make: "Mazda",
        model: "CX-5",
        series: "Touring",
        color: "Deep Crystal Blue",
        certified: "Yes",
        body: "SUV",
        price: "34200",
        bookValue: "32100",
        cost: "29500",
        markup: "4700",
        odometer: 12340,
        age: 28,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        stockNumber: "E2024005",
        vin: "5YFBURHE5NP789456",
        year: 2022,
        make: "Toyota",
        model: "Camry",
        series: "XLE",
        color: "Midnight Black",
        certified: "No",
        body: "Sedan",
        price: "29850",
        bookValue: "27900",
        cost: "25200",
        markup: "4650",
        odometer: 22100,
        age: 52,
        createdAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000)
      }
    ];

    // Add dummy sales data
    const dummySales = [
      {
        id: randomUUID(),
        dealNumber: "D2024-001",
        customerNumber: "C001",
        firstName: "John",
        lastName: "Smith",
        zip: "12345",
        exteriorColor: "Silver Metallic",
        newUsed: "Used",
        stockNumber: "A2024001",
        deliveryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        deliveryMileage: 15420,
        trade1Vin: "2HGFC2F59MH987654",
        trade1Year: 2021,
        trade1Make: "Honda",
        trade1Model: "Civic",
        trade1Odometer: 45000,
        trade1ACV: "18500",
        trade2Vin: null,
        trade2Year: null,
        trade2Make: null,
        trade2Model: null,
        trade2Odometer: null,
        trade2ACV: null,
        closingManagerNumber: "M001",
        closingManagerName: "Sarah Johnson",
        financeManagerNumber: "F001",
        financeManagerName: "Mike Davis",
        salesmanNumber: "S001",
        salesmanName: "Robert Wilson",
        msrp: "29500",
        listPrice: "28450",
        salesPrice: "27200",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        dealNumber: "D2024-002",
        customerNumber: "C002",
        firstName: "Emily",
        lastName: "Johnson",
        zip: "54321",
        exteriorColor: "Pearl White",
        newUsed: "Used",
        stockNumber: "B2024002",
        deliveryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        deliveryMileage: 28750,
        trade1Vin: null,
        trade1Year: null,
        trade1Make: null,
        trade1Model: null,
        trade1Odometer: null,
        trade1ACV: null,
        trade2Vin: null,
        trade2Year: null,
        trade2Make: null,
        trade2Model: null,
        trade2Odometer: null,
        trade2ACV: null,
        closingManagerNumber: "M002",
        closingManagerName: "Lisa Chen",
        financeManagerNumber: "F002",
        financeManagerName: "James Brown",
        salesmanNumber: "S002",
        salesmanName: "Amanda Garcia",
        msrp: "34200",
        listPrice: "32995",
        salesPrice: "31800",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        dealNumber: "D2024-003",
        customerNumber: "C003",
        firstName: "Michael",
        lastName: "Brown",
        zip: "67890",
        exteriorColor: "Racing Red",
        newUsed: "New",
        stockNumber: "C2024003",
        deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deliveryMileage: 2850,
        trade1Vin: "1G6KD57Y85U456789",
        trade1Year: 2019,
        trade1Make: "Cadillac",
        trade1Model: "CTS",
        trade1Odometer: 62000,
        trade1ACV: "22500",
        trade2Vin: null,
        trade2Year: null,
        trade2Make: null,
        trade2Model: null,
        trade2Odometer: null,
        trade2ACV: null,
        closingManagerNumber: "M001",
        closingManagerName: "Sarah Johnson",
        financeManagerNumber: "F001",
        financeManagerName: "Mike Davis",
        salesmanNumber: "S003",
        salesmanName: "David Martinez",
        msrp: "47500",
        listPrice: "45750",
        salesPrice: "44200",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    // Add to maps
    dummyInventory.forEach(item => {
      this.inventory.set(item.id, item as Inventory);
    });

    dummySales.forEach(item => {
      this.sales.set(item.id, item as Sales);
    });
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
