import { User, Inventory, Sales, Settings } from "../models";
import { hashPassword } from "../middleware";

export class SeedService {
  static async seedUsers(): Promise<void> {
    try {
      // Check if users already exist
      const existingUsersCount = await User.countDocuments();
      if (existingUsersCount > 0) {
        console.log("Users already exist, skipping user seeding");
        return;
      }

      console.log("Seeding default users...");

      const defaultUsers = [
        {
          username: "admin",
          email: "admin@dealerpro.com",
          password: await hashPassword("admin123"),
          userType: "admin" as const,
        },
        {
          username: "manager1",
          email: "manager@dealerpro.com",
          password: await hashPassword("manager123"),
          userType: "manager" as const,
        },
        {
          username: "employee1",
          email: "employee@dealerpro.com",
          password: await hashPassword("employee123"),
          userType: "employee" as const,
        }
      ];

      await User.insertMany(defaultUsers);
      console.log("Default users seeded successfully");
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }

  static async seedSettings(): Promise<void> {
    try {
      // Check if settings already exist
      const existingSettings = await Settings.findOne();
      if (existingSettings) {
        console.log("Settings already exist, skipping settings seeding");
        return;
      }

      console.log("Seeding default settings...");

      const defaultSettings = {
        // Provided data
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
          { code: "PUM", name: "Agate Black" },
          { code: "PDR", name: "Avalanche" },
          { code: "PYZ", name: "Oxford White" },
          { code: "PAZ", name: "Star White" },
          { code: "PA3", name: "Space White" },
          { code: "PG1", name: "Shadow Black" },
          { code: "PHY", name: "Dark Matter" },
          { code: "PM7", name: "Carbonized Gray" },
          { code: "PUJ", name: "Sterling Gray" },
          { code: "PJS", name: "Iconic Silver" },
          { code: "PTN", name: "Silver Gray" },
          { code: "PNE", name: "Fighter Jet Gray" },
          { code: "PAE", name: "Grabber Blue" },
          { code: "PK1", name: "Vapor Blue" },
          { code: "PAB", name: "Blue Tinted Clearcoat" },
          { code: "PE7", name: "Velocity Blue" },
          { code: "PLK", name: "Dark Blue" },
          { code: "PL8", name: "Cinnabar Red" },
          { code: "PD4", name: "Rapid Red Metallic" },
          { code: "PPQ", name: "Race Red" },
          { code: "PCN", name: "Code Orange" },
          { code: "PSB", name: "Cyber Orange" }
        ],
        // Added missing fields from the schema
        users: [],
        rooftopCode: "EXAMPLE_ROOFTOP_CODE",
        hqPriceThreshold: 20000,
        minGrossProfit: 1500,
        maxReconPercentage: 0.15,
        buyers: [
          { id: "buyer123", name: "Jane Doe" },
          { id: "buyer456", name: "John Smith" }
        ],
        channels: ["Online", "In-Person", "Referral"],
        stockNumberPrefixRule: {
          type: "none",
          customValue: ""
        },
        stockNumberSuffixRule: {
          type: "source",
          customValue: ""
        },
        stockNumberSequentialCounter: 1000,
        usedStockNumberSequentialCounter: 2000,
        newStockNumberSequentialCounter: 3000,
        usedStockNumberPrefixRule: {
          type: "source",
          customValue: ""
        },
        usedStockNumberSuffixRule: {
          type: "source",
          customValue: ""
        },
        newStockNumberPrefixRule: {
          type: "none",
          customValue: ""
        },
        newStockNumberSuffixRule: {
          type: "source",
          customValue: ""
        },

      };

      await Settings.create(defaultSettings);
      console.log("Default settings seeded successfully");
    } catch (error) {
      console.error("Error seeding settings:", error);
    }
  }

