// import { fileURLToPath } from "url";
// import path from "path";
// import dotenv from "dotenv";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log(__dirname)
// // Load .env from project root
// dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";
import { env, isDevelopment } from "./config/env";


(async () => {
  try {
    // Create Express app
    const app = await createApp();

    // Create HTTP server
    const server = createServer(app);

    // Setup Vite in development or serve static files in production
    if (isDevelopment) {
      await setupVite(app as any, server);
    } else {
      serveStatic(app as any);
    }

    // Determine host (use 0.0.0.0 for Replit)
    const isReplit = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_ID;
   const host = isReplit ? "0.0.0.0" : "localhost";


  server.listen(env.PORT, host, () => {
      console.log(`Server running on ${host}:${env.PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();