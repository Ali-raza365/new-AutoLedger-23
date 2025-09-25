"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.resetSettings = exports.updateSettings = exports.getSettings = void 0;
var models_1 = require("../models");
var schema_1 = require("@shared/schema");
var response_1 = require("../utils/response");
var middleware_1 = require("../middleware");
exports.getSettings = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, defaultSettings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1.Settings.findOne({})];
            case 1:
                settings = _a.sent();
                if (!settings) {
                    defaultSettings = {
                        id: "",
                        make: [],
                        sources: [],
                        years: [],
                        status: [],
                        model: [],
                        colors: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    (0, response_1.sendSuccess)(res, defaultSettings, "Default settings retrieved");
                    return [2 /*return*/];
                }
                (0, response_1.sendSuccess)(res, settings, "Settings retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.updateSettings = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var validatedData, settings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validatedData = schema_1.insertSettingsSchema.parse(req.body);
                return [4 /*yield*/, models_1.Settings.findOne({})];
            case 1:
                settings = _a.sent();
                if (!settings) return [3 /*break*/, 3];
                // Update existing settings
                Object.assign(settings, validatedData);
                settings.updatedAt = new Date();
                return [4 /*yield*/, settings.save()];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, models_1.Settings.create(__assign(__assign({}, validatedData), { createdAt: new Date(), updatedAt: new Date() }))];
            case 4:
                // Create new settings
                settings = _a.sent();
                _a.label = 5;
            case 5:
                (0, response_1.sendSuccess)(res, settings, "Settings updated successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.resetSettings = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var defaultSettings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Delete all settings
            return [4 /*yield*/, models_1.Settings.deleteMany({})];
            case 1:
                // Delete all settings
                _a.sent();
                return [4 /*yield*/, models_1.Settings.create({
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
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })];
            case 2:
                defaultSettings = _a.sent();
                (0, response_1.sendSuccess)(res, defaultSettings, "Settings reset to defaults successfully");
                return [2 /*return*/];
        }
    });
}); });
