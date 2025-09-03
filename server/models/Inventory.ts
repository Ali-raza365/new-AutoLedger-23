import mongoose, { Schema } from "mongoose";
import { InventoryDocument } from "@shared/schema";

// Define the Mongoose schema for Inventory
const inventorySchema = new Schema<InventoryDocument>({
  stockNumber: {
    type: String,
    required: true,
    trim: true,
  },
  vin: {
    type: String,
    required: true,
    length: 17,
    uppercase: true,
    trim: true,
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
    type: String,
    required: true,
  },
  bookValue: {
    type: String,
    default: null,
  },
  cost: {
    type: String,
    default: null,
  },
  markup: {
    type: String,
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
inventorySchema.pre("save", function(next) {
  if (this.price && this.cost) {
    const priceNum = Number(this.price);
    const costNum = Number(this.cost);
    if (!isNaN(priceNum) && !isNaN(costNum)) {
      this.markup = String(priceNum - costNum);
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