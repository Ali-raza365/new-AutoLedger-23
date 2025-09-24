import { ObjectId, MongoClient, Db, Collection } from "mongodb";
import { 
  type Inventory, 
  type InsertInventory, 
  type Sales, 
  type InsertSales,
  type InventoryDocument,
  type SalesDocument,
  type User,
  type RegisterUser,
  type UserDocument,
  type Settings,
  type InsertSettings,
  type SettingsDocument
} from "@shared/schema";
import { env } from "./config/env";

export interface IStorage {
  // User methods
  createUser(user: RegisterUser): Promise<User>;
  getUserByEmail(email: string): Promise<UserDocument | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  
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

  // Settings methods
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  // Search methods
  searchInventory(query: string): Promise<Inventory[]>;
  searchSales(query: string): Promise<Sales[]>;
}

class MongoDBCompatibleStorage implements IStorage {
  private inventory: Map<string, InventoryDocument>;
  private sales: Map<string, SalesDocument>;
  private users: Map<string, UserDocument>;
  private settings: SettingsDocument | null;

  constructor() {
    this.inventory = new Map();
    this.sales = new Map();
    this.users = new Map();
    this.settings = null;
    this.initializeDummyData();
    this.initializeDefaultUsers();
    this.initializeDefaultSettings();
  }

