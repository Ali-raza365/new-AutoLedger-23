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

    app.get("/health", (req, res) => {
      res.status(200).send("OK");
    });



    



    // Determine host (use 0.0.0.0 for Replit)
    const isReplit = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_ID;

    // Always listen on 0.0.0.0 in production (Railway, Docker, etc.)
    // const host = isDevelopment ? "localhost" : "0.0.0.0";
    // Always listen on 0.0.0.0 in production (Railway, Docker, etc.)
    const host = "0.0.0.0";



    server.listen(env.PORT, host, () => {
      console.log(`🚀 Server running on ${host}:${env.PORT}`);
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