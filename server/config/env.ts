export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL || "mongodb+srv://new_user:db123456@cluster0.nug88fr.mongodb.net/dealerpro",
  MONGODB_URL: process.env.MONGODB_URL || "mongodb+srv://new_user:db123456@cluster0.nug88fr.mongodb.net/dealerpro",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
} as const;

export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";