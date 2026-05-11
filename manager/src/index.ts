import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const PORT = Number(process.env.FORGEPAD_MANAGER_PORT ?? 47320);
const SESSION_TTL_MS = 10 * 60 * 1000;
const PUBLIC_BASE_URL = process.env.FORGEPAD_MANAGER_PUBLIC_URL ?? `http://127.0.0.1:${PORT}`;

type RelayRegistration = {
  proxyBaseUrl: string;
  controlPath: string;
  dataPath: string;
};

type RegisterRequest = {
  workspaceName: string;
  root: string;
  providers: string[];
  relay: RelayRegistration;
  clientVersion: string;
};

type SessionRecord = {
  id: string;
  code: string;
  claimToken: string;
  heartbeatToken: string;
  workspaceName: string;
  root: string;
  providers: string[];
  relay: RelayRegistration;
  clientVersion: string;
  createdAt: number;
  expiresAt: number;
  claimedAt: number | null;
};

const sessions = new Map<string, SessionRecord>();

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

function makePairCode() {
  return `forge-${randomUUID().slice(0, 8)}`;
}

function makeSessionResponse(session: SessionRecord) {
  return {
    ok: true,
    session: {
      token: session.claimToken,
      workspaceName: session.workspaceName,
      root: session.root,
      providers: session.providers,
      transport: {
        kind: "relay",
        sessionId: session.id,
        proxyBaseUrl: session.relay.proxyBaseUrl,
        controlUrl: `${session.relay.proxyBaseUrl}${session.relay.controlPath}?sessionId=${encodeURIComponent(session.id)}&peer=mobile`,
        dataUrl: `${session.relay.proxyBaseUrl}${session.relay.dataPath}?sessionId=${encodeURIComponent(session.id)}&peer=mobile`,
        expiresAt: new Date(session.expiresAt).toISOString(),
      },
    },
  };
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    throw new Error("Missing request body");
  }
  return JSON.parse(raw) as T;
}

function requireBearer(req: IncomingMessage) {
  const auth = req.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length);
}

function getSessionByCode(code: string) {
  for (const session of sessions.values()) {
    if (safeEqual(session.code, code)) {
      return session;
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  pruneExpiredSessions();

  if (!req.url) {
    json(res, 400, { ok: false, error: "Missing URL" });
    return;
  }

  const url = new URL(req.url, PUBLIC_BASE_URL);

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, {
      ok: true,
      service: "forgepad-manager",
      sessions: sessions.size,
      ttlSeconds: SESSION_TTL_MS / 1000,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/v1/sessions/register") {
    try {
      const body = await readJson<RegisterRequest>(req);
      if (!body.workspaceName || !body.root || !body.clientVersion) {
        json(res, 400, { ok: false, error: "workspaceName, root, and clientVersion are required" });
        return;
      }
      if (!body.relay?.proxyBaseUrl || !body.relay.controlPath || !body.relay.dataPath) {
        json(res, 400, { ok: false, error: "relay proxyBaseUrl/controlPath/dataPath are required" });
        return;
      }

      const id = randomUUID();
      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      const record: SessionRecord = {
        id,
        code: makePairCode(),
        claimToken: randomBytes(32).toString("base64url"),
        heartbeatToken: randomBytes(32).toString("base64url"),
        workspaceName: body.workspaceName,
        root: body.root,
        providers: Array.isArray(body.providers) ? body.providers.map(String) : [],
        relay: body.relay,
        clientVersion: body.clientVersion,
        createdAt: now,
        expiresAt,
        claimedAt: null,
      };

      sessions.set(id, record);
      json(res, 201, {
        ok: true,
        registration: {
          sessionId: record.id,
          code: record.code,
          heartbeatToken: record.heartbeatToken,
          pairUrl: `${PUBLIC_BASE_URL}/pair?code=${encodeURIComponent(record.code)}`,
          expiresAt: new Date(record.expiresAt).toISOString(),
        },
      });
    } catch (error) {
      json(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid registration request",
      });
    }
    return;
  }

  if (req.method === "POST" && /^\/v1\/sessions\/[^/]+\/heartbeat$/.test(url.pathname)) {
    const sessionId = url.pathname.split("/")[3] ?? "";
    const bearer = requireBearer(req);
    const session = sessions.get(sessionId);
    if (!session || !bearer || !safeEqual(bearer, session.heartbeatToken)) {
      json(res, 401, { ok: false, error: "Invalid heartbeat token" });
      return;
    }

    session.expiresAt = Date.now() + SESSION_TTL_MS;
    json(res, 200, {
      ok: true,
      expiresAt: new Date(session.expiresAt).toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/pair") {
    const code = url.searchParams.get("code") ?? "";
    const session = getSessionByCode(code);
    if (!session) {
      json(res, 404, { ok: false, error: "Invalid pairing code" });
      return;
    }

    session.claimedAt = Date.now();
    json(res, 200, makeSessionResponse(session));
    return;
  }

  json(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ForgePad manager listening on ${PUBLIC_BASE_URL}`);
  console.log(`Session TTL: ${SESSION_TTL_MS / 1000}s`);
});
