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
exports.StockNumberService = void 0;
var models_1 = require("../models");
var StockNumberService = /** @class */ (function () {
    function StockNumberService() {
    }
    /**
     * Generates a new stock number based on the configured rules
     * and atomically increments the sequential counter
     */
    StockNumberService.generateStockNumber = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var settingsUpdate, sequentialNumber, settings, prefix, suffix, stockNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, models_1.Settings.findOneAndUpdate({}, {
                            $inc: { stockNumberSequentialCounter: 1 },
                            $setOnInsert: {
                                stockNumberPrefixRule: { type: "none" },
                                stockNumberSuffixRule: { type: "none" },
                                make: [],
                                sources: [],
                                years: [],
                                status: [],
                                model: [],
                                colors: [],
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        }, { upsert: true, new: false, setDefaultsOnInsert: true })];
                    case 1:
                        settingsUpdate = _a.sent();
                        sequentialNumber = settingsUpdate
                            ? settingsUpdate.stockNumberSequentialCounter
                            : 101441;
                        return [4 /*yield*/, models_1.Settings.findOne({})];
                    case 2:
                        settings = _a.sent();
                        if (!settings) {
                            throw new Error("Failed to retrieve settings after counter increment");
                        }
                        prefix = this.generateRulePart(settings.stockNumberPrefixRule || { type: "none" }, settings, context);
                        suffix = this.generateRulePart(settings.stockNumberSuffixRule || { type: "none" }, settings, context);
                        stockNumber = "".concat(prefix).concat(sequentialNumber).concat(suffix);
                        return [2 /*return*/, stockNumber];
                }
            });
        });
    };
    /**
     * Generates a prefix or suffix based on the rule configuration
     */
    StockNumberService.generateRulePart = function (rule, settings, context) {
        switch (rule.type) {
            case "none":
                return "";
            case "source":
                // Use provided source code or fall back to first available source
                if (context === null || context === void 0 ? void 0 : context.sourceCode) {
                    return context.sourceCode.substring(0, 2).toUpperCase();
                }
                if (settings.sources && settings.sources.length > 0) {
                    return settings.sources[0].substring(0, 2).toUpperCase();
                }
                return "";
            case "buyer":
                // Use provided buyer ID or fall back to first available buyer
                if (context === null || context === void 0 ? void 0 : context.buyerId) {
                    return context.buyerId.substring(0, 2).toUpperCase();
                }
                if (settings.buyers && settings.buyers.length > 0) {
                    return settings.buyers[0].id.substring(0, 2).toUpperCase();
                }
                return "";
            case "custom":
                // TypeScript knows this has customValue because of discriminated union
                return rule.customValue || "";
            default:
                return "";
        }
    };
    return StockNumberService;
}());
exports.StockNumberService = StockNumberService;