  static async seedSampleData(): Promise<void> {
    try {
      // Check if sample data already exists
      const existingInventory = await Inventory.countDocuments();
      if (existingInventory > 0) {
        console.log("Sample inventory already exists, skipping sample data seeding");
        return;
      }

      console.log("Seeding sample inventory and sales data...");

      // Add sample inventory
      const sampleInventory = [
        {
          id: "inv-001",
          stockNumber: "102344J",
          dateLogged: new Date("2024-02-01"),
          vin: "2LMPJ6K95PBL05254",
          year: 2023,
          make: "Lincoln",
          model: "Nautilus",
          series: "Reserve",
          source: "Kelley Blue Book",
          seriesDetail: null,
          interiorDescription: "Ebony",
          exitStrategy: "R",
          color: "White Metallic",
          certified: false,
          body: "4D Sport Utility",
          odometer: 21391,
          newUsed: "Used",

          // Financial Analysis
          price: 34000,
          pendingPrice: null,
          bookValue: 34812,
          cost: 35958,
          applicableCost: 35958,
          originalCost: 34583,
          costDifference: 1375,
          markup: -1958,
          water: 1146,
          applicableWater: 1146,

          // Market / Analytics
          overall: 48,
          marketDaysSupplyLikeMine: 63,
          costToMarketPct: 104,
          applicableCostToMarketPct: 96,
          marketPct: 91,

          // Ranking
          priceRank: "5 of 10",
          vRank: "2 of 10",
          priceRankBucket: "Yellow",
          vRankBucket: "Green",

          // Status
          currentStatus: "Available",
          statusDate: new Date("2024-02-05"),

          // Legacy
          age: 66,

          // Metadata
          createdAt: new Date(),
        },
        {
          id: "inv-002",
          stockNumber: "102468A",
          dateLogged: new Date("2024-02-02"),
          vin: "1C6SRFUP2SN585444",
          source: "Kelley Blue Book",
          year: 2025,
          make: "Ram",
          model: "1500",
          series: "RHO",
          seriesDetail: null,
          interiorDescription: "Black Leather",
          exitStrategy: "R",
          color: "Bright White Clearcoat",
          certified: false,
          body: "4D Crew Cab",
          odometer: 2279,
          newUsed: "New",

          // Financial Analysis
          price: 80500,
          pendingPrice: null,
          bookValue: 76588,
          cost: 762,
          applicableCost: null, // (Excluded)
          originalCost: 762,
          costDifference: 0,
          markup: 79738,
          water: -75826,
          applicableWater: null, // (Excluded)

          // Market / Analytics
          overall: 107,
          marketDaysSupplyLikeMine: 117,
          costToMarketPct: 1,
          applicableCostToMarketPct: null, // (Excluded)
          marketPct: 103,

          // Ranking
          priceRank: "8 of 11",
          vRank: "8 of 11",
          priceRankBucket: "Yellow",
          vRankBucket: "Yellow",

          // Status
          currentStatus: "Available",
          statusDate: new Date("2024-02-06"),

          // Legacy
          age: 25,

          // Metadata
          createdAt: new Date(),
        },
        {
          id: "inv-003",
          stockNumber: "102500P",
          dateLogged: new Date("2024-02-03"),
          vin: "3KPF24AD9PE613913",
          source: "Kelley Blue Book",
          year: 2023,
          make: "Kia",
          model: "Forte",
          series: "LXS",
          seriesDetail: null,
          interiorDescription: "Black Cloth",
          exitStrategy: "R",
          color: "Gravity Gray",
          certified: false,
          body: "4D Sedan",
          odometer: 62997,
          newUsed: "Used",

          // Financial Analysis
          price: 17000,
          pendingPrice: null,
          bookValue: 15451,
          cost: 17463,
          applicableCost: 17463,
          originalCost: 16568,
          costDifference: 895,
          markup: -463,
          water: 2012,
          applicableWater: 2012,

          // Market / Analytics
          overall: 69,
          marketDaysSupplyLikeMine: 69,
          costToMarketPct: 100,
          applicableCostToMarketPct: 99,
          marketPct: 101,

          // Ranking
          priceRank: "20 of 42",
          vRank: "25 of 42",
          priceRankBucket: "Yellow",
          vRankBucket: "Yellow",

          // Status
          currentStatus: "Available",
          statusDate: new Date("2024-02-07"),

          // Legacy
          age: 17,

          // Metadata
          createdAt: new Date(),
        },
        {
          id: "inv-004",
          stockNumber: "102480A",
          dateLogged: new Date("2024-02-04"),
          vin: "WDCTG4EB6LU028662",
          year: 2020,
          make: "Mercedes-Benz",
          model: "GLA",
          series: "GLA 250",
          seriesDetail: null,
          interiorDescription: "Leatherette",
          source: "Trade-In",
          exitStrategy: "R",
          color: "Polar White",
          certified: false,
          body: "4D Sport Utility",
          odometer: 51704,
          newUsed: "Used",

          // Financial Analysis
          price: 20000,
          pendingPrice: null,
          bookValue: 17011,
          cost: 18387,
          applicableCost: 18387,
          originalCost: 19083,
          costDifference: -696,
          markup: 1613,
          water: 1376,
          applicableWater: 1376,

          // Market / Analytics
          overall: 43,
          marketDaysSupplyLikeMine: 43,
          costToMarketPct: 96,
          applicableCostToMarketPct: 96,
          marketPct: 104,

          // Ranking
          priceRank: "10 of 15",
          vRank: "12 of 15",
          priceRankBucket: "Yellow",
          vRankBucket: "Red",

          // Status
          currentStatus: "Available",
          statusDate: new Date("2024-02-08"),

          // Legacy
          age: 23,

          // Metadata
          createdAt: new Date(),
        },
      ];

      await Inventory.insertMany(sampleInventory);

      // Add sample sales
      const sampleSales = [
        {
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
          closingManagerNumber: "M001",
          closingManagerName: "Sarah Johnson",
          financeManagerNumber: "F001",
          financeManagerName: "Mike Davis",
          salesmanNumber: "S001",
          salesmanName: "Robert Wilson",
          msrp: "29500",
          listPrice: "28450",
          salesPrice: "27200",
        }
      ];

      await Sales.insertMany(sampleSales);
      console.log("Sample data seeded successfully");
    } catch (error) {
      console.error("Error seeding sample data:", error);
    }
  }

  static async seedAll(): Promise<void> {
    await this.seedUsers();
    await this.seedSettings();
    await this.seedSampleData();
  }
}