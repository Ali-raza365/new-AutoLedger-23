"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
var models_1 = require("../models");
var middleware_1 = require("../middleware");
var SeedService = /** @class */ (function () {
    function SeedService() {
    }
    SeedService.seedUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingUsersCount, defaultUsers, _a, error_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, models_1.User.countDocuments()];
                    case 1:
                        existingUsersCount = _e.sent();
                        if (existingUsersCount > 0) {
                            console.log("Users already exist, skipping user seeding");
                            return [2 /*return*/];
                        }
                        console.log("Seeding default users...");
                        _b = {
                            username: "admin",
                            email: "admin@dealerpro.com"
                        };
                        return [4 /*yield*/, (0, middleware_1.hashPassword)("admin123")];
                    case 2:
                        _a = [
                            (_b.password = _e.sent(),
                                _b.userType = "admin",
                                _b)
                        ];
                        _c = {
                            username: "manager1",
                            email: "manager@dealerpro.com"
                        };
                        return [4 /*yield*/, (0, middleware_1.hashPassword)("manager123")];
                    case 3:
                        _a = _a.concat([
                            (_c.password = _e.sent(),
                                _c.userType = "manager",
                                _c)
                        ]);
                        _d = {
                            username: "employee1",
                            email: "employee@dealerpro.com"
                        };
                        return [4 /*yield*/, (0, middleware_1.hashPassword)("employee123")];
                    case 4:
                        defaultUsers = _a.concat([
                            (_d.password = _e.sent(),
                                _d.userType = "employee",
                                _d)
                        ]);
                        return [4 /*yield*/, models_1.User.insertMany(defaultUsers)];
                    case 5:
                        _e.sent();
                        console.log("Default users seeded successfully");
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _e.sent();
                        console.error("Error seeding users:", error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SeedService.seedSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingSettings, defaultSettings, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, models_1.Settings.findOne()];
                    case 1:
                        existingSettings = _a.sent();
                        if (existingSettings) {
                            console.log("Settings already exist, skipping settings seeding");
                            return [2 /*return*/];
                        }
                        console.log("Seeding default settings...");
                        defaultSettings = {
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
                        };
                        return [4 /*yield*/, models_1.Settings.create(defaultSettings)];
                    case 2:
                        _a.sent();
                        console.log("Default settings seeded successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error seeding settings:", error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SeedService.seedSampleData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingInventory, sampleInventory, sampleSales, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, models_1.Inventory.countDocuments()];
                    case 1:
                        existingInventory = _a.sent();
                        if (existingInventory > 0) {
                            console.log("Sample inventory already exists, skipping sample data seeding");
                            return [2 /*return*/];
                        }
                        console.log("Seeding sample inventory and sales data...");
                        sampleInventory = [
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
                        return [4 /*yield*/, models_1.Inventory.insertMany(sampleInventory)];
                    case 2:
                        _a.sent();
                        sampleSales = [
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
                        return [4 /*yield*/, models_1.Sales.insertMany(sampleSales)];
                    case 3:
                        _a.sent();
                        console.log("Sample data seeded successfully");
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error("Error seeding sample data:", error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SeedService.seedAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.seedUsers()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.seedSettings()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.seedSampleData()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SeedService;
}());
exports.SeedService = SeedService;
