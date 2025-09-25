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
var express_1 = require("express");
var userRoutes_1 = require("./userRoutes");
var inventoryRoutes_1 = require("./inventoryRoutes");
var salesRoutes_1 = require("./salesRoutes");
var settingsRoutes_1 = require("./settingsRoutes");
var router = (0, express_1.Router)();
// Mount route modules
router.use("/auth", userRoutes_1.default);
router.use("/users", userRoutes_1.default); // For admin user management
router.use("/inventory", inventoryRoutes_1.default);
router.use("/sales", salesRoutes_1.default);
router.use("/settings", settingsRoutes_1.default);
// Add a compatibility route for stats that was in the old routes
router.get("/stats", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var getSalesStats, _a, authenticateToken_1, requireAnyRole_1, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require("../controllers"); })];
            case 1:
                getSalesStats = (_b.sent()).getSalesStats;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("../middleware"); })];
            case 2:
                _a = _b.sent(), authenticateToken_1 = _a.authenticateToken, requireAnyRole_1 = _a.requireAnyRole;
                // Apply middleware manually
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        authenticateToken_1(req, res, function (err) {
                            if (err)
                                reject(err);
                            else
                                resolve();
                        });
                    })];
            case 3:
                // Apply middleware manually
                _b.sent();
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        requireAnyRole_1(req, res, function (err) {
                            if (err)
                                reject(err);
                            else
                                resolve();
                        });
                    })];
            case 4:
                _b.sent();
                return [2 /*return*/, getSalesStats(req, res, next)];
            case 5:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
