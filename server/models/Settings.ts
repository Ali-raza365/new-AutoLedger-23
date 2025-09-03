import mongoose, { Schema } from "mongoose";
import { SettingsDocument, ModelSeriesType, ColorOptionType } from "@shared/schema";

// Sub-schema for model series
const modelSeriesSchema = new Schema<ModelSeriesType>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  Series: [{
    type: String,
    required: true,
    trim: true,
  }],
}, { _id: false });

// Sub-schema for color options
const colorOptionSchema = new Schema<ColorOptionType>({
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

// Define the Mongoose schema for Settings
const settingsSchema = new Schema<SettingsDocument>({
  make: [{
    type: String,
    required: true,
    trim: true,
  }],
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
  model: [modelSeriesSchema],
  colors: [colorOptionSchema],
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
settingsSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform toJSON to convert _id to id
settingsSchema.set("toJSON", {
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Export the model
export const Settings = mongoose.model<SettingsDocument>("Settings", settingsSchema);
export type SettingsModel = typeof Settings;