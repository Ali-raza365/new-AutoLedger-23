import mongoose, { Schema } from "mongoose";
import { InventoryDocument } from "@shared/schema";



// Define the Mongoose schema for Inventory
const inventorySchema = new Schema<InventoryDocument>({
  stockNumber: { type: String, trim: true ,unique: true },                 // "Stock #"
  vin: { type: String, trim: true, unique: true },                         // "VIN"
  year: { type: Number },                                    // "Year"
  make: { type: String, trim: true },                        // "Make"
  model: { type: String, trim: true },                       // "Model"
  series: { type: String, trim: true },                      // "Series"
  seriesDetail: { type: String, trim: true },                // "Series Detail"
  color: { type: String, trim: true },                       // "Color"
  interiorDescription: { type: String, trim: true },         // "Interior Description"
  exitStrategy: { type: String, trim: true },                // "Exit Strategy"
  certified: { type: Boolean, trim: true },                   // "Certified"
  body: { type: String, trim: true },                        // "Body"
  source: { type: String, trim: true, default: '', }, // "Specific Source"

  // Currency fields
  price: { type: Number, min: 0 },                           // "Price"
  pendingPrice: { type: Number, min: 0 },                    // "Pending Price"
  bookValue: { type: Number, min: 0 },                       // "Book Value"
  cost: { type: Number, min: 0 },                            // "Cost"
  applicableCost: { type: Number, min: 0 },                  // "Applicable Cost"
  originalCost: { type: Number, min: 0 },                    // "Original Cost"
  costDifference: { type: Number },                          // "Cost Difference"
  markup: { type: Number },                                  // "Markup"
  water: { type: Number },                                   // "Water"
  applicableWater: { type: Number },                         // "Applicable Water"

  // Numeric / percentage values
  overall: { type: Number },                                 // "Overall"
  marketDaysSupplyLikeMine: { type: Number },                // "Market Days Supply Like Mine"
  costToMarketPct: { type: Number },                         // "% Cost To Market"
  applicableCostToMarketPct: { type: Number },               // "Applicable % Cost To Market"
  marketPct: { type: Number },                               // "% Mkt"
  odometer: { type: Number, min: 0 },                        // "Odometer"
  age: { type: Number },                                     // "Age"

  // Ranking fields
  priceRank: { type: String, trim: true },                   // "Price Rank"
  vRank: { type: String, trim: true },                       // "vRank"
  priceRankBucket: { type: String, trim: true },             // "Price Rank Bucket"
  vRankBucket: { type: String, trim: true },                 // "vRank Bucket"

  // ✅ Extra fields you asked to keep
  currentStatus: { type: String, trim: true, default: "Available" },
  statusDate: { type: Date, default:  new Date() },
  dateLogged: { type: Date, default: new Date() },            // "Date Logged"
  newUsed: {
    type: String,
    required: true,
    enum: ["New", "Used"],
  },
},
  {
    collection: "inventory",
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// Create indexes for better performance
// inventorySchema.index({ vin: 1 });
// inventorySchema.index({ stockNumber: 1 });
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
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Export the model
export const Inventory = mongoose.model<InventoryDocument>("Inventory", inventorySchema);
export type InventoryModel = typeof Inventory;