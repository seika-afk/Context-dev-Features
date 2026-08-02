import express, { type Response } from "express";
import type { Server } from "http";
import { closeBrowser, ensureBrowser } from "../shared/browser";
import { runClickFlow } from "../f1/Click_feature/clickQuery";
import { runFillFlow } from "../f2/fill_form/fill_form";

type JsonRecord = Record<string, unknown>;

const app = express();
app.use(express.json({ limit: "5mb" }));

function getRequiredString(body: JsonRecord, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid "${key}"`);
  }

  return value.trim();
}

function sendError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.startsWith("Missing or invalid") ? 400 : 500;

  res.status(status).json({
    ok: false,
    error: message,
  });
}

app.get("/health", async (_req, res) => {
  await ensureBrowser();
  res.json({
    ok: true,
    browserReady: true,
  });
});

app.post("/api/click", async (req, res) => {
  try {
    const body = req.body as JsonRecord;
    const url = getRequiredString(body, "url");
    const clickQuery = getRequiredString(body, "clickQuery");
    const finalQuery = getRequiredString(body, "finalQuery");

    const result = await runClickFlow(url, clickQuery, finalQuery);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/fill-form", async (req, res) => {
  try {
    const body = req.body as JsonRecord;
    const url = getRequiredString(body, "url");
    const fieldData = getRequiredString(body, "fieldData");
    const finalQuery = getRequiredString(body, "finalQuery");

    const result = await runFillFlow(url, fieldData, finalQuery);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    sendError(res, error);
  }
});

let server: Server | undefined;

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down.`);
  await new Promise<void>((resolve) => {
    if (!server) {
      resolve();
      return;
    }

    server.close(() => resolve());
  });
  await closeBrowser();
  process.exit(0);
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

await ensureBrowser();

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

server = app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});



