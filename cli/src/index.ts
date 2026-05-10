#!/usr/bin/env node
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createAiManager } from "./ai/index.js";

const VERSION = "0.1.0";
const args = process.argv.slice(2);
const DEFAULT_PORT = Number(
  readFlagValue("--port") ?? process.env.FORGEPAD_AGENT_PORT ?? 47321
);

function readFlagValue(name: string) {
  const withEquals = args.find((arg) => arg.startsWith(`${name}=`));
  if (withEquals) return withEquals.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function hasFlag(...names: string[]) {
  return names.some((name) => args.includes(name));
}

function printHelp() {
  console.log(`ForgePad Agent ${VERSION}

Usage:
  npx forgepad-agent [options]

Options:
  --port <port>     Port for the local pairing server. Default: 47321
  -v, --version     Print version
  -h, --help        Show help
`);
}

function getLanAddress() {
  const nets = networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return "127.0.0.1";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(payload);
}

async function main() {
  if (hasFlag("-h", "--help")) {
    printHelp();
    return;
  }

  if (hasFlag("-v", "--version")) {
    console.log(VERSION);
    return;
  }

  const ai = await createAiManager();
  const pairingCode = `forge-${randomUUID().slice(0, 8)}`;
  const sessionToken = randomBytes(32).toString("base64url");
  const workspaceName = process.cwd().split(/[\\/]/).pop() || "Workspace";
  const host = getLanAddress();

  const server = createServer((req, res) => {
    if (!req.url) {
      sendJson(res, 400, { ok: false, error: "Missing URL" });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? `${host}:${DEFAULT_PORT}`}`);

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, app: "ForgePad Agent" });
      return;
    }

    if (req.method === "GET" && url.pathname === "/pair") {
      const code = url.searchParams.get("code") ?? "";
      if (!safeEqual(code, pairingCode)) {
        sendJson(res, 401, { ok: false, error: "Invalid pairing code" });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        session: {
          token: sessionToken,
          workspaceName,
          root: process.cwd(),
          providers: ai.availableBackends()
        }
      });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  });

  await new Promise<void>((resolve) => {
    server.listen(DEFAULT_PORT, "0.0.0.0", resolve);
  });

  console.log("ForgePad desktop agent");
  console.log(`Workspace: ${process.cwd()}`);
  console.log(`Pairing code: ${pairingCode}`);
  console.log(`Pair URL: http://${host}:${DEFAULT_PORT}/pair?code=${pairingCode}`);
  console.log(`Available providers: ${ai.availableBackends().join(", ") || "none"}`);
  console.log("Keep this terminal open while using the mobile app.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
