import express from "express";
import { registerRoutes } from "./routes";
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "node:http";

export const app = express();

// Body parsing MUST be added before routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formatted = new Date().toLocaleTimeString();
  console.log(`${formatted} [${source}] ${message}`);
}

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>
) {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  await setup(app, server);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
}
