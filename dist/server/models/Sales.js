"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sales = void 0;
var mongoose_1 = require("mongoose");
// Define the Mongoose schema for Sales
var salesSchema = new mongoose_1.Schema({
    dealNumber: {
        type: String,
        required: true,
        trim: true,
    },
    customerNumber: {
        type: String,
        trim: true,
        default: null,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    zip: {
        type: String,
        trim: true,
        default: null,
    },
    exteriorColor: {
        type: String,
        trim: true,
        default: null,
    },
    newUsed: {
        type: String,
        required: true,
        enum: ["New", "Used"],
    },
    stockNumber: {
        type: String,
        required: true,
        trim: true,
    },
    deliveryDate: {
        type: Date,
        default: null,
    },
    deliveryMileage: {
        type: Number,
        min: 0,
        default: null,
    },
    // Trade 1 information
    trade1Vin: {
        type: String,
        length: 17,
        uppercase: true,
        trim: true,
        default: null,
    },
    trade1Year: {
        type: Number,
        min: 1900,
        max: 2030,
        default: null,
    },
    trade1Make: {
        type: String,
        trim: true,
        default: null,
    },
    trade1Model: {
        type: String,
        trim: true,
        default: null,
    },
    trade1Odometer: {
        type: Number,
        min: 0,
        default: null,
    },
    trade1ACV: {
        type: String,
        default: null,
    },
    // Trade 2 information
    trade2Vin: {
        type: String,
        length: 17,
        uppercase: true,
        trim: true,
        default: null,
    },
    trade2Year: {
        type: Number,
        min: 1900,
        max: 2030,
        default: null,
    },
    trade2Make: {
        type: String,
        trim: true,
        default: null,
    },
    trade2Model: {
        type: String,
        trim: true,
        default: null,
    },
    trade2Odometer: {
        type: Number,
        min: 0,
        default: null,
    },
    trade2ACV: {
        type: String,
        default: null,
    },
    // Manager and staff information
    closingManagerNumber: {
        type: String,
        trim: true,
        default: null,
    },
    closingManagerName: {
        type: String,
        trim: true,
        default: null,
    },
    financeManagerNumber: {
        type: String,
        trim: true,
        default: null,
    },
    financeManagerName: {
        type: String,
        trim: true,
        default: null,
    },
    salesmanNumber: {
        type: String,
        trim: true,
        default: null,
    },
    salesmanName: {
        type: String,
        trim: true,
        default: null,
    },
    // Pricing information
    msrp: {
        type: String,
        default: null,
    },
    listPrice: {
        type: String,
        default: null,
    },
    salesPrice: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: "sales",
    timestamps: false, // We manage createdAt manually
});
// Create indexes for better performance
salesSchema.index({ dealNumber: 1 });
salesSchema.index({ stockNumber: 1 });
salesSchema.index({ firstName: 1, lastName: 1 });
salesSchema.index({ customerNumber: 1 });
salesSchema.index({ deliveryDate: 1 });
salesSchema.index({ createdAt: 1 });
// Text search index for searching across multiple fields
salesSchema.index({
    dealNumber: "text",
    firstName: "text",
    lastName: "text",
    customerNumber: "text",
});
// Transform toJSON to convert _id to id
salesSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
// Export the model
exports.Sales = mongoose_1.default.model("Sales", salesSchema);
