var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/env.ts
var env, isDevelopment, isProduction;
var init_env = __esm({
  "server/config/env.ts"() {
    "use strict";
    env = {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "3000",
      DATABASE_URL: process.env.DATABASE_URL || "mongodb+srv://new_user:db123456@cluster0.nug88fr.mongodb.net/dealerpro",
      MONGODB_URL: process.env.MONGODB_URL || "mongodb+srv://new_user:db123456@cluster0.nug88fr.mongodb.net/dealerpro",
      JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d"
    };
    isDevelopment = process.env.NODE_ENV === "development";
    isProduction = process.env.NODE_ENV === "production";
  }
});

// server/utils/errors.ts
var AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError;
var init_errors = __esm({
  "server/utils/errors.ts"() {
    "use strict";
    AppError = class extends Error {
      statusCode;
      isOperational;
      constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
      }
    };
    ValidationError = class extends AppError {
      constructor(message) {
        super(message, 400);
      }
    };
    NotFoundError = class extends AppError {
      constructor(message = "Resource not found") {
        super(message, 404);
      }
    };
    UnauthorizedError = class extends AppError {
      constructor(message = "Unauthorized access") {
        super(message, 401);
      }
    };
    ForbiddenError = class extends AppError {
      constructor(message = "Access forbidden") {
        super(message, 403);
      }
    };
    ConflictError = class extends AppError {
      constructor(message = "Resource conflict") {
        super(message, 409);
      }
    };
  }
});

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
var authenticateToken, authorizeRoles, requireAdmin, requireManagerOrAdmin, requireAnyRole, generateToken, hashPassword, comparePassword;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    init_env();
    init_errors();
    authenticateToken = async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
          throw new UnauthorizedError("Access token required");
        }
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          next(new UnauthorizedError("Invalid token"));
        } else if (error instanceof jwt.TokenExpiredError) {
          next(new UnauthorizedError("Token expired"));
        } else {
          next(error);
        }
      }
    };
    authorizeRoles = (...allowedRoles) => {
      return (req, res, next) => {
        if (!req.user) {
          next(new UnauthorizedError("Authentication required"));
          return;
        }
        if (!allowedRoles.includes(req.user.userType)) {
          next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`));
          return;
        }
        next();
      };
    };
    requireAdmin = authorizeRoles("admin");
    requireManagerOrAdmin = authorizeRoles("admin", "manager");
    requireAnyRole = authorizeRoles("admin", "manager", "employee");
    generateToken = (payload) => {
      return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
      });
    };
    hashPassword = async (password) => {
      const saltRounds = 12;
      return bcrypt.hash(password, saltRounds);
    };
    comparePassword = async (plainPassword, hashedPassword) => {
      return bcrypt.compare(plainPassword, hashedPassword);
    };
  }
});

// server/utils/response.ts
var sendSuccess, sendError, sendValidationError;
var init_response = __esm({
  "server/utils/response.ts"() {
    "use strict";
    sendSuccess = (res, data, message = "Success", statusCode = 200) => {
      const response = {
        success: true,
        message,
        data
      };
      return res.status(statusCode).json(response);
    };
    sendError = (res, message = "Internal Server Error", statusCode = 500, errors) => {
      const response = {
        success: false,
        message,
        errors
      };
      return res.status(statusCode).json(response);
    };
    sendValidationError = (res, errors, message = "Validation failed") => {
      return sendError(res, message, 400, errors);
    };
  }
});

// server/middleware/errorHandler.ts
import { ZodError } from "zod";
var errorHandler, asyncHandler;
var init_errorHandler = __esm({
  "server/middleware/errorHandler.ts"() {
    "use strict";
    init_errors();
    init_response();
    init_env();
    errorHandler = (err, req, res, next) => {
      if (err instanceof ZodError) {
        return sendValidationError(res, err.errors, "Validation failed");
      }
      if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode);
      }
      if (err.name === "MongoServerError" && err.code === 11e3) {
        const field = Object.keys(err.keyValue)[0];
        return sendError(res, `Duplicate value for field: ${field}`, 409);
      }
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        return sendValidationError(res, errors, "Database validation failed");
      }
      if (err.name === "JsonWebTokenError") {
        return sendError(res, "Invalid token", 401);
      }
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Token expired", 401);
      }
      if (isDevelopment) {
        console.error("Unexpected error:", err);
      }
      return sendError(res, "Internal server error", 500);
    };
    asyncHandler = (fn) => {
      return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };
    };
  }
});

// server/middleware/validation.ts
import { z } from "zod";
var validateBody, validateParams, validateQuery;
var init_validation = __esm({
  "server/middleware/validation.ts"() {
    "use strict";
    init_response();
    validateBody = (schema) => {
      return (req, res, next) => {
        try {
          req.body = schema.parse(req.body);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            sendValidationError(res, error.errors, "Request validation failed");
            return;
          }
          next(error);
        }
      };
    };
    validateParams = (schema) => {
      return (req, res, next) => {
        try {
          req.params = schema.parse(req.params);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            sendValidationError(res, error.errors, "Parameter validation failed");
            return;
          }
          next(error);
        }
      };
    };
    validateQuery = (schema) => {
      return (req, res, next) => {
        try {
          req.query = schema.parse(req.query);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            sendValidationError(res, error.errors, "Query validation failed");
            return;
          }
          next(error);
        }
      };
    };
  }
});

// server/middleware/index.ts
var middleware_exports = {};
__export(middleware_exports, {
  asyncHandler: () => asyncHandler,
  authenticateToken: () => authenticateToken,
  authorizeRoles: () => authorizeRoles,
  comparePassword: () => comparePassword,
  errorHandler: () => errorHandler,
  generateToken: () => generateToken,
  hashPassword: () => hashPassword,
  requireAdmin: () => requireAdmin,
  requireAnyRole: () => requireAnyRole,
  requireManagerOrAdmin: () => requireManagerOrAdmin,
  validateBody: () => validateBody,
  validateParams: () => validateParams,
  validateQuery: () => validateQuery
});
var init_middleware = __esm({
  "server/middleware/index.ts"() {
    "use strict";
    init_auth();
    init_errorHandler();
    init_validation();
  }
});

// server/models/User.ts
import mongoose2, { Schema } from "mongoose";
var userSchema, User;
var init_User = __esm({
  "server/models/User.ts"() {
    "use strict";
    userSchema = new Schema({
      username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      password: {
        type: String,
        required: true,
        minlength: 6
      },
      userType: {
        type: String,
        enum: ["admin", "manager", "employee"],
        required: true,
        default: "employee"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }, {
      collection: "users",
      timestamps: false
      // We manage createdAt manually
    });
    userSchema.index({ email: 1 });
    userSchema.index({ username: 1 });
    userSchema.set("toJSON", {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    });
    User = mongoose2.model("User", userSchema);
  }
});

// server/models/Inventory.ts
import mongoose3, { Schema as Schema2 } from "mongoose";
var auditTrailSchema, inventorySchema, Inventory;
var init_Inventory = __esm({
  "server/models/Inventory.ts"() {
    "use strict";
    auditTrailSchema = new Schema2({
      user: {
        type: String,
        required: true,
        trim: true
      },
      action: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        required: true,
        default: Date.now
      }
    }, { _id: false });
    inventorySchema = new Schema2({
      stockNumber: {
        type: String,
        required: true,
        trim: true
      },
      vin: {
        type: String,
        required: true,
        minlength: 17,
        maxlength: 17,
        uppercase: true,
        trim: true,
        match: /^[A-HJ-NPR-Z0-9]{17}$/i
        // Valid VIN pattern
      },
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: 2030
      },
      make: {
        type: String,
        required: true,
        trim: true
      },
      model: {
        type: String,
        required: true,
        trim: true
      },
      series: {
        type: String,
        trim: true
      },
      color: {
        type: String,
        required: true,
        trim: true
      },
      certified: {
        type: Boolean,
        default: false
      },
      body: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      bookValue: {
        type: Number,
        default: null,
        min: 0
      },
      cost: {
        type: Number,
        default: null,
        min: 0
      },
      markup: {
        type: Number,
        default: null
      },
      odometer: {
        type: Number,
        required: true,
        min: 0
      },
      age: {
        type: Number,
        default: null
      },
      // New expanded fields for comprehensive inventory management
      dateLogged: {
        type: Date,
        default: Date.now
      },
      trim: {
        type: String,
        trim: true,
        default: null
      },
      // Purchase Information
      purchaseDate: {
        type: Date,
        default: null
      },
      channel: {
        type: String,
        trim: true,
        default: null
      },
      specificSource: {
        type: String,
        trim: true,
        default: null
      },
      buyerName: {
        type: String,
        trim: true,
        default: null
      },
      buyerId: {
        type: String,
        trim: true,
        default: null
      },
      storeLocation: {
        type: String,
        trim: true,
        default: null
      },
      purchasePrice: {
        type: String,
        default: null
      },
      customerName: {
        type: String,
        trim: true,
        default: null
      },
      dealNumber: {
        type: String,
        trim: true,
        default: null
      },
      // Financial Analysis
      mmrValue: {
        type: String,
        default: null
      },
      kbbWholesale: {
        type: String,
        default: null
      },
      marketVariance: {
        type: String,
        default: null
      },
      plannedRetail: {
        type: String,
        default: null
      },
      estReconCost: {
        type: String,
        default: null
      },
      projectedGross: {
        type: String,
        default: null
      },
      // Status & Approval
      hqAppraisalSuggested: {
        type: Boolean,
        default: false
      },
      redFlagStatus: {
        type: String,
        trim: true,
        default: null
      },
      currentStatus: {
        type: String,
        trim: true,
        default: null
      },
      statusDate: {
        type: Date,
        default: null
      },
      newUsed: {
        type: String,
        required: true,
        enum: ["New", "Used"]
      },
      // Audit Trail
      auditTrail: [auditTrailSchema],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }, {
      collection: "inventory",
      timestamps: false
      // We manage createdAt manually
    });
    inventorySchema.index({ vin: 1 });
    inventorySchema.index({ stockNumber: 1 });
    inventorySchema.index({ make: 1, model: 1 });
    inventorySchema.index({ year: 1 });
    inventorySchema.index({ price: 1 });
    inventorySchema.index({
      vin: "text",
      make: "text",
      model: "text",
      stockNumber: "text",
      color: "text"
    });
    inventorySchema.pre("save", function(next) {
      if (this.price && this.cost) {
        if (typeof this.price === "number" && typeof this.cost === "number") {
          this.markup = this.price - this.cost;
        }
      }
      next();
    });
    inventorySchema.set("toJSON", {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });
    Inventory = mongoose3.model("Inventory", inventorySchema);
  }
});

// server/models/Sales.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var salesSchema, Sales;
var init_Sales = __esm({
  "server/models/Sales.ts"() {
    "use strict";
    salesSchema = new Schema3({
      dealNumber: {
        type: String,
        required: true,
        trim: true
      },
      customerNumber: {
        type: String,
        trim: true,
        default: null
      },
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      },
      zip: {
        type: String,
        trim: true,
        default: null
      },
      exteriorColor: {
        type: String,
        trim: true,
        default: null
      },
      newUsed: {
        type: String,
        required: true,
        enum: ["New", "Used"]
      },
      stockNumber: {
        type: String,
        required: true,
        trim: true
      },
      deliveryDate: {
        type: Date,
        default: null
      },
      deliveryMileage: {
        type: Number,
        min: 0,
        default: null
      },
      // Trade 1 information
      trade1Vin: {
        type: String,
        length: 17,
        uppercase: true,
        trim: true,
        default: null
      },
      trade1Year: {
        type: Number,
        min: 1900,
        max: 2030,
        default: null
      },
      trade1Make: {
        type: String,
        trim: true,
        default: null
      },
      trade1Model: {
        type: String,
        trim: true,
        default: null
      },
      trade1Odometer: {
        type: Number,
        min: 0,
        default: null
      },
      trade1ACV: {
        type: String,
        default: null
      },
      // Trade 2 information
      trade2Vin: {
        type: String,
        length: 17,
        uppercase: true,
        trim: true,
        default: null
      },
      trade2Year: {
        type: Number,
        min: 1900,
        max: 2030,
        default: null
      },
      trade2Make: {
        type: String,
        trim: true,
        default: null
      },
      trade2Model: {
        type: String,
        trim: true,
        default: null
      },
      trade2Odometer: {
        type: Number,
        min: 0,
        default: null
      },
      trade2ACV: {
        type: String,
        default: null
      },
      // Manager and staff information
      closingManagerNumber: {
        type: String,
        trim: true,
        default: null
      },
      closingManagerName: {
        type: String,
        trim: true,
        default: null
      },
      financeManagerNumber: {
        type: String,
        trim: true,
        default: null
      },
      financeManagerName: {
        type: String,
        trim: true,
        default: null
      },
      salesmanNumber: {
        type: String,
        trim: true,
        default: null
      },
      salesmanName: {
        type: String,
        trim: true,
        default: null
      },
      // Pricing information
      msrp: {
        type: String,
        default: null
      },
      listPrice: {
        type: String,
        default: null
      },
      salesPrice: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }, {
      collection: "sales",
      timestamps: false
      // We manage createdAt manually
    });
    salesSchema.index({ dealNumber: 1 });
    salesSchema.index({ stockNumber: 1 });
    salesSchema.index({ firstName: 1, lastName: 1 });
    salesSchema.index({ customerNumber: 1 });
    salesSchema.index({ deliveryDate: 1 });
    salesSchema.index({ createdAt: 1 });
    salesSchema.index({
      dealNumber: "text",
      firstName: "text",
      lastName: "text",
      customerNumber: "text"
    });
    salesSchema.set("toJSON", {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });
    Sales = mongoose4.model("Sales", salesSchema);
  }
});

// server/models/Settings.ts
import mongoose5, { Schema as Schema4 } from "mongoose";
var buyerInfoSchema, colorOptionSchema, UserSchema, stockNumberRuleSchema, settingsSchema, Settings;
var init_Settings = __esm({
  "server/models/Settings.ts"() {
    "use strict";
    buyerInfoSchema = new Schema4({
      id: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    }, { _id: false });
    colorOptionSchema = new Schema4({
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    }, { _id: false });
    UserSchema = new Schema4({
      code: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      roles: {
        type: [String],
        enum: ["sales", "closer", "manager", "finance", "source"],
        default: []
      }
    }, { _id: false });
    stockNumberRuleSchema = new mongoose5.Schema(
      {
        type: {
          type: String,
          enum: ["none", "source", "buyer", "custom"],
          required: true,
          trim: true
        },
        customValue: {
          type: String,
          trim: true
        }
      },
      { _id: false }
      // prevents creating a separate _id for this subdocument
    );
    settingsSchema = new Schema4({
      sources: [{
        type: String,
        required: true,
        trim: true
      }],
      years: [{
        type: Number,
        required: true,
        min: 1900,
        max: 2100
      }],
      status: [{
        type: String,
        required: true,
        trim: true
      }],
      colors: [colorOptionSchema],
      users: {
        type: [UserSchema],
        default: []
      },
      // Business Configuration
      rooftopCode: {
        type: String,
        trim: true,
        default: null
      },
      hqPriceThreshold: {
        type: Number,
        min: 0,
        default: null
      },
      minGrossProfit: {
        type: Number,
        min: 0,
        default: null
      },
      maxReconPercentage: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      },
      buyers: [buyerInfoSchema],
      channels: [{
        type: String,
        trim: true
      }],
      // Stock Number Configuration
      stockNumberPrefixRule: {
        type: stockNumberRuleSchema,
        required: true
      },
      stockNumberSuffixRule: {
        type: stockNumberRuleSchema,
        required: true
      },
      stockNumberSequentialCounter: {
        type: Number,
        min: 0,
        default: 1e3
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }, {
      collection: "settings",
      timestamps: false
      // We manage timestamps manually
    });
    settingsSchema.pre("save", function(next) {
      this.updatedAt = /* @__PURE__ */ new Date();
      next();
    });
    settingsSchema.set("toJSON", {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });
    Settings = mongoose5.model("Settings", settingsSchema);
  }
});

// server/models/index.ts
var init_models = __esm({
  "server/models/index.ts"() {
    "use strict";
    init_User();
    init_Inventory();
    init_Sales();
    init_Settings();
  }
});

// shared/schema.ts
import { z as z2 } from "zod";
var insertInventorySchema, colorOptionSchema2, insertSalesSchema, buyerInfoSchema2, userOptionSchema, insertSettingsSchema, registerUserSchema, loginUserSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    insertInventorySchema = z2.object({
      // Basic Vehicle Information
      stockNumber: z2.string().min(1, "Stock number is required"),
      dateLogged: z2.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
          return new Date(val);
        }
        return val;
      }, z2.date()).optional().default(() => /* @__PURE__ */ new Date()),
      vin: z2.string().length(17, "VIN must be exactly 17 characters"),
      year: z2.number().min(1900).max(2030).optional(),
      make: z2.string().optional(),
      model: z2.string().optional(),
      newUsed: z2.string().optional(),
      trim: z2.string().optional(),
      series: z2.string().optional(),
      color: z2.string().optional(),
      certified: z2.boolean().default(false),
      body: z2.string().optional(),
      odometer: z2.number().min(0, "Odometer cannot be negative"),
      // Purchase Information
      purchaseDate: z2.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
          return new Date(val);
        }
        return val;
      }, z2.date()).optional().default(() => /* @__PURE__ */ new Date()),
      channel: z2.string().optional().nullable(),
      specificSource: z2.string().optional().nullable(),
      buyerName: z2.string().optional().nullable(),
      buyerId: z2.string().optional().nullable(),
      storeLocation: z2.string().optional().nullable(),
      purchasePrice: z2.string().optional().nullable(),
      customerName: z2.string().optional().nullable(),
      dealNumber: z2.string().optional().nullable(),
      // Financial Analysis
      price: z2.number().min(0, "Price must be a positive number"),
      bookValue: z2.number().min(0).optional().nullable(),
      cost: z2.number().min(0).optional().nullable(),
      markup: z2.number().optional().nullable(),
      mmrValue: z2.string().optional().nullable(),
      kbbWholesale: z2.string().optional().nullable(),
      marketVariance: z2.string().optional().nullable(),
      plannedRetail: z2.string().optional().nullable(),
      estReconCost: z2.string().optional().nullable(),
      projectedGross: z2.string().optional().nullable(),
      // Status & Approval
      hqAppraisalSuggested: z2.boolean().optional().default(false),
      redFlagStatus: z2.string().optional().nullable(),
      currentStatus: z2.string().optional().nullable(),
      statusDate: z2.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
          return new Date(val);
        }
        return val;
      }, z2.date()).optional().default(() => /* @__PURE__ */ new Date()),
      // Legacy fields for backward compatibility
      age: z2.number().optional().nullable()
    });
    colorOptionSchema2 = z2.object({
      code: z2.string().min(1, "Color code is required"),
      name: z2.string().min(1, "Color name is required")
    });
    insertSalesSchema = z2.object({
      dealNumber: z2.string().min(1, "Deal number is required"),
      customerNumber: z2.string().optional(),
      firstName: z2.string().min(1, "First name is required"),
      lastName: z2.string().min(1, "Last name is required"),
      zip: z2.string().optional(),
      exteriorColor: z2.string().optional(),
      newUsed: z2.string().min(1, "New/Used status is required"),
      stockNumber: z2.string().min(1, "Stock number is required"),
      deliveryDate: z2.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
          return new Date(val);
        }
        return val;
      }, z2.date()).optional().default(() => /* @__PURE__ */ new Date()),
      deliveryMileage: z2.number().optional(),
      trade1Vin: z2.string().length(17).optional().or(z2.literal("")),
      trade1Year: z2.number().optional(),
      trade1Make: z2.string().optional(),
      trade1Model: z2.string().optional(),
      trade1Odometer: z2.number().optional(),
      trade1ACV: z2.string().optional().nullable(),
      trade2Vin: z2.string().length(17).optional().or(z2.literal("")),
      trade2Year: z2.number().optional(),
      trade2Make: z2.string().optional(),
      trade2Model: z2.string().optional(),
      trade2Odometer: z2.number().optional(),
      trade2ACV: z2.string().optional().nullable(),
      closingManagerNumber: z2.string().optional(),
      closingManagerName: z2.string().optional(),
      financeManagerNumber: z2.string().optional(),
      financeManagerName: z2.string().optional(),
      salesmanNumber: z2.string().optional(),
      salesmanName: z2.string().optional(),
      msrp: z2.string().optional().nullable(),
      listPrice: z2.string().optional().nullable(),
      salesPrice: z2.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Sales price must be positive")
    });
    buyerInfoSchema2 = z2.object({
      id: z2.string().min(1, "Buyer ID is required"),
      name: z2.string().min(1, "Buyer name is required")
    });
    userOptionSchema = z2.object({
      code: z2.string().min(1, "User code is required."),
      name: z2.string().min(1, "User name is required."),
      roles: z2.array(z2.enum(["sales", "closer", "manager", "finance", "source"])).default([])
    });
    insertSettingsSchema = z2.object({
      // Vehicle Configuration
      sources: z2.array(z2.string().min(1, "Source cannot be empty")),
      years: z2.array(z2.number().min(1900).max(2100)),
      status: z2.array(z2.string().min(1, "Status cannot be empty")),
      users: z2.array(userOptionSchema),
      colors: z2.array(colorOptionSchema2),
      // Business Configuration
      rooftopCode: z2.string().nullable().optional(),
      hqPriceThreshold: z2.number().min(0).nullable().optional(),
      minGrossProfit: z2.number().min(0).nullable().optional(),
      maxReconPercentage: z2.number().min(0).max(1).nullable().optional(),
      buyers: z2.array(buyerInfoSchema2).optional(),
      channels: z2.array(z2.string().min(1, "Channel cannot be empty")).optional(),
      stockNumberPrefixRule: z2.object({
        type: z2.enum(["none", "source", "buyer", "custom"]),
        customValue: z2.string().optional()
      }).optional(),
      stockNumberSuffixRule: z2.object({
        type: z2.enum(["none", "source", "buyer", "custom"]),
        customValue: z2.string().optional()
      }).optional(),
      stockNumberSequentialCounter: z2.number().min(1).optional()
    });
    registerUserSchema = z2.object({
      username: z2.string().min(3, "Username must be at least 3 characters").max(50),
      email: z2.string().email("Invalid email format"),
      password: z2.string().min(6, "Password must be at least 6 characters"),
      userType: z2.enum(["admin", "manager", "employee"])
    });
    loginUserSchema = z2.object({
      email: z2.string().email("Invalid email format"),
      password: z2.string().min(1, "Password is required")
    });
  }
});

// server/controllers/userController.ts
var registerUser, loginUser, getCurrentUser, getAllUsers, getUserById, updateUser, deleteUser;
var init_userController = __esm({
  "server/controllers/userController.ts"() {
    "use strict";
    init_models();
    init_schema();
    init_middleware();
    init_errors();
    init_response();
    init_middleware();
    registerUser = asyncHandler(async (req, res, next) => {
      const validatedData = registerUserSchema.parse(req.body);
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
      const existingUsername = await User.findOne({ username: validatedData.username });
      if (existingUsername) {
        throw new ConflictError("Username already taken");
      }
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await User.create({
        ...validatedData,
        password: hashedPassword
      });
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType
      };
      const token = generateToken(tokenPayload);
      sendSuccess(res, {
        user: user.toJSON(),
        // This will exclude password due to transform
        token
      }, "User registered successfully", 201);
    });
    loginUser = asyncHandler(async (req, res, next) => {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await User.findOne({ email: validatedData.email });
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedError("Invalid email or password");
      }
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType
      };
      const token = generateToken(tokenPayload);
      sendSuccess(res, {
        user: user.toJSON(),
        // This will exclude password due to transform
        token
      }, "Login successful");
    });
    getCurrentUser = asyncHandler(async (req, res, next) => {
      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      sendSuccess(res, { user: user.toJSON() }, "User data retrieved successfully");
    });
    getAllUsers = asyncHandler(async (req, res, next) => {
      const users = await User.find({}).select("-password");
      sendSuccess(res, { users }, "Users retrieved successfully");
    });
    getUserById = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const user = await User.findById(id).select("-password");
      if (!user) {
        throw new NotFoundError("User not found");
      }
      sendSuccess(res, { user }, "User retrieved successfully");
    });
    updateUser = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const updateData = req.body;
      if (updateData.password) {
        delete updateData.password;
      }
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
      if (!user) {
        throw new NotFoundError("User not found");
      }
      sendSuccess(res, { user }, "User updated successfully");
    });
    deleteUser = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      sendSuccess(res, null, "User deleted successfully");
    });
  }
});

// server/services/nhtsaService.ts
var NHTSAService;
var init_nhtsaService = __esm({
  "server/services/nhtsaService.ts"() {
    "use strict";
    NHTSAService = class {
      static BASE_URL = "https://vpic.nhtsa.dot.gov/api";
      static REQUEST_TIMEOUT = 1e4;
      // 10 seconds
      /**
       * Decode VIN and extract vehicle information
       * @param vin - 17 character VIN number
       * @param modelYear - Optional model year for better accuracy
       * @returns Processed vehicle data
       */
      static async decodeVIN(vin, modelYear) {
        try {
          if (!vin || vin.length !== 17) {
            throw new Error("VIN must be exactly 17 characters");
          }
          const cleanVin = vin.replace(/[^A-HJ-NPR-Z0-9]/gi, "").toUpperCase();
          if (cleanVin.length !== 17) {
            throw new Error("Invalid VIN format - contains invalid characters");
          }
          const yearParam = modelYear ? `&modelyear=${modelYear}` : "";
          const url = `${this.BASE_URL}/vehicles/DecodeVinValues/${cleanVin}?format=json${yearParam}`;
          console.log(`[NHTSA Service] Decoding VIN: ${cleanVin}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "DealerPro-VIN-Decoder/1.0",
              "Accept": "application/json"
            }
          });
          console.log({ response });
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`NHTSA API request failed: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          console.log({ data });
          if (!data.Results || data.Results.length === 0) {
            throw new Error("No vehicle data found for the provided VIN");
          }
          return this.processVehicleData(data.Results);
        } catch (error) {
          console.error("[NHTSA Service] VIN decode error:", error);
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Unable to connect to NHTSA API service");
          }
          throw error;
        }
      }
      /**
       * Process raw NHTSA API response into structured vehicle data
       * @param results - Array of NHTSA variable-value pairs
       * @returns Processed vehicle data object
       */
      static processVehicleData(results) {
        const vehicleData = {};
        console.log({ results });
        const decoded = results[0];
        const dataMap = /* @__PURE__ */ new Map();
        Object.entries(decoded).forEach(([key, value]) => {
          if (typeof value === "string" && value.trim() && value !== "Not Applicable") {
            dataMap.set(key, value.trim());
          }
        });
        vehicleData.make = dataMap.get("Make") || void 0;
        vehicleData.model = dataMap.get("Model") || void 0;
        vehicleData.year = this.parseYear(dataMap.get("ModelYear"));
        vehicleData.trim = dataMap.get("Trim") || dataMap.get("Series") || void 0;
        vehicleData.series = dataMap.get("Series") || void 0;
        vehicleData.bodyClass = dataMap.get("BodyClass") || void 0;
        vehicleData.engineModel = dataMap.get("EngineModel") || void 0;
        vehicleData.fuelType = dataMap.get("FuelTypePrimary") || void 0;
        vehicleData.transmission = dataMap.get("TransmissionStyle") || void 0;
        vehicleData.driveType = dataMap.get("DriveType") || void 0;
        vehicleData.manufacturerName = dataMap.get("Manufacturer") || void 0;
        vehicleData.plantCountry = dataMap.get("PlantCountry") || void 0;
        vehicleData.vehicleType = dataMap.get("VehicleType") || void 0;
        console.log(`[NHTSA Service] Processed vehicle data:`, vehicleData);
        return vehicleData;
      }
      /**
       * Parse year string to number
       * @param yearString - Year as string
       * @returns Year as number or undefined
       */
      static parseYear(yearString) {
        if (!yearString) return void 0;
        const year = parseInt(yearString, 10);
        return !isNaN(year) && year >= 1900 && year <= 2030 ? year : void 0;
      }
      /**
       * Get available makes for a given year
       * @param year - Model year
       * @returns Array of available makes
       */
      static async getMakesForYear(year) {
        try {
          const url = `${this.BASE_URL}/vehicles/GetMakesForYear/${year}?format=json`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch makes for year ${year}`);
          }
          const data = await response.json();
          return data.Results?.map((item) => item.Make_Name) || [];
        } catch (error) {
          console.error("[NHTSA Service] Error fetching makes:", error);
          return [];
        }
      }
      /**
       * Get available models for a make and year
       * @param make - Vehicle make
       * @param year - Model year  
       * @returns Array of available models
       */
      static async getModelsForMakeAndYear(make, year) {
        try {
          const url = `${this.BASE_URL}/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch models for ${make} ${year}`);
          }
          const data = await response.json();
          return data.Results?.map((item) => item.Model_Name) || [];
        } catch (error) {
          console.error("[NHTSA Service] Error fetching models:", error);
          return [];
        }
      }
    };
  }
});

