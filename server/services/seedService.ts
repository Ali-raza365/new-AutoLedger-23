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
        },
        {
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
        }
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