"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
var mongoose_1 = require("mongoose");
// Sub-schema for buyer information
var buyerInfoSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });
// Sub-schema for color options
var colorOptionSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });
// Define the schema for a single User item
var UserSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    roles: {
        type: [String],
        enum: ['sales', 'closer', 'manager', 'finance', 'source'],
        default: [],
    },
}, { _id: false });
var stockNumberRuleSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["none", "source", "buyer", "custom"],
        required: true,
        trim: true,
    },
    customValue: {
        type: String,
        trim: true,
    },
}, { _id: false } // prevents creating a separate _id for this subdocument
);
// Define the Mongoose schema for Settings
var settingsSchema = new mongoose_1.Schema({
    sources: [{
            type: String,
            required: true,
            trim: true,
        }],
    years: [{
            type: Number,
            required: true,
            min: 1900,
            max: 2100,
        }],
    status: [{
            type: String,
            required: true,
            trim: true,
        }],
    colors: [colorOptionSchema],
    users: {
        type: [UserSchema],
        default: [],
    },
    // Business Configuration
    rooftopCode: {
        type: String,
        trim: true,
        default: null,
    },
    hqPriceThreshold: {
        type: Number,
        min: 0,
        default: null,
    },
    minGrossProfit: {
        type: Number,
        min: 0,
        default: null,
    },
    maxReconPercentage: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
    },
    buyers: [buyerInfoSchema],
    channels: [{
            type: String,
            trim: true,
        }],
    // Stock Number Configuration
    stockNumberPrefixRule: {
        type: stockNumberRuleSchema,
        required: true,
    },
    stockNumberSuffixRule: {
        type: stockNumberRuleSchema,
        required: true,
    },
    stockNumberSequentialCounter: {
        type: Number,
        min: 0,
        default: 1000,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: "settings",
    timestamps: false, // We manage timestamps manually
});
// Update the updatedAt field before saving
settingsSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
// Transform toJSON to convert _id to id
settingsSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
// Export the model
exports.Settings = mongoose_1.default.model("Settings", settingsSchema);
