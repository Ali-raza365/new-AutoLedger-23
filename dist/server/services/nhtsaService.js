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
exports.NHTSAService = void 0;
/**
 * NHTSA vPIC API Service
 * Provides VIN decoding and vehicle data extraction using the free NHTSA API
 */
var NHTSAService = /** @class */ (function () {
    function NHTSAService() {
    }
    /**
     * Decode VIN and extract vehicle information
     * @param vin - 17 character VIN number
     * @param modelYear - Optional model year for better accuracy
     * @returns Processed vehicle data
     */
    NHTSAService.decodeVIN = function (vin, modelYear) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanVin, yearParam, url, controller_1, timeoutId, response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Validate VIN format
                        if (!vin || vin.length !== 17) {
                            throw new Error('VIN must be exactly 17 characters');
                        }
                        cleanVin = vin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
                        if (cleanVin.length !== 17) {
                            throw new Error('Invalid VIN format - contains invalid characters');
                        }
                        yearParam = modelYear ? "&modelyear=".concat(modelYear) : '';
                        url = "".concat(this.BASE_URL, "/vehicles/DecodeVinValues/").concat(cleanVin, "?format=json").concat(yearParam);
                        console.log("[NHTSA Service] Decoding VIN: ".concat(cleanVin));
                        controller_1 = new AbortController();
                        timeoutId = setTimeout(function () { return controller_1.abort(); }, this.REQUEST_TIMEOUT);
                        return [4 /*yield*/, fetch(url, {
                                signal: controller_1.signal,
                                headers: {
                                    'User-Agent': 'DealerPro-VIN-Decoder/1.0',
                                    'Accept': 'application/json',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        console.log({ response: response });
                        clearTimeout(timeoutId);
                        if (!response.ok) {
                            throw new Error("NHTSA API request failed: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        console.log({ data: data });
                        if (!data.Results || data.Results.length === 0) {
                            throw new Error('No vehicle data found for the provided VIN');
                        }
                        // Process and extract relevant vehicle data
                        return [2 /*return*/, this.processVehicleData(data.Results)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[NHTSA Service] VIN decode error:', error_1);
                        if (error_1 instanceof TypeError && error_1.message.includes('fetch')) {
                            throw new Error('Unable to connect to NHTSA API service');
                        }
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process raw NHTSA API response into structured vehicle data
     * @param results - Array of NHTSA variable-value pairs
     * @returns Processed vehicle data object
     */
    NHTSAService.processVehicleData = function (results) {
        var vehicleData = {};
        console.log({ results: results });
        // Assuming results[0] is the decoded object
        var decoded = results[0];
        // Create a map for easier extraction
        var dataMap = new Map();
        Object.entries(decoded).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (typeof value === "string" && value.trim() && value !== "Not Applicable") {
                dataMap.set(key, value.trim());
            }
        });
        // Extract and map key vehicle information
        vehicleData.make = dataMap.get("Make") || undefined;
        vehicleData.model = dataMap.get("Model") || undefined;
        vehicleData.year = this.parseYear(dataMap.get("ModelYear")); // ⚠️ key is `ModelYear` not "Model Year"
        vehicleData.trim = dataMap.get("Trim") || dataMap.get("Series") || undefined;
        vehicleData.series = dataMap.get("Series") || undefined;
        vehicleData.bodyClass = dataMap.get("BodyClass") || undefined;
        vehicleData.engineModel = dataMap.get("EngineModel") || undefined;
        vehicleData.fuelType = dataMap.get("FuelTypePrimary") || undefined; // ⚠️ check key
        vehicleData.transmission = dataMap.get("TransmissionStyle") || undefined;
        vehicleData.driveType = dataMap.get("DriveType") || undefined;
        vehicleData.manufacturerName = dataMap.get("Manufacturer") || undefined; // ⚠️ key is "Manufacturer"
        vehicleData.plantCountry = dataMap.get("PlantCountry") || undefined;
        vehicleData.vehicleType = dataMap.get("VehicleType") || undefined;
        console.log("[NHTSA Service] Processed vehicle data:", vehicleData);
        return vehicleData;
    };
    /**
     * Parse year string to number
     * @param yearString - Year as string
     * @returns Year as number or undefined
     */
    NHTSAService.parseYear = function (yearString) {
        if (!yearString)
            return undefined;
        var year = parseInt(yearString, 10);
        return !isNaN(year) && year >= 1900 && year <= 2030 ? year : undefined;
    };
    /**
     * Get available makes for a given year
     * @param year - Model year
     * @returns Array of available makes
     */
    NHTSAService.getMakesForYear = function (year) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        url = "".concat(this.BASE_URL, "/vehicles/GetMakesForYear/").concat(year, "?format=json");
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch makes for year ".concat(year));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        return [2 /*return*/, ((_a = data.Results) === null || _a === void 0 ? void 0 : _a.map(function (item) { return item.Make_Name; })) || []];
                    case 3:
                        error_2 = _b.sent();
                        console.error('[NHTSA Service] Error fetching makes:', error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available models for a make and year
     * @param make - Vehicle make
     * @param year - Model year
     * @returns Array of available models
     */
    NHTSAService.getModelsForMakeAndYear = function (make, year) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        url = "".concat(this.BASE_URL, "/vehicles/GetModelsForMakeYear/make/").concat(encodeURIComponent(make), "/modelyear/").concat(year, "?format=json");
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch models for ".concat(make, " ").concat(year));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        return [2 /*return*/, ((_a = data.Results) === null || _a === void 0 ? void 0 : _a.map(function (item) { return item.Model_Name; })) || []];
                    case 3:
                        error_3 = _b.sent();
                        console.error('[NHTSA Service] Error fetching models:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NHTSAService.BASE_URL = 'https://vpic.nhtsa.dot.gov/api';
    NHTSAService.REQUEST_TIMEOUT = 10000; // 10 seconds
    return NHTSAService;
}());
exports.NHTSAService = NHTSAService;
