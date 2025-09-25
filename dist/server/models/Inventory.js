"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
var mongoose_1 = require("mongoose");
// Sub-schema for audit trail entries
var auditTrailSchema = new mongoose_1.Schema({
    user: {
        type: String,
        required: true,
        trim: true,
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { _id: false });
// Define the Mongoose schema for Inventory
var inventorySchema = new mongoose_1.Schema({
    stockNumber: {
        type: String,
        required: true,
        trim: true,
    },
    vin: {
        type: String,
        required: true,
        minlength: 17,
        maxlength: 17,
        uppercase: true,
        trim: true,
        match: /^[A-HJ-NPR-Z0-9]{17}$/i, // Valid VIN pattern
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: 2030,
    },
    make: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    series: {
        type: String,
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    certified: {
        type: Boolean,
        default: false,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    bookValue: {
        type: Number,
        default: null,
        min: 0,
    },
    cost: {
        type: Number,
        default: null,
        min: 0,
    },
    markup: {
        type: Number,
        default: null,
    },
    odometer: {
        type: Number,
        required: true,
        min: 0,
    },
    age: {
        type: Number,
        default: null,
    },
    // New expanded fields for comprehensive inventory management
    dateLogged: {
        type: Date,
        default: Date.now,
    },
    trim: {
        type: String,
        trim: true,
        default: null,
    },
    // Purchase Information
    purchaseDate: {
        type: Date,
        default: null,
    },
    channel: {
        type: String,
        trim: true,
        default: null,
    },
    specificSource: {
        type: String,
        trim: true,
        default: null,
    },
    buyerName: {
        type: String,
        trim: true,
        default: null,
    },
    buyerId: {
        type: String,
        trim: true,
        default: null,
    },
    storeLocation: {
        type: String,
        trim: true,
        default: null,
    },
    purchasePrice: {
        type: String,
        default: null,
    },
    customerName: {
        type: String,
        trim: true,
        default: null,
    },
    dealNumber: {
        type: String,
        trim: true,
        default: null,
    },
    // Financial Analysis
    mmrValue: {
        type: String,
        default: null,
    },
    kbbWholesale: {
        type: String,
        default: null,
    },
    marketVariance: {
        type: String,
        default: null,
    },
    plannedRetail: {
        type: String,
        default: null,
    },
    estReconCost: {
        type: String,
        default: null,
    },
    projectedGross: {
        type: String,
        default: null,
    },
    // Status & Approval
    hqAppraisalSuggested: {
        type: Boolean,
        default: false,
    },
    redFlagStatus: {
        type: String,
        trim: true,
        default: null,
    },
    currentStatus: {
        type: String,
        trim: true,
        default: null,
    },
    statusDate: {
        type: Date,
        default: null,
    },
    newUsed: {
        type: String,
        required: true,
        enum: ["New", "Used"],
    },
    // Audit Trail
    auditTrail: [auditTrailSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: "inventory",
    timestamps: false, // We manage createdAt manually
});
// Create indexes for better performance
inventorySchema.index({ vin: 1 });
inventorySchema.index({ stockNumber: 1 });
inventorySchema.index({ make: 1, model: 1 });
inventorySchema.index({ year: 1 });
inventorySchema.index({ price: 1 });
// Text search index for searching across multiple fields
inventorySchema.index({
    vin: "text",
    make: "text",
    model: "text",
    stockNumber: "text",
    color: "text",
});
// Calculate and update markup before saving
inventorySchema.pre("save", function (next) {
    if (this.price && this.cost) {
        if (typeof this.price === 'number' && typeof this.cost === 'number') {
            this.markup = this.price - this.cost;
        }
    }
    next();
});
// Transform toJSON to convert _id to id
inventorySchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
// Export the model
exports.Inventory = mongoose_1.default.model("Inventory", inventorySchema);
