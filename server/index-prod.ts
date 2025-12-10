import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import runApp from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function serveStatic(app) {
  const distPublic = path.join(__dirname, "public"); // dist/index.js -> dist/public
  
  app.use(express.static(distPublic));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPublic, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
