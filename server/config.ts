import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "financeflow-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxLoginAttempts: 10,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
};
