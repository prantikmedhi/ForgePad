import { createServer, type IncomingMessage } from "node:http";
import { WebSocketServer, type RawData, type WebSocket } from "ws";

const PORT = Number(process.env.FORGEPAD_PROXY_PORT ?? 47322);
const PUBLIC_BASE_URL = process.env.FORGEPAD_PROXY_PUBLIC_URL ?? `ws://127.0.0.1:${PORT}`;
const SESSION_IDLE_TTL_MS = 10 * 60 * 1000;

type PeerRole = "host" | "mobile";
type ChannelName = "control" | "data";

type ChannelPeers = {
  host: WebSocket | null;
  mobile: WebSocket | null;
};

type RelaySession = {
  updatedAt: number;
  control: ChannelPeers;
  data: ChannelPeers;
};

const sessions = new Map<string, RelaySession>();

function getOrCreateSession(sessionId: string): RelaySession {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }

  const created: RelaySession = {
    updatedAt: Date.now(),
    control: { host: null, mobile: null },
    data: { host: null, mobile: null },
  };
  sessions.set(sessionId, created);
  return created;
}

function getChannel(session: RelaySession, name: ChannelName) {
  return name === "control" ? session.control : session.data;
}

function otherPeer(role: PeerRole) {
  return role === "host" ? "mobile" : "host";
}

function sendJson(socket: WebSocket, body: unknown) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(body));
  }
}

function pruneIdleSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (
      session.control.host === null
      && session.control.mobile === null
      && session.data.host === null
      && session.data.mobile === null
      && now - session.updatedAt > SESSION_IDLE_TTL_MS
    ) {
      sessions.delete(sessionId);
    }
  }
}

setInterval(pruneIdleSessions, 60_000).unref();

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true,
      service: "forgepad-proxy",
      sessions: sessions.size,
      publicBaseUrl: PUBLIC_BASE_URL,
    }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

const controlWss = new WebSocketServer({ noServer: true });
const dataWss = new WebSocketServer({ noServer: true });

function bindChannel(wss: WebSocketServer, name: ChannelName) {
  wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const sessionId = url.searchParams.get("sessionId") ?? "";
    const peer = url.searchParams.get("peer");

    if (!sessionId || (peer !== "host" && peer !== "mobile")) {
      socket.close(1008, "sessionId and peer are required");
      return;
    }

    const role = peer as PeerRole;
    const session = getOrCreateSession(sessionId);
    const channel = getChannel(session, name);
    const previous = channel[role];
    if (previous && previous !== socket && previous.readyState === previous.OPEN) {
      previous.close(4000, "Replaced by newer connection");
    }

    channel[role] = socket;
    session.updatedAt = Date.now();

    sendJson(socket, {
      type: "ready",
      channel: name,
      sessionId,
      peer: role,
    });

    const counterpart = channel[otherPeer(role)];
    if (counterpart) {
      sendJson(counterpart, {
        type: "peer-online",
        channel: name,
        sessionId,
        peer: role,
      });
    }

    socket.on("message", (data: RawData, isBinary: boolean) => {
      session.updatedAt = Date.now();
      const target = channel[otherPeer(role)];
      if (!target || target.readyState !== target.OPEN) {
        return;
      }
      target.send(data, { binary: isBinary });
    });

    socket.on("close", () => {
      session.updatedAt = Date.now();
      if (channel[role] === socket) {
        channel[role] = null;
      }
      const target = channel[otherPeer(role)];
      if (target) {
        sendJson(target, {
          type: "peer-offline",
          channel: name,
          sessionId,
          peer: role,
        });
      }
    });
  });
}

bindChannel(controlWss, "control");
bindChannel(dataWss, "data");

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/ws/control") {
    controlWss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      controlWss.emit("connection", client, req);
    });
    return;
  }

  if (url.pathname === "/ws/data") {
    dataWss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      dataWss.emit("connection", client, req);
    });
    return;
  }

  socket.destroy();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ForgePad proxy listening on ${PUBLIC_BASE_URL}`);
  console.log(`Control channel: ${PUBLIC_BASE_URL.replace(/^http/, "ws")}/ws/control`);
  console.log(`Data channel: ${PUBLIC_BASE_URL.replace(/^http/, "ws")}/ws/data`);
});
