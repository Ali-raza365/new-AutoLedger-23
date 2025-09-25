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
exports.lookupVinData = exports.searchInventory = exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryByStockNumber = exports.getInventoryByVin = exports.getInventoryById = exports.getAllInventory = void 0;
var models_1 = require("../models");
var schema_1 = require("@shared/schema");
var errors_1 = require("../utils/errors");
var response_1 = require("../utils/response");
var middleware_1 = require("../middleware");
var nhtsaService_1 = require("../services/nhtsaService");
var stockNumberService_1 = require("../services/stockNumberService");
exports.getAllInventory = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var inventory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1.Inventory.find({}).sort({ createdAt: -1 })];
            case 1:
                inventory = _a.sent();
                (0, response_1.sendSuccess)(res, inventory, "Inventory retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.getInventoryById = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, models_1.Inventory.findById(id)];
            case 1:
                item = _a.sent();
                if (!item) {
                    throw new errors_1.NotFoundError("Inventory item not found");
                }
                (0, response_1.sendSuccess)(res, item, "Inventory item retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.getInventoryByVin = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var vin, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vin = req.params.vin;
                return [4 /*yield*/, models_1.Inventory.findOne({ vin: vin.toUpperCase() })];
            case 1:
                item = _a.sent();
                if (!item) {
                    throw new errors_1.NotFoundError("Vehicle not found");
                }
                (0, response_1.sendSuccess)(res, item, "Vehicle retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.getInventoryByStockNumber = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var stockNumber, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stockNumber = req.params.stockNumber;
                return [4 /*yield*/, models_1.Inventory.findOne({ stockNumber: stockNumber })];
            case 1:
                item = _a.sent();
                if (!item) {
                    throw new errors_1.NotFoundError("Vehicle not found");
                }
                (0, response_1.sendSuccess)(res, item, "Vehicle retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.createInventoryItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var inputData, normalizedVin, existingVin, existingStock, finalData, vehicleData, error_1, stockNumber, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                inputData = schema_1.insertInventorySchema.parse(req.body);
                normalizedVin = inputData.vin.toUpperCase();
                return [4 /*yield*/, models_1.Inventory.findOne({ vin: normalizedVin })];
            case 1:
                existingVin = _a.sent();
                if (existingVin) {
                    throw new errors_1.ConflictError("A vehicle with this VIN already exists");
                }
                return [4 /*yield*/, models_1.Inventory.findOne({ stockNumber: inputData.stockNumber })];
            case 2:
                existingStock = _a.sent();
                if (existingStock) {
                    throw new errors_1.ConflictError("A vehicle with this stock number already exists");
                }
                finalData = __assign(__assign({}, inputData), { vin: normalizedVin });
                if (!(!inputData.make || !inputData.model || !inputData.body)) return [3 /*break*/, 6];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                console.log("[Create Inventory] Auto-populating vehicle details for VIN: ".concat(normalizedVin));
                return [4 /*yield*/, nhtsaService_1.NHTSAService.decodeVIN(normalizedVin, inputData.year)];
            case 4:
                vehicleData = _a.sent();
                // Use NHTSA data to fill missing fields
                finalData = __assign(__assign({}, finalData), { make: inputData.make || vehicleData.make, model: inputData.model || vehicleData.model, year: inputData.year || vehicleData.year || inputData.year, trim: inputData.trim || vehicleData.trim, series: inputData.series || vehicleData.series, body: inputData.body || vehicleData.bodyClass, dateLogged: new Date() });
                console.log("[Create Inventory] Auto-populated data:", {
                    make: finalData.make,
                    model: finalData.model,
                    year: finalData.year,
                    body: finalData.body
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.warn("[Create Inventory] VIN decode failed for ".concat(normalizedVin, ":"), error_1);
                return [3 /*break*/, 6];
            case 6:
                // Validate required fields after auto-population
                if (!finalData.make) {
                    throw new errors_1.ValidationError("Make is required. Please ensure VIN is valid or provide the make manually.");
                }
                if (!finalData.model) {
                    throw new errors_1.ValidationError("Model is required. Please ensure VIN is valid or provide the model manually.");
                }
                if (!finalData.body) {
                    throw new errors_1.ValidationError("Body type is required. Please ensure VIN is valid or provide the body type manually.");
                }
                return [4 /*yield*/, stockNumberService_1.StockNumberService.generateStockNumber()];
            case 7:
                stockNumber = _a.sent();
                return [4 /*yield*/, models_1.Inventory.create(__assign(__assign({}, finalData), { createdAt: new Date() }))];
            case 8:
                item = _a.sent();
                (0, response_1.sendSuccess)(res, item, "Inventory item created successfully", 201);
                return [2 /*return*/];
        }
    });
}); });
exports.updateInventoryItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, validatedData, finalData, existingVin, vehicleData, error_2, existingStock, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                validatedData = schema_1.insertInventorySchema.partial().parse(req.body);
                finalData = __assign({}, validatedData);
                if (!validatedData.vin) return [3 /*break*/, 5];
                return [4 /*yield*/, models_1.Inventory.findOne({
                        vin: validatedData.vin.toUpperCase(),
                        _id: { $ne: id }
                    })];
            case 1:
                existingVin = _a.sent();
                if (existingVin) {
                    throw new errors_1.ConflictError("A vehicle with this VIN already exists");
                }
                finalData.vin = validatedData.vin.toUpperCase();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                console.log("[Update Inventory] Auto-populating vehicle details for VIN: ".concat(validatedData.vin));
                return [4 /*yield*/, nhtsaService_1.NHTSAService.decodeVIN(validatedData.vin, validatedData.year)];
            case 3:
                vehicleData = _a.sent();
                // Only update fields that aren't explicitly provided in the update
                if (!validatedData.make && vehicleData.make)
                    finalData.make = vehicleData.make;
                if (!validatedData.model && vehicleData.model)
                    finalData.model = vehicleData.model;
                if (!validatedData.year && vehicleData.year)
                    finalData.year = vehicleData.year;
                if (!validatedData.trim && vehicleData.trim)
                    finalData.trim = vehicleData.trim;
                if (!validatedData.series && vehicleData.series)
                    finalData.series = vehicleData.series;
                if (!validatedData.body && vehicleData.bodyClass)
                    finalData.body = vehicleData.bodyClass;
                console.log("[Update Inventory] Auto-populated data:", {
                    make: finalData.make,
                    model: finalData.model,
                    year: finalData.year,
                    trim: finalData.trim
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.warn("[Update Inventory] VIN decode failed for ".concat(validatedData.vin, ":"), error_2);
                return [3 /*break*/, 5];
            case 5:
                if (!validatedData.stockNumber) return [3 /*break*/, 7];
                return [4 /*yield*/, models_1.Inventory.findOne({
                        stockNumber: validatedData.stockNumber,
                        _id: { $ne: id }
                    })];
            case 6:
                existingStock = _a.sent();
                if (existingStock) {
                    throw new errors_1.ConflictError("A vehicle with this stock number already exists");
                }
                _a.label = 7;
            case 7: return [4 /*yield*/, models_1.Inventory.findByIdAndUpdate(id, finalData, { new: true, runValidators: true })];
            case 8:
                item = _a.sent();
                if (!item) {
                    throw new errors_1.NotFoundError("Inventory item not found");
                }
                (0, response_1.sendSuccess)(res, item, "Inventory item updated successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.deleteInventoryItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, models_1.Inventory.findByIdAndDelete(id)];
            case 1:
                item = _a.sent();
                if (!item) {
                    throw new errors_1.NotFoundError("Inventory item not found");
                }
                (0, response_1.sendSuccess)(res, null, "Inventory item deleted successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.searchInventory = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var query, searchResults;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.params.query;
                return [4 /*yield*/, models_1.Inventory.find({
                        $or: [
                            { vin: { $regex: query, $options: "i" } },
                            { make: { $regex: query, $options: "i" } },
                            { model: { $regex: query, $options: "i" } },
                            { stockNumber: { $regex: query, $options: "i" } },
                            { color: { $regex: query, $options: "i" } },
                            { series: { $regex: query, $options: "i" } },
                        ]
                    }).sort({ createdAt: -1 })];
            case 1:
                searchResults = _a.sent();
                (0, response_1.sendSuccess)(res, searchResults, "Found ".concat(searchResults.length, " matching vehicles"));
                return [2 /*return*/];
        }
    });
}); });
// VIN Lookup using NHTSA API
exports.lookupVinData = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var vin, modelYear, vehicleData, existingVehicle, response, error_3, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vin = req.params.vin;
                if (!vin || vin.length !== 17) {
                    throw new Error("VIN must be exactly 17 characters");
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                modelYear = req.query.year ? parseInt(req.query.year, 10) : undefined;
                console.log("[VIN Lookup] Decoding VIN: ".concat(vin));
                return [4 /*yield*/, nhtsaService_1.NHTSAService.decodeVIN(vin)];
            case 2:
                vehicleData = _a.sent();
                console.log(vehicleData);
                return [4 /*yield*/, models_1.Inventory.findOne({ vin: vin.toUpperCase() })];
            case 3:
                existingVehicle = _a.sent();
                response = {
                    vehicleData: vehicleData,
                    // existsInInventory: !!existingVehicle,
                    // inventoryData: existingVehicle || null
                };
                (0, response_1.sendSuccess)(res, response, "VIN decoded successfully");
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error("[VIN Lookup] Error decoding VIN ".concat(vin, ":"), error_3);
                errorMessage = error_3 instanceof Error ? error_3.message : "Failed to decode VIN";
                throw new Error(errorMessage);
            case 5: return [2 /*return*/];
        }
    });
}); });