// server/services/stockNumberService.ts
var StockNumberService;
var init_stockNumberService = __esm({
  "server/services/stockNumberService.ts"() {
    "use strict";
    init_models();
    StockNumberService = class {
      /**
       * Generates a new stock number based on the configured rules
       * and atomically increments the sequential counter
       */
      static async generateStockNumber(context) {
        const settingsUpdate = await Settings.findOneAndUpdate(
          {},
          {
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
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }
          },
          { upsert: true, new: false, setDefaultsOnInsert: true }
        );
        const sequentialNumber = settingsUpdate ? settingsUpdate.stockNumberSequentialCounter : 101441;
        const settings = await Settings.findOne({});
        if (!settings) {
          throw new Error("Failed to retrieve settings after counter increment");
        }
        const prefix = this.generateRulePart(
          settings.stockNumberPrefixRule || { type: "none" },
          settings,
          context
        );
        const suffix = this.generateRulePart(
          settings.stockNumberSuffixRule || { type: "none" },
          settings,
          context
        );
        const stockNumber = `${prefix}${sequentialNumber}${suffix}`;
        return stockNumber;
      }
      /**
       * Generates a prefix or suffix based on the rule configuration
       */
      static generateRulePart(rule, settings, context) {
        switch (rule.type) {
          case "none":
            return "";
          case "source":
            if (context?.sourceCode) {
              return context.sourceCode.substring(0, 2).toUpperCase();
            }
            if (settings.sources && settings.sources.length > 0) {
              return settings.sources[0].substring(0, 2).toUpperCase();
            }
            return "";
          case "buyer":
            if (context?.buyerId) {
              return context.buyerId.substring(0, 2).toUpperCase();
            }
            if (settings.buyers && settings.buyers.length > 0) {
              return settings.buyers[0].id.substring(0, 2).toUpperCase();
            }
            return "";
          case "custom":
            return rule.customValue || "";
          default:
            return "";
        }
      }
    };
  }
});

