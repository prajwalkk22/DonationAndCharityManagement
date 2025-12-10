import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";
import { fileURLToPath } from "url";

import express, { type Express } from "express";
import runApp from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function serveStatic(app: Express, _server: Server) {
  // dist/public is where Vite puts the built client
  const distPath = path.resolve(__dirname, "../public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve all static assets (JS, CSS, images, etc.)
  app.use(express.static(distPath));

  // Fallback: for any non-API route, send index.html (SPA routing)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Boot the app in production
(async () => {
  await runApp(serveStatic);
})();
