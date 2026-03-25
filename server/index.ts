import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { initializeDatabase } from "./seed.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database (create tables, run migrations, seed defaults)
initializeDatabase();

async function startServer() {
  const app = express();

  // --- Global Middleware ---
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(apiLimiter);

  // --- API Routes ---
  app.use(routes);

  // --- Global Error Handler (must be LAST middleware) ---
  app.use(errorHandler);

  // --- Vite Dev Server / Static Files ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando em http://localhost:${config.port}`);
  });
}

startServer();