// server/controllers/inventoryController.ts
var getAllInventory, getInventoryById, getInventoryByVin, getInventoryByStockNumber, createInventoryItem, updateInventoryItem, deleteInventoryItem, searchInventory, lookupVinData;
var init_inventoryController = __esm({
  "server/controllers/inventoryController.ts"() {
    "use strict";
    init_models();
    init_schema();
    init_errors();
    init_response();
    init_middleware();
    init_nhtsaService();
    init_stockNumberService();
    getAllInventory = asyncHandler(async (req, res, next) => {
      const inventory = await Inventory.find({}).sort({ createdAt: -1 });
      sendSuccess(res, inventory, "Inventory retrieved successfully");
    });
    getInventoryById = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const item = await Inventory.findById(id);
      if (!item) {
        throw new NotFoundError("Inventory item not found");
      }
      sendSuccess(res, item, "Inventory item retrieved successfully");
    });
    getInventoryByVin = asyncHandler(async (req, res, next) => {
      const { vin } = req.params;
      const item = await Inventory.findOne({ vin: vin.toUpperCase() });
      if (!item) {
        throw new NotFoundError("Vehicle not found");
      }
      sendSuccess(res, item, "Vehicle retrieved successfully");
    });
    getInventoryByStockNumber = asyncHandler(async (req, res, next) => {
      const { stockNumber } = req.params;
      const item = await Inventory.findOne({ stockNumber });
      if (!item) {
        throw new NotFoundError("Vehicle not found");
      }
      sendSuccess(res, item, "Vehicle retrieved successfully");
    });
    createInventoryItem = asyncHandler(async (req, res, next) => {
      const inputData = insertInventorySchema.parse(req.body);
      const normalizedVin = inputData.vin.toUpperCase();
      const existingVin = await Inventory.findOne({ vin: normalizedVin });
      if (existingVin) {
        throw new ConflictError("A vehicle with this VIN already exists");
      }
      const existingStock = await Inventory.findOne({ stockNumber: inputData.stockNumber });
      if (existingStock) {
        throw new ConflictError("A vehicle with this stock number already exists");
      }
      let finalData = { ...inputData, vin: normalizedVin };
      if (!inputData.make || !inputData.model || !inputData.body) {
        try {
          console.log(`[Create Inventory] Auto-populating vehicle details for VIN: ${normalizedVin}`);
          const vehicleData = await NHTSAService.decodeVIN(normalizedVin, inputData.year);
          finalData = {
            ...finalData,
            make: inputData.make || vehicleData.make,
            model: inputData.model || vehicleData.model,
            year: inputData.year || vehicleData.year || inputData.year,
            trim: inputData.trim || vehicleData.trim,
            series: inputData.series || vehicleData.series,
            body: inputData.body || vehicleData.bodyClass,
            dateLogged: /* @__PURE__ */ new Date()
          };
          console.log(`[Create Inventory] Auto-populated data:`, {
            make: finalData.make,
            model: finalData.model,
            year: finalData.year,
            body: finalData.body
          });
        } catch (error) {
          console.warn(`[Create Inventory] VIN decode failed for ${normalizedVin}:`, error);
        }
      }
      if (!finalData.make) {
        throw new ValidationError("Make is required. Please ensure VIN is valid or provide the make manually.");
      }
      if (!finalData.model) {
        throw new ValidationError("Model is required. Please ensure VIN is valid or provide the model manually.");
      }
      if (!finalData.body) {
        throw new ValidationError("Body type is required. Please ensure VIN is valid or provide the body type manually.");
      }
      const stockNumber = await StockNumberService.generateStockNumber();
      const item = await Inventory.create({
        ...finalData,
        createdAt: /* @__PURE__ */ new Date()
      });
      sendSuccess(res, item, "Inventory item created successfully", 201);
    });
    updateInventoryItem = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const validatedData = insertInventorySchema.partial().parse(req.body);
      let finalData = { ...validatedData };
      if (validatedData.vin) {
        const existingVin = await Inventory.findOne({
          vin: validatedData.vin.toUpperCase(),
          _id: { $ne: id }
        });
        if (existingVin) {
          throw new ConflictError("A vehicle with this VIN already exists");
        }
        finalData.vin = validatedData.vin.toUpperCase();
        try {
          console.log(`[Update Inventory] Auto-populating vehicle details for VIN: ${validatedData.vin}`);
          const vehicleData = await NHTSAService.decodeVIN(validatedData.vin, validatedData.year);
          if (!validatedData.make && vehicleData.make) finalData.make = vehicleData.make;
          if (!validatedData.model && vehicleData.model) finalData.model = vehicleData.model;
          if (!validatedData.year && vehicleData.year) finalData.year = vehicleData.year;
          if (!validatedData.trim && vehicleData.trim) finalData.trim = vehicleData.trim;
          if (!validatedData.series && vehicleData.series) finalData.series = vehicleData.series;
          if (!validatedData.body && vehicleData.bodyClass) finalData.body = vehicleData.bodyClass;
          console.log(`[Update Inventory] Auto-populated data:`, {
            make: finalData.make,
            model: finalData.model,
            year: finalData.year,
            trim: finalData.trim
          });
        } catch (error) {
          console.warn(`[Update Inventory] VIN decode failed for ${validatedData.vin}:`, error);
        }
      }
      if (validatedData.stockNumber) {
        const existingStock = await Inventory.findOne({
          stockNumber: validatedData.stockNumber,
          _id: { $ne: id }
        });
        if (existingStock) {
          throw new ConflictError("A vehicle with this stock number already exists");
        }
      }
      const item = await Inventory.findByIdAndUpdate(
        id,
        finalData,
        { new: true, runValidators: true }
      );
      if (!item) {
        throw new NotFoundError("Inventory item not found");
      }
      sendSuccess(res, item, "Inventory item updated successfully");
    });
    deleteInventoryItem = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const item = await Inventory.findByIdAndDelete(id);
      if (!item) {
        throw new NotFoundError("Inventory item not found");
      }
      sendSuccess(res, null, "Inventory item deleted successfully");
    });
    searchInventory = asyncHandler(async (req, res, next) => {
      const { query } = req.params;
      const searchResults = await Inventory.find({
        $or: [
          { vin: { $regex: query, $options: "i" } },
          { make: { $regex: query, $options: "i" } },
          { model: { $regex: query, $options: "i" } },
          { stockNumber: { $regex: query, $options: "i" } },
          { color: { $regex: query, $options: "i" } },
          { series: { $regex: query, $options: "i" } }
        ]
      }).sort({ createdAt: -1 });
      sendSuccess(res, searchResults, `Found ${searchResults.length} matching vehicles`);
    });
    lookupVinData = asyncHandler(async (req, res, next) => {
      const { vin } = req.params;
      if (!vin || vin.length !== 17) {
        throw new Error("VIN must be exactly 17 characters");
      }
      try {
        const modelYear = req.query.year ? parseInt(req.query.year, 10) : void 0;
        console.log(`[VIN Lookup] Decoding VIN: ${vin}`);
        const vehicleData = await NHTSAService.decodeVIN(vin);
        console.log(vehicleData);
        const existingVehicle = await Inventory.findOne({ vin: vin.toUpperCase() });
        const response = {
          vehicleData
          // existsInInventory: !!existingVehicle,
          // inventoryData: existingVehicle || null
        };
        sendSuccess(res, response, "VIN decoded successfully");
      } catch (error) {
        console.error(`[VIN Lookup] Error decoding VIN ${vin}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to decode VIN";
        throw new Error(errorMessage);
      }
    });
  }
});

// server/controllers/salesController.ts
var getAllSales, getSalesById, createSalesItem, updateSalesItem, deleteSalesItem, searchSales, getSalesStats;
var init_salesController = __esm({
  "server/controllers/salesController.ts"() {
    "use strict";
    init_models();
    init_schema();
    init_errors();
    init_response();
    init_middleware();
    getAllSales = asyncHandler(async (req, res, next) => {
      const sales = await Sales.find({}).sort({ createdAt: -1 });
      sendSuccess(res, sales, "Sales retrieved successfully");
    });
    getSalesById = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const sale = await Sales.findById(id);
      if (!sale) {
        throw new NotFoundError("Sales record not found");
      }
      sendSuccess(res, sale, "Sales record retrieved successfully");
    });
    createSalesItem = asyncHandler(async (req, res, next) => {
      const validatedData = insertSalesSchema.parse(req.body);
      const inventoryItem = await Inventory.findOne({ stockNumber: validatedData.stockNumber });
      if (!inventoryItem) {
        throw new ValidationError("Stock number not found in inventory");
      }
      const sale = await Sales.create({
        ...validatedData,
        createdAt: /* @__PURE__ */ new Date()
      });
      sendSuccess(res, sale, "Sales record created successfully", 201);
    });
    updateSalesItem = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const validatedData = insertSalesSchema.partial().parse(req.body);
      if (validatedData.stockNumber) {
        const inventoryItem = await Inventory.findOne({ stockNumber: validatedData.stockNumber });
        if (!inventoryItem) {
          throw new ValidationError("Stock number not found in inventory");
        }
      }
      const sale = await Sales.findByIdAndUpdate(
        id,
        validatedData,
        { new: true, runValidators: true }
      );
      if (!sale) {
        throw new NotFoundError("Sales record not found");
      }
      sendSuccess(res, sale, "Sales record updated successfully");
    });
    deleteSalesItem = asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const sale = await Sales.findByIdAndDelete(id);
      if (!sale) {
        throw new NotFoundError("Sales record not found");
      }
      sendSuccess(res, null, "Sales record deleted successfully");
    });
    searchSales = asyncHandler(async (req, res, next) => {
      const { query } = req.params;
      const searchResults = await Sales.find({
        $or: [
          { dealNumber: { $regex: query, $options: "i" } },
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
          { customerNumber: { $regex: query, $options: "i" } },
          { stockNumber: { $regex: query, $options: "i" } }
        ]
      }).sort({ createdAt: -1 });
      sendSuccess(res, searchResults, `Found ${searchResults.length} matching sales records`);
    });
    getSalesStats = asyncHandler(async (req, res, next) => {
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const salesThisMonth = await Sales.find({
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      });
      const totalRevenue = salesThisMonth.reduce((sum, sale) => {
        return sum + Number(sale.salesPrice);
      }, 0);
      const totalInventory = await Inventory.countDocuments();
      const inventoryItems = await Inventory.find({}, { age: 1 });
      const avgAge = inventoryItems.length > 0 ? inventoryItems.reduce((sum, item) => sum + (item.age || 0), 0) / inventoryItems.length : 0;
      sendSuccess(res, {
        totalInventory,
        salesThisMonth: salesThisMonth.length,
        revenue: totalRevenue,
        avgDaysInLot: Math.round(avgAge)
      }, "Statistics retrieved successfully");
    });
  }
});

// server/controllers/settingsController.ts
var getSettings, updateSettings, resetSettings;
var init_settingsController = __esm({
  "server/controllers/settingsController.ts"() {
    "use strict";
    init_models();
    init_schema();
    init_response();
    init_middleware();
    getSettings = asyncHandler(async (req, res, next) => {
      let settings = await Settings.findOne({});
      if (!settings) {
        const defaultSettings = {
          id: "",
          make: [],
          sources: [],
          years: [],
          status: [],
          model: [],
          colors: [],
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        sendSuccess(res, defaultSettings, "Default settings retrieved");
        return;
      }
      sendSuccess(res, settings, "Settings retrieved successfully");
    });
    updateSettings = asyncHandler(async (req, res, next) => {
      const validatedData = insertSettingsSchema.parse(req.body);
      let settings = await Settings.findOne({});
      if (settings) {
        Object.assign(settings, validatedData);
        settings.updatedAt = /* @__PURE__ */ new Date();
        await settings.save();
      } else {
        settings = await Settings.create({
          ...validatedData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      sendSuccess(res, settings, "Settings updated successfully");
    });
    resetSettings = asyncHandler(async (req, res, next) => {
      await Settings.deleteMany({});
      const defaultSettings = await Settings.create({
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      sendSuccess(res, defaultSettings, "Settings reset to defaults successfully");
    });
  }
});

// server/controllers/index.ts
var controllers_exports = {};
__export(controllers_exports, {
  createInventoryItem: () => createInventoryItem,
  createSalesItem: () => createSalesItem,
  deleteInventoryItem: () => deleteInventoryItem,
  deleteSalesItem: () => deleteSalesItem,
  deleteUser: () => deleteUser,
  getAllInventory: () => getAllInventory,
  getAllSales: () => getAllSales,
  getAllUsers: () => getAllUsers,
  getCurrentUser: () => getCurrentUser,
  getInventoryById: () => getInventoryById,
  getInventoryByStockNumber: () => getInventoryByStockNumber,
  getInventoryByVin: () => getInventoryByVin,
  getSalesById: () => getSalesById,
  getSalesStats: () => getSalesStats,
  getSettings: () => getSettings,
  getUserById: () => getUserById,
  loginUser: () => loginUser,
  lookupVinData: () => lookupVinData,
  registerUser: () => registerUser,
  resetSettings: () => resetSettings,
  searchInventory: () => searchInventory,
  searchSales: () => searchSales,
  updateInventoryItem: () => updateInventoryItem,
  updateSalesItem: () => updateSalesItem,
  updateSettings: () => updateSettings,
  updateUser: () => updateUser
});
var init_controllers = __esm({
  "server/controllers/index.ts"() {
    "use strict";
    init_userController();
    init_inventoryController();
    init_salesController();
    init_settingsController();
  }
});

// server/index.ts
import { createServer } from "http";

// server/app.ts
import express from "express";

// server/config/database.ts
init_env();
import mongoose from "mongoose";
var connectDatabase = async () => {
  try {
    const mongoUrl = env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL environment variable is not set");
    }
    await mongoose.connect(mongoUrl, mongooseOptions);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
var mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5e3,
  socketTimeoutMS: 45e3
};

// server/app.ts
init_middleware();

// server/services/seedService.ts
init_models();
init_middleware();
var SeedService = class {
  static async seedUsers() {
    try {
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
          userType: "admin"
        },
        {
          username: "manager1",
          email: "manager@dealerpro.com",
          password: await hashPassword("manager123"),
          userType: "manager"
        },
        {
          username: "employee1",
          email: "employee@dealerpro.com",
          password: await hashPassword("employee123"),
          userType: "employee"
        }
      ];
      await User.insertMany(defaultUsers);
      console.log("Default users seeded successfully");
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  }
  static async seedSettings() {
    try {
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
        hqPriceThreshold: 2e4,
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
        stockNumberSequentialCounter: 1e3
      };
      await Settings.create(defaultSettings);
      console.log("Default settings seeded successfully");
    } catch (error) {
      console.error("Error seeding settings:", error);
    }
  }
  static async seedSampleData() {
    try {
      const existingInventory = await Inventory.countDocuments();
      if (existingInventory > 0) {
        console.log("Sample inventory already exists, skipping sample data seeding");
        return;
      }
      console.log("Seeding sample inventory and sales data...");
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
          age: 45
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
          age: 32
        }
      ];
      await Inventory.insertMany(sampleInventory);
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
          deliveryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1e3),
          deliveryMileage: 15420,
          trade1Vin: "2HGFC2F59MH987654",
          trade1Year: 2021,
          trade1Make: "Honda",
          trade1Model: "Civic",
          trade1Odometer: 45e3,
          trade1ACV: "18500",
          closingManagerNumber: "M001",
          closingManagerName: "Sarah Johnson",
          financeManagerNumber: "F001",
          financeManagerName: "Mike Davis",
          salesmanNumber: "S001",
          salesmanName: "Robert Wilson",
          msrp: "29500",
          listPrice: "28450",
          salesPrice: "27200"
        }
      ];
      await Sales.insertMany(sampleSales);
      console.log("Sample data seeded successfully");
    } catch (error) {
      console.error("Error seeding sample data:", error);
    }
  }
  static async seedAll() {
    await this.seedUsers();
    await this.seedSettings();
    await this.seedSampleData();
  }
};

// server/routes/index.ts
import { Router as Router5 } from "express";

// server/routes/userRoutes.ts
init_controllers();
init_middleware();
init_schema();
import { Router } from "express";
var router = Router();
router.post("/register", validateBody(registerUserSchema), registerUser);
router.post("/login", validateBody(loginUserSchema), loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/", authenticateToken, requireManagerOrAdmin, getAllUsers);
router.get("/:id", authenticateToken, requireManagerOrAdmin, getUserById);
router.put("/:id", authenticateToken, requireManagerOrAdmin, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);
var userRoutes_default = router;

// server/routes/inventoryRoutes.ts
init_controllers();
init_middleware();
init_schema();
import { Router as Router2 } from "express";
var router2 = Router2();
router2.use(authenticateToken);
router2.get("/", requireAnyRole, getAllInventory);
router2.get("/search/:query", requireAnyRole, searchInventory);
router2.get("/vin-lookup/:vin", requireAnyRole, lookupVinData);
router2.get("/vin/:vin", requireAnyRole, getInventoryByVin);
router2.get("/stock/:stockNumber", requireAnyRole, getInventoryByStockNumber);
router2.get("/:id", requireAnyRole, getInventoryById);
router2.post("/", requireManagerOrAdmin, validateBody(insertInventorySchema), createInventoryItem);
router2.put("/:id", requireManagerOrAdmin, updateInventoryItem);
router2.delete("/:id", requireAdmin, deleteInventoryItem);
var inventoryRoutes_default = router2;

// server/routes/salesRoutes.ts
init_controllers();
init_middleware();
init_schema();
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(authenticateToken);
router3.get("/", requireAnyRole, getAllSales);
router3.get("/search/:query", requireAnyRole, searchSales);
router3.get("/:id", requireAnyRole, getSalesById);
router3.post("/", requireManagerOrAdmin, validateBody(insertSalesSchema), createSalesItem);
router3.put("/:id", requireManagerOrAdmin, updateSalesItem);
router3.delete("/:id", requireAdmin, deleteSalesItem);
var salesRoutes_default = router3;

// server/routes/settingsRoutes.ts
init_controllers();
init_middleware();
init_schema();
import { Router as Router4 } from "express";
var router4 = Router4();
router4.use(authenticateToken);
router4.get("/", requireAnyRole, getSettings);
router4.put("/", requireAdmin, validateBody(insertSettingsSchema), updateSettings);
router4.post("/reset", requireAdmin, resetSettings);
var settingsRoutes_default = router4;

// server/routes/index.ts
var router5 = Router5();
router5.use("/auth", userRoutes_default);
router5.use("/users", userRoutes_default);
router5.use("/inventory", inventoryRoutes_default);
router5.use("/sales", salesRoutes_default);
router5.use("/settings", settingsRoutes_default);
router5.get("/stats", async (req, res, next) => {
  try {
    const { getSalesStats: getSalesStats2 } = await Promise.resolve().then(() => (init_controllers(), controllers_exports));
    const { authenticateToken: authenticateToken2, requireAnyRole: requireAnyRole2 } = await Promise.resolve().then(() => (init_middleware(), middleware_exports));
    await new Promise((resolve, reject) => {
      authenticateToken2(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise((resolve, reject) => {
      requireAnyRole2(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return getSalesStats2(req, res, next);
  } catch (error) {
    next(error);
  }
});
var routes_default = router5;

// server/app.ts
var createApp = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path3.startsWith("/api")) {
        let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        console.log(logLine);
      }
    });
    next();
  });
  await connectDatabase();
  await SeedService.seedAll();
  app.use("/api", routes_default);
  app.use(errorHandler);
  return app;
};

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express2.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_env();
(async () => {
  try {
    const app = await createApp();
    const server = createServer(app);
    if (isDevelopment) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    app.get("/health", (req, res) => {
      res.status(200).send("OK");
    });
    const isReplit = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_ID;
    const host = isDevelopment ? "localhost" : "0.0.0.0";
    server.listen(env.PORT, host, () => {
      console.log(`\u{1F680} Server running on ${host}:${env.PORT}`);
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
