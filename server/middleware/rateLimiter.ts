import rateLimit from "express-rate-limit";
import { config } from "../config.js";

/**
 * Rate limiter for login endpoint to prevent brute force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxLoginAttempts,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter to prevent abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // generous for internal app
  message: {
    error: "Muitas requisições. Tente novamente em breve.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
