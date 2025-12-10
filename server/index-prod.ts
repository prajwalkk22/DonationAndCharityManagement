import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import runApp from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_PATH = path.join(__dirname, "../public");

async function main() {
  const app = express();

  app.use(express.static(DIST_PATH));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(DIST_PATH, "index.html"));
  });

  await runApp((_app, _server) => {});
}

main();