  private initializeDummyData() {
    // Add dummy inventory data
    const dummyInventory: InventoryDocument[] = [
      {
        _id: new ObjectId(),
        stockNumber: "A2024001",
        vin: "1HGBH41JXMN109186",
        year: 2023,
        make: "Honda",
        model: "Accord",
        series: "LX",
        color: "Silver Metallic",
        certified: true,
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
        _id: new ObjectId(),
        stockNumber: "B2024002",
        vin: "3GNKBKRS5NS123456",
        year: 2022,
        make: "Chevrolet",
        model: "Equinox",
        series: "LS",
        color: "Pearl White",
        certified: false,
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
        _id: new ObjectId(),
        stockNumber: "C2024003",
        vin: "1FA6P8TH5N5123789",
        year: 2024,
        make: "Ford",
        model: "Mustang",
        series: "GT",
        color: "Racing Red",
        certified: true,
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
        _id: new ObjectId(),
        stockNumber: "D2024004",
        vin: "JM1CX1GL5N0456123",
        year: 2023,
        make: "Mazda",
        model: "CX-5",
        series: "Touring",
        color: "Deep Crystal Blue",
        certified: true,
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
        _id: new ObjectId(),
        stockNumber: "E2024005",
        vin: "5YFBURHE5NP789456",
        year: 2022,
        make: "Toyota",
        model: "Camry",
        series: "XLE",
        color: "Midnight Black",
        certified: false,
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
    const dummySales: SalesDocument[] = [
      {
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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
        _id: new ObjectId(),
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

    // Add to maps using ObjectId as string key
    dummyInventory.forEach(item => {
      this.inventory.set(item._id!.toString(), item);
    });

    dummySales.forEach(item => {
      this.sales.set(item._id!.toString(), item);
    });
  }

  private async initializeDefaultUsers() {
    // Create default admin user (password will be hashed in production)
    const { hashPassword } = await import("./middleware/auth");
    
    const defaultUsers: UserDocument[] = [
      {
        _id: new ObjectId(),
        username: "admin",
        email: "admin@dealerpro.com",
        password: await hashPassword("admin123"),
        userType: "admin",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        username: "manager1",
        email: "manager@dealerpro.com", 
        password: await hashPassword("manager123"),
        userType: "manager",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        username: "employee1",
        email: "employee@dealerpro.com",
        password: await hashPassword("employee123"),
        userType: "employee",
        createdAt: new Date()
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user._id!.toString(), user);
    });
  }

  private documentToInventory(doc: InventoryDocument): Inventory {
    return {
      id: doc._id!.toString(),
      stockNumber: doc.stockNumber,
      vin: doc.vin,
      year: doc.year,
      make: doc.make,
      model: doc.model,
      series: doc.series,
      color: doc.color,
      certified: doc.certified,
      body: doc.body,
      price: doc.price,
      bookValue: doc.bookValue,
      cost: doc.cost,
      markup: doc.markup,
      odometer: doc.odometer,
      age: doc.age,
      createdAt: doc.createdAt
    };
  }

  private documentToSales(doc: SalesDocument): Sales {
    return {
      id: doc._id!.toString(),
      dealNumber: doc.dealNumber,
      customerNumber: doc.customerNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      zip: doc.zip,
      exteriorColor: doc.exteriorColor,
      newUsed: doc.newUsed,
      stockNumber: doc.stockNumber,
      deliveryDate: doc.deliveryDate,
      deliveryMileage: doc.deliveryMileage,
      trade1Vin: doc.trade1Vin,
      trade1Year: doc.trade1Year,
      trade1Make: doc.trade1Make,
      trade1Model: doc.trade1Model,
      trade1Odometer: doc.trade1Odometer,
      trade1ACV: doc.trade1ACV,
      trade2Vin: doc.trade2Vin,
      trade2Year: doc.trade2Year,
      trade2Make: doc.trade2Make,
      trade2Model: doc.trade2Model,
      trade2Odometer: doc.trade2Odometer,
      trade2ACV: doc.trade2ACV,
      closingManagerNumber: doc.closingManagerNumber,
      closingManagerName: doc.closingManagerName,
      financeManagerNumber: doc.financeManagerNumber,
      financeManagerName: doc.financeManagerName,
      salesmanNumber: doc.salesmanNumber,
      salesmanName: doc.salesmanName,
      msrp: doc.msrp,
      listPrice: doc.listPrice,
      salesPrice: doc.salesPrice,
      createdAt: doc.createdAt
    };
  }

  private documentToUser(doc: UserDocument): User {
    return {
      id: doc._id!.toString(),
      username: doc.username,
      email: doc.email,
      userType: doc.userType,
      createdAt: doc.createdAt
    };
  }

  // User methods
  async createUser(userData: RegisterUser): Promise<User> {
    const { hashPassword } = await import("./middleware/auth");
    
    const id = new ObjectId();
    const document: UserDocument = {
      _id: id,
      username: userData.username,
      email: userData.email,
      password: await hashPassword(userData.password),
      userType: userData.userType,
      createdAt: new Date()
    };

    this.users.set(id.toString(), document);
    return this.documentToUser(document);
  }

  async getUserByEmail(email: string): Promise<UserDocument | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const doc = this.users.get(id);
    return doc ? this.documentToUser(doc) : undefined;
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    const docs = Array.from(this.inventory.values());
    return docs.map(doc => this.documentToInventory(doc));
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const doc = this.inventory.get(id);
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async getInventoryByVin(vin: string): Promise<Inventory | undefined> {
    const docs = Array.from(this.inventory.values());
    const doc = docs.find(item => item.vin === vin);
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async getInventoryByStockNumber(stockNumber: string): Promise<Inventory | undefined> {
    const docs = Array.from(this.inventory.values());
    const doc = docs.find(item => item.stockNumber === stockNumber);
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = new ObjectId();
    const document: InventoryDocument = {
      _id: id,
      ...insertItem,
      createdAt: new Date(),
      markup: insertItem.price && insertItem.cost 
        ? String(Number(insertItem.price) - Number(insertItem.cost))
        : insertItem.markup || null
    };

    this.inventory.set(id.toString(), document);
    return this.documentToInventory(document);
  }

  async updateInventoryItem(id: string, updateData: Partial<InsertInventory>): Promise<Inventory> {
    const existing = this.inventory.get(id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }

    const updated: InventoryDocument = {
      ...existing,
      ...updateData,
      markup: updateData.price && updateData.cost 
        ? String(Number(updateData.price) - Number(updateData.cost))
        : updateData.markup || existing.markup
    };
    
    this.inventory.set(id, updated);
    return this.documentToInventory(updated);
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Sales methods
  async getSales(): Promise<Sales[]> {
    const docs = Array.from(this.sales.values());
    return docs.map(doc => this.documentToSales(doc));
  }

  async getSalesItem(id: string): Promise<Sales | undefined> {
    const doc = this.sales.get(id);
    return doc ? this.documentToSales(doc) : undefined;
  }

  async createSalesItem(insertItem: InsertSales): Promise<Sales> {
    const id = new ObjectId();
    const document: SalesDocument = {
      _id: id,
      ...insertItem,
      createdAt: new Date(),
    };

    this.sales.set(id.toString(), document);
    return this.documentToSales(document);
  }

  async updateSalesItem(id: string, updateData: Partial<InsertSales>): Promise<Sales> {
    const existing = this.sales.get(id);
    if (!existing) {
      throw new Error("Sales item not found");
    }

    const updated: SalesDocument = { ...existing, ...updateData };
    this.sales.set(id, updated);
    return this.documentToSales(updated);
  }

  async deleteSalesItem(id: string): Promise<boolean> {
    return this.sales.delete(id);
  }

  // Search methods
  async searchInventory(query: string): Promise<Inventory[]> {
    const docs = Array.from(this.inventory.values());
    const lowerQuery = query.toLowerCase();
    
    const filtered = docs.filter(item => 
      item.vin.toLowerCase().includes(lowerQuery) ||
      item.make.toLowerCase().includes(lowerQuery) ||
      item.model.toLowerCase().includes(lowerQuery) ||
      item.stockNumber.toLowerCase().includes(lowerQuery) ||
      item.color.toLowerCase().includes(lowerQuery)
    );
    
    return filtered.map(doc => this.documentToInventory(doc));
  }

  async searchSales(query: string): Promise<Sales[]> {
    const docs = Array.from(this.sales.values());
    const lowerQuery = query.toLowerCase();
    
    const filtered = docs.filter(item => 
      item.dealNumber.toLowerCase().includes(lowerQuery) ||
      item.firstName.toLowerCase().includes(lowerQuery) ||
      item.lastName.toLowerCase().includes(lowerQuery) ||
      (item.customerNumber && item.customerNumber.toLowerCase().includes(lowerQuery))
    );
    
    return filtered.map(doc => this.documentToSales(doc));
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    if (!this.settings) {
      return undefined;
    }
    return this.documentToSettings(this.settings);
  }

  async updateSettings(settings: InsertSettings): Promise<Settings> {
    const updatedSettings: SettingsDocument = {
      _id: this.settings?._id || new ObjectId(),
      ...settings,
      createdAt: this.settings?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.settings = updatedSettings;
    return this.documentToSettings(updatedSettings);
  }

  private initializeDefaultSettings() {
    const defaultSettings: SettingsDocument = {
      _id: new ObjectId(),
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
    };

    this.settings = defaultSettings;
  }

  private documentToSettings(doc: SettingsDocument): Settings {
    return {
      id: doc._id!.toString(),
      make: doc.make,
      sources: doc.sources,
      years: doc.years,
      status: doc.status,
      model: doc.model,
      colors: doc.colors,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

class MongoDBStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection<UserDocument>;
  private inventory: Collection<InventoryDocument>;
  private sales: Collection<SalesDocument>;
  private settings: Collection<SettingsDocument>;

  constructor(mongoUrl: string, databaseName: string = "dealerpro") {
    this.client = new MongoClient(mongoUrl);
    this.db = this.client.db(databaseName);
    this.users = this.db.collection<UserDocument>("users");
    this.inventory = this.db.collection<InventoryDocument>("inventory");
    this.sales = this.db.collection<SalesDocument>("sales");
    this.settings = this.db.collection<SettingsDocument>("settings");
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log("Connected to MongoDB successfully");
    await this.initializeDefaultUsers();
    await this.initializeDefaultSettings();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log("Disconnected from MongoDB");
  }

  private async initializeDefaultUsers() {
    // Check if users already exist
    const existingUsersCount = await this.users.countDocuments();
    if (existingUsersCount > 0) {
      console.log("Users already exist in MongoDB, skipping initialization");
      return;
    }

    // Create default users
    const { hashPassword } = await import("./middleware/auth");
    
    const defaultUsers: UserDocument[] = [
      {
        _id: new ObjectId(),
        username: "admin",
        email: "admin@dealerpro.com",
        password: await hashPassword("admin123"),
        userType: "admin",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        username: "manager1",
        email: "manager@dealerpro.com", 
        password: await hashPassword("manager123"),
        userType: "manager",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        username: "employee1",
        email: "employee@dealerpro.com",
        password: await hashPassword("employee123"),
        userType: "employee",
        createdAt: new Date()
      }
    ];

    await this.users.insertMany(defaultUsers);
    console.log("Default users created in MongoDB");
  }

  private documentToInventory(doc: InventoryDocument): Inventory {
    return {
      id: doc._id!.toString(),
      stockNumber: doc.stockNumber,
      vin: doc.vin,
      year: doc.year,
      make: doc.make,
      model: doc.model,
      series: doc.series,
      color: doc.color,
      certified: doc.certified,
      body: doc.body,
      price: doc.price,
      bookValue: doc.bookValue,
      cost: doc.cost,
      markup: doc.markup,
      odometer: doc.odometer,
      age: doc.age,
      createdAt: doc.createdAt
    };
  }

  private documentToSales(doc: SalesDocument): Sales {
    return {
      id: doc._id!.toString(),
      dealNumber: doc.dealNumber,
      customerNumber: doc.customerNumber,
      firstName: doc.firstName,
      lastName: doc.lastName,
      zip: doc.zip,
      exteriorColor: doc.exteriorColor,
      newUsed: doc.newUsed,
      stockNumber: doc.stockNumber,
      deliveryDate: doc.deliveryDate,
      deliveryMileage: doc.deliveryMileage,
      trade1Vin: doc.trade1Vin,
      trade1Year: doc.trade1Year,
      trade1Make: doc.trade1Make,
      trade1Model: doc.trade1Model,
      trade1Odometer: doc.trade1Odometer,
      trade1ACV: doc.trade1ACV,
      trade2Vin: doc.trade2Vin,
      trade2Year: doc.trade2Year,
      trade2Make: doc.trade2Make,
      trade2Model: doc.trade2Model,
      trade2Odometer: doc.trade2Odometer,
      trade2ACV: doc.trade2ACV,
      closingManagerNumber: doc.closingManagerNumber,
      closingManagerName: doc.closingManagerName,
      financeManagerNumber: doc.financeManagerNumber,
      financeManagerName: doc.financeManagerName,
      salesmanNumber: doc.salesmanNumber,
      salesmanName: doc.salesmanName,
      msrp: doc.msrp,
      listPrice: doc.listPrice,
      salesPrice: doc.salesPrice,
      createdAt: doc.createdAt
    };
  }

  private documentToUser(doc: UserDocument): User {
    return {
      id: doc._id!.toString(),
      username: doc.username,
      email: doc.email,
      userType: doc.userType,
      createdAt: doc.createdAt
    };
  }

  // User methods
  async createUser(userData: RegisterUser): Promise<User> {
    const { hashPassword } = await import("./middleware/auth");
    
    const document: UserDocument = {
      _id: new ObjectId(),
      username: userData.username,
      email: userData.email,
      password: await hashPassword(userData.password),
      userType: userData.userType,
      createdAt: new Date()
    };

    const result = await this.users.insertOne(document);
    document._id = result.insertedId;
    return this.documentToUser(document);
  }

  async getUserByEmail(email: string): Promise<UserDocument | undefined> {
    const user = await this.users.findOne({ email });
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const doc = await this.users.findOne({ _id: new ObjectId(id) });
    return doc ? this.documentToUser(doc) : undefined;
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    const docs = await this.inventory.find({}).toArray();
    return docs.map(doc => this.documentToInventory(doc));
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const doc = await this.inventory.findOne({ _id: new ObjectId(id) });
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async getInventoryByVin(vin: string): Promise<Inventory | undefined> {
    const doc = await this.inventory.findOne({ vin });
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async getInventoryByStockNumber(stockNumber: string): Promise<Inventory | undefined> {
    const doc = await this.inventory.findOne({ stockNumber });
    return doc ? this.documentToInventory(doc) : undefined;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const document: InventoryDocument = {
      _id: new ObjectId(),
      ...insertItem,
      createdAt: new Date(),
      markup: insertItem.price && insertItem.cost 
        ? String(Number(insertItem.price) - Number(insertItem.cost))
        : insertItem.markup || null
    };

    const result = await this.inventory.insertOne(document);
    document._id = result.insertedId;
    return this.documentToInventory(document);
  }

  async updateInventoryItem(id: string, updateData: Partial<InsertInventory>): Promise<Inventory> {
    const updateDoc = {
      ...updateData,
      markup: updateData.price && updateData.cost 
        ? String(Number(updateData.price) - Number(updateData.cost))
        : updateData.markup
    };

    const result = await this.inventory.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );
    
    if (!result) {
      throw new Error("Inventory item not found");
    }
    
    return this.documentToInventory(result);
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await this.inventory.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Sales methods
  async getSales(): Promise<Sales[]> {
    const docs = await this.sales.find({}).toArray();
    return docs.map(doc => this.documentToSales(doc));
  }

  async getSalesItem(id: string): Promise<Sales | undefined> {
    const doc = await this.sales.findOne({ _id: new ObjectId(id) });
    return doc ? this.documentToSales(doc) : undefined;
  }

  async createSalesItem(insertItem: InsertSales): Promise<Sales> {
    const document: SalesDocument = {
      _id: new ObjectId(),
      ...insertItem,
      createdAt: new Date(),
    };

    const result = await this.sales.insertOne(document);
    document._id = result.insertedId;
    return this.documentToSales(document);
  }

  async updateSalesItem(id: string, updateData: Partial<InsertSales>): Promise<Sales> {
    const result = await this.sales.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
    
    if (!result) {
      throw new Error("Sales item not found");
    }
    
    return this.documentToSales(result);
  }

  async deleteSalesItem(id: string): Promise<boolean> {
    const result = await this.sales.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Search methods
  async searchInventory(query: string): Promise<Inventory[]> {
    const lowerQuery = query.toLowerCase();
    const regex = new RegExp(lowerQuery, 'i');
    
    const docs = await this.inventory.find({
      $or: [
        { vin: regex },
        { make: regex },
        { model: regex },
        { stockNumber: regex },
        { color: regex }
      ]
    }).toArray();
    
    return docs.map(doc => this.documentToInventory(doc));
  }

  async searchSales(query: string): Promise<Sales[]> {
    const lowerQuery = query.toLowerCase();
    const regex = new RegExp(lowerQuery, 'i');
    
    const docs = await this.sales.find({
      $or: [
        { dealNumber: regex },
        { firstName: regex },
        { lastName: regex },
        { customerNumber: regex }
      ]
    }).toArray();
    
    return docs.map(doc => this.documentToSales(doc));
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    const doc = await this.settings.findOne({});
    return doc ? this.documentToSettings(doc) : undefined;
  }

  async updateSettings(settings: InsertSettings): Promise<Settings> {
    const existingDoc = await this.settings.findOne({});
    
    if (existingDoc) {
      const updatedDoc = {
        ...existingDoc,
        ...settings,
        updatedAt: new Date(),
      };
      
      await this.settings.replaceOne({ _id: existingDoc._id }, updatedDoc);
      return this.documentToSettings(updatedDoc);
    } else {
      const newDoc: SettingsDocument = {
        _id: new ObjectId(),
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await this.settings.insertOne(newDoc);
      return this.documentToSettings(newDoc);
    }
  }

  private async initializeDefaultSettings() {
    // Check if settings already exist
    const existingSettingsCount = await this.settings.countDocuments();
    if (existingSettingsCount > 0) {
      console.log("Settings already exist in MongoDB, skipping initialization");
      return;
    }

    const defaultSettings: SettingsDocument = {
      _id: new ObjectId(),
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
    };

    await this.settings.insertOne(defaultSettings);
    console.log("Default settings created in MongoDB");
  }

  private documentToSettings(doc: SettingsDocument): Settings {
    return {
      id: doc._id!.toString(),
      make: doc.make,
      sources: doc.sources,
      years: doc.years,
      status: doc.status,
      model: doc.model,
      colors: doc.colors,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

// Initialize storage based on environment
async function initializeStorage(): Promise<IStorage> {
  const mongoUrl = env.MONGODB_URL || process.env.MONGO_URL;
  
  if (mongoUrl) {
    console.log("Initializing MongoDB storage...");
    try {
      const mongoStorage = new MongoDBStorage(mongoUrl);
      await mongoStorage.connect();
      return mongoStorage;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      console.log("Falling back to in-memory storage");
    }
  }
  
  console.log("Using in-memory storage");
  return new MongoDBCompatibleStorage();
}

// Export a promise that resolves to the initialized storage
export const storagePromise = initializeStorage();
export let storage: IStorage;

// Initialize storage immediately
initializeStorage().then(s => {
  storage = s;
}).catch(error => {
  console.error("Failed to initialize storage:", error);
  storage = new MongoDBCompatibleStorage();
});