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
exports.getSalesStats = exports.searchSales = exports.deleteSalesItem = exports.updateSalesItem = exports.createSalesItem = exports.getSalesById = exports.getAllSales = void 0;
var models_1 = require("../models");
var schema_1 = require("@shared/schema");
var errors_1 = require("../utils/errors");
var response_1 = require("../utils/response");
var middleware_1 = require("../middleware");
exports.getAllSales = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sales;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, models_1.Sales.find({}).sort({ createdAt: -1 })];
            case 1:
                sales = _a.sent();
                (0, response_1.sendSuccess)(res, sales, "Sales retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.getSalesById = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, sale;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, models_1.Sales.findById(id)];
            case 1:
                sale = _a.sent();
                if (!sale) {
                    throw new errors_1.NotFoundError("Sales record not found");
                }
                (0, response_1.sendSuccess)(res, sale, "Sales record retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.createSalesItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var validatedData, inventoryItem, sale;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validatedData = schema_1.insertSalesSchema.parse(req.body);
                return [4 /*yield*/, models_1.Inventory.findOne({ stockNumber: validatedData.stockNumber })];
            case 1:
                inventoryItem = _a.sent();
                if (!inventoryItem) {
                    throw new errors_1.ValidationError("Stock number not found in inventory");
                }
                return [4 /*yield*/, models_1.Sales.create(__assign(__assign({}, validatedData), { createdAt: new Date() }))];
            case 2:
                sale = _a.sent();
                (0, response_1.sendSuccess)(res, sale, "Sales record created successfully", 201);
                return [2 /*return*/];
        }
    });
}); });
exports.updateSalesItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, validatedData, inventoryItem, sale;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                validatedData = schema_1.insertSalesSchema.partial().parse(req.body);
                if (!validatedData.stockNumber) return [3 /*break*/, 2];
                return [4 /*yield*/, models_1.Inventory.findOne({ stockNumber: validatedData.stockNumber })];
            case 1:
                inventoryItem = _a.sent();
                if (!inventoryItem) {
                    throw new errors_1.ValidationError("Stock number not found in inventory");
                }
                _a.label = 2;
            case 2: return [4 /*yield*/, models_1.Sales.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true })];
            case 3:
                sale = _a.sent();
                if (!sale) {
                    throw new errors_1.NotFoundError("Sales record not found");
                }
                (0, response_1.sendSuccess)(res, sale, "Sales record updated successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.deleteSalesItem = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, sale;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, models_1.Sales.findByIdAndDelete(id)];
            case 1:
                sale = _a.sent();
                if (!sale) {
                    throw new errors_1.NotFoundError("Sales record not found");
                }
                (0, response_1.sendSuccess)(res, null, "Sales record deleted successfully");
                return [2 /*return*/];
        }
    });
}); });
exports.searchSales = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var query, searchResults;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.params.query;
                return [4 /*yield*/, models_1.Sales.find({
                        $or: [
                            { dealNumber: { $regex: query, $options: "i" } },
                            { firstName: { $regex: query, $options: "i" } },
                            { lastName: { $regex: query, $options: "i" } },
                            { customerNumber: { $regex: query, $options: "i" } },
                            { stockNumber: { $regex: query, $options: "i" } },
                        ]
                    }).sort({ createdAt: -1 })];
            case 1:
                searchResults = _a.sent();
                (0, response_1.sendSuccess)(res, searchResults, "Found ".concat(searchResults.length, " matching sales records"));
                return [2 /*return*/];
        }
    });
}); });
exports.getSalesStats = (0, middleware_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var currentMonth, currentYear, salesThisMonth, totalRevenue, totalInventory, inventoryItems, avgAge;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currentMonth = new Date().getMonth();
                currentYear = new Date().getFullYear();
                return [4 /*yield*/, models_1.Sales.find({
                        createdAt: {
                            $gte: new Date(currentYear, currentMonth, 1),
                            $lt: new Date(currentYear, currentMonth + 1, 1)
                        }
                    })];
            case 1:
                salesThisMonth = _a.sent();
                totalRevenue = salesThisMonth.reduce(function (sum, sale) {
                    return sum + Number(sale.salesPrice);
                }, 0);
                return [4 /*yield*/, models_1.Inventory.countDocuments()];
            case 2:
                totalInventory = _a.sent();
                return [4 /*yield*/, models_1.Inventory.find({}, { age: 1 })];
            case 3:
                inventoryItems = _a.sent();
                avgAge = inventoryItems.length > 0
                    ? inventoryItems.reduce(function (sum, item) { return sum + (item.age || 0); }, 0) / inventoryItems.length
                    : 0;
                (0, response_1.sendSuccess)(res, {
                    totalInventory: totalInventory,
                    salesThisMonth: salesThisMonth.length,
                    revenue: totalRevenue,
                    avgDaysInLot: Math.round(avgAge),
                }, "Statistics retrieved successfully");
                return [2 /*return*/];
        }
    });
}); });
