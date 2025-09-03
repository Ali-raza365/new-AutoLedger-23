import express from "express";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware";
import { SeedService } from "./services";
import apiRoutes from "./routes/index";

export const createApp = async (): Promise<express.Application> => {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  // Connect to database
  await connectDatabase();

  // Seed default data
  await SeedService.seedAll();

  // API routes
  app.use("/api", apiRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};