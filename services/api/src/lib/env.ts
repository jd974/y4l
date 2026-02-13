import dotenv from "dotenv";
dotenv.config();

export const env = {
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
  DATABASE_URL: process.env.DATABASE_URL!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@yours4live.local",
};
