import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    // Use MONGODB_URL specifically for MongoDB connection
    const mongoUrl = env.MONGODB_URL;
    
    if (!mongoUrl) {
      throw new Error("MONGODB_URL environment variable is not set");
    }

    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoUrl, mongooseOptions);
    
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

// Mongoose options (can be extended as needed)
export const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
} as const;