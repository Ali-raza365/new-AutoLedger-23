import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { 
  registerUserSchema, 
  loginUserSchema,
  type RegisterUser,
  type LoginUser,
  type JWTPayload
} from "@shared/schema";
import { 
  generateToken, 
  hashPassword, 
  comparePassword,
  type AuthenticatedRequest 
} from "../middleware";
import { 
  NotFoundError, 
  UnauthorizedError, 
  ConflictError, 
  ValidationError 
} from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware";

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData: RegisterUser = registerUserSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }
  
  // Check if username already exists
  const existingUsername = await User.findOne({ username: validatedData.username });
  if (existingUsername) {
    throw new ConflictError("Username already taken");
  }
  
  // Hash password and create user
  const hashedPassword = await hashPassword(validatedData.password);
  const user = await User.create({
    ...validatedData,
    password: hashedPassword,
  });
  
  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user._id!.toString(),
    email: user.email,
    userType: user.userType
  };
  const token = generateToken(tokenPayload);
  
  sendSuccess(res, {
    user: user.toJSON(), // This will exclude password due to transform
    token
  }, "User registered successfully", 201);
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData: LoginUser = loginUserSchema.parse(req.body);
  
  // Find user by email (include password for verification)
  const user = await User.findOne({ email: validatedData.email });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }
  
  // Verify password
  const isValidPassword = await comparePassword(validatedData.password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }
  
  // Generate JWT token
  const tokenPayload: JWTPayload = {
    userId: user._id!.toString(),
    email: user.email,
    userType: user.userType
  };
  const token = generateToken(tokenPayload);
  
  sendSuccess(res, {
    user: user.toJSON(), // This will exclude password due to transform
    token
  }, "Login successful");
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  sendSuccess(res, { user: user.toJSON() }, "User data retrieved successfully");
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find({}).select("-password"); // Exclude passwords
  
  sendSuccess(res, { users }, "Users retrieved successfully");
});

export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  sendSuccess(res, { user }, "User retrieved successfully");
});

export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Don't allow password updates through this endpoint
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

export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  sendSuccess(res, null, "User deleted successfully");
});