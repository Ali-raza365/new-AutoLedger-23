"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.Sales = exports.Inventory = exports.User = void 0;
// Export all models from a single entry point
var User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
var Inventory_1 = require("./Inventory");
Object.defineProperty(exports, "Inventory", { enumerable: true, get: function () { return Inventory_1.Inventory; } });
var Sales_1 = require("./Sales");
Object.defineProperty(exports, "Sales", { enumerable: true, get: function () { return Sales_1.Sales; } });
var Settings_1 = require("./Settings");
Object.defineProperty(exports, "Settings", { enumerable: true, get: function () { return Settings_1.Settings; } });
