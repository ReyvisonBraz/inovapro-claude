import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Custom application error with HTTP status code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain (4 args).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unknown / unhandled errors
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({ error: "Internal server error" });
}
