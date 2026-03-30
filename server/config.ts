import dotenv from "dotenv";
dotenv.config();

const generateSecureSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn("⚠️ AVISO: JWT_SECRET não definido! Use: JWT_SECRET=sua-chave-secreta-minimo-32-caracteres");
    return "financeflow-dev-secret-please-change-in-production-minimum-32-chars";
  }
  if (secret.length < 32) {
    console.warn("⚠️ AVISO: JWT_SECRET muito curta! Mínimo 32 caracteres recomendados.");
  }
  return secret;
};

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: generateSecureSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxLoginAttempts: parseInt(process.env.RATE_LIMIT_MAX || "10", 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
  bodyLimit: process.env.BODY_LIMIT || "5mb",
};
