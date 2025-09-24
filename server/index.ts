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

const port = Number(env.PORT) || 3000;
const host = "0.0.0.0";

server.listen(port, host, () => {
  console.log(`🚀 Server running on ${host}:${port}`);
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