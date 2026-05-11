#!/usr/bin/env node
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createAiManager } from "./ai/index.js";

const VERSION = "0.1.0";
const args = process.argv.slice(2);
const DEFAULT_DIRECT_PORT = Number(
  readFlagValue("--port") ?? process.env.FORGEPAD_AGENT_PORT ?? 47321
);
const DEFAULT_MANAGER_URL = readFlagValue("--manager") ?? process.env.FORGEPAD_MANAGER_URL ?? "";
const DEFAULT_PROXY_URL = readFlagValue("--proxy") ?? process.env.FORGEPAD_PROXY_URL ?? "";

type RelayRegistrationResponse = {
  ok: true;
  registration: {
    sessionId: string;
    code: string;
    heartbeatToken: string;
    pairUrl: string;
    expiresAt: string;
  };
};

type RelaySockets = {
  control: WebSocket;
  data: WebSocket;
};

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
  --port <port>       Port for local pairing server. Default: 47321
  --manager <url>     Optional manager base URL for relay pairing
  --proxy <url>       Optional proxy base URL for relay transport
  -v, --version       Print version
  -h, --help          Show help
`);
}

function isPrivateIpv4(address: string) {
  return address.startsWith("10.")
    || address.startsWith("192.168.")
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address);
}

function getLanAddresses() {
  const nets = networkInterfaces();
  const addresses: string[] = [];

  for (const entries of Object.values(nets)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }

  return addresses;
}

function getPreferredLanAddress(addresses: string[]) {
  const privateAddress = addresses.find(isPrivateIpv4);
  return privateAddress ?? addresses[0] ?? "127.0.0.1";
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
    "cache-control": "no-store",
  });
  res.end(payload);
}

async function postJson<T extends object>(url: string, body: unknown, headers?: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json() as T | { ok?: false; error?: string };
  if (!response.ok) {
    throw new Error("error" in json && typeof json.error === "string" ? json.error : `Request failed: ${response.status}`);
  }

  return json as T;
}

async function registerRelaySession(input: {
  managerUrl: string;
  proxyUrl: string;
  workspaceName: string;
  root: string;
  providers: string[];
}) {
  const managerUrl = input.managerUrl.replace(/\/$/, "");
  const proxyUrl = input.proxyUrl.replace(/\/$/, "");
  const body = {
    workspaceName: input.workspaceName,
    root: input.root,
    providers: input.providers,
    clientVersion: VERSION,
    relay: {
      proxyBaseUrl: proxyUrl,
      controlPath: "/ws/control",
      dataPath: "/ws/data",
    },
  };

  return postJson<RelayRegistrationResponse>(
    `${managerUrl}/v1/sessions/register`,
    body,
  );
}

function startRelayHeartbeat(managerUrl: string, sessionId: string, heartbeatToken: string) {
  const cleanManagerUrl = managerUrl.replace(/\/$/, "");
  const interval = setInterval(() => {
    void postJson(
      `${cleanManagerUrl}/v1/sessions/${encodeURIComponent(sessionId)}/heartbeat`,
      {},
      { authorization: `Bearer ${heartbeatToken}` },
    ).catch((error) => {
      console.error("[relay] heartbeat failed:", error instanceof Error ? error.message : String(error));
    });
  }, 3 * 60 * 1000);

  interval.unref();
}

function openRelayPresence(proxyBaseUrl: string, sessionId: string): RelaySockets | null {
  if (typeof WebSocket === "undefined") {
    console.error("[relay] WebSocket runtime unavailable in this Node build");
    return null;
  }

  const proxy = proxyBaseUrl.replace(/\/$/, "");
  const control = new WebSocket(`${proxy}/ws/control?sessionId=${encodeURIComponent(sessionId)}&peer=host`);
  const data = new WebSocket(`${proxy}/ws/data?sessionId=${encodeURIComponent(sessionId)}&peer=host`);

  for (const [name, socket] of [["control", control], ["data", data]] as const) {
    socket.addEventListener("open", () => {
      console.log(`[relay] ${name} channel connected`);
    });
    socket.addEventListener("close", () => {
      console.warn(`[relay] ${name} channel closed`);
    });
    socket.addEventListener("error", () => {
      console.warn(`[relay] ${name} channel error`);
    });
  }

  return { control, data };
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
  const addresses = getLanAddresses();
  const host = getPreferredLanAddress(addresses);
  const availableProviders = ai.availableBackends();

  const server = createServer((req, res) => {
    if (!req.url) {
      sendJson(res, 400, { ok: false, error: "Missing URL" });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? `${host}:${DEFAULT_DIRECT_PORT}`}`);

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        app: "ForgePad Agent",
        version: VERSION,
        mode: DEFAULT_MANAGER_URL && DEFAULT_PROXY_URL ? "relay+direct" : "direct",
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/pair") {
      const code = url.searchParams.get("code") ?? "";
      if (!safeEqual(code, pairingCode)) {
        sendJson(res, 401, {
          ok: false,
          error: "Invalid pairing code. Use the exact Pair URL from the currently running CLI session.",
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        session: {
          token: sessionToken,
          workspaceName,
          root: process.cwd(),
          providers: availableProviders,
          transport: {
            kind: "direct",
            expiresAt: null,
          },
        },
      });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  });

  await new Promise<void>((resolve) => {
    server.listen(DEFAULT_DIRECT_PORT, "0.0.0.0", resolve);
  });

  console.log("ForgePad desktop agent");
  console.log(`Workspace: ${process.cwd()}`);
  console.log(`Pairing code: ${pairingCode}`);
  console.log(`Direct Pair URL: http://${host}:${DEFAULT_DIRECT_PORT}/pair?code=${pairingCode}`);
  if (addresses.length > 1) {
    console.log("Alternate Direct Pair URLs:");
    for (const address of addresses) {
      if (address === host) continue;
      console.log(`  http://${address}:${DEFAULT_DIRECT_PORT}/pair?code=${pairingCode}`);
    }
  }

  if (DEFAULT_MANAGER_URL && DEFAULT_PROXY_URL) {
    try {
      const relay = await registerRelaySession({
        managerUrl: DEFAULT_MANAGER_URL,
        proxyUrl: DEFAULT_PROXY_URL,
        workspaceName,
        root: process.cwd(),
        providers: availableProviders,
      });

      startRelayHeartbeat(
        DEFAULT_MANAGER_URL,
        relay.registration.sessionId,
        relay.registration.heartbeatToken,
      );
      openRelayPresence(DEFAULT_PROXY_URL, relay.registration.sessionId);

      console.log(`Relay Pair URL: ${relay.registration.pairUrl}`);
      console.log(`Relay expires at: ${relay.registration.expiresAt}`);
      console.log(`Relay session ID: ${relay.registration.sessionId}`);
    } catch (error) {
      console.error("[relay] registration failed:", error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`Available providers: ${availableProviders.join(", ") || "none"}`);
  console.log("Keep this terminal open while using the mobile app.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
