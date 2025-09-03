import mongoose, { Schema, Document } from "mongoose";
import { UserDocument, UserType } from "@shared/schema";

// Define the Mongoose schema for User
const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userType: {
    type: String,
    enum: ["admin", "manager", "employee"] as UserType[],
    required: true,
    default: "employee",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "users",
  timestamps: false, // We manage createdAt manually
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Transform toJSON to hide password and convert _id to id
userSchema.set("toJSON", {
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never include password in JSON responses
    return ret;
  }
});

// Export the model
export const User = mongoose.model<UserDocument>("User", userSchema);
export type UserModel = typeof User;