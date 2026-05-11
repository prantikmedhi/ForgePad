import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type SessionInfo = {
  agentUrl: string;
  token: string;
  workspaceName: string;
  root: string;
  providers: string[];
  transport: {
    kind: "direct" | "relay";
    sessionId?: string;
    proxyBaseUrl?: string;
    controlUrl?: string;
    dataUrl?: string;
    expiresAt?: string | null;
  };
};

type ConnectionStatus = "idle" | "connecting" | "connected";

type ConnectionValue = {
  status: ConnectionStatus;
  session: SessionInfo | null;
  pairWithCode: (code: string) => Promise<void>;
  disconnect: () => void;
};

const ConnectionContext = createContext<ConnectionValue | null>(null);
const SESSION_KEY = "forgepad.session.v1";

function normalizePairingInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Pairing URL is required");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return new URL(trimmed);
  }

  throw new Error("Paste the full Pair URL from the desktop agent");
}

function getAgentBaseUrl(pairUrl: URL) {
  return `${pairUrl.protocol}//${pairUrl.host}`;
}

function toPairingError(error: unknown) {
  if (error instanceof Error && error.message === "Network request failed") {
    return new Error(
      "Could not reach the desktop agent. On Android release builds, this usually means LAN HTTP traffic is blocked or the phone cannot reach your computer on the same Wi-Fi."
    );
  }

  return error instanceof Error ? error : new Error("Pairing failed");
}

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    void SecureStore.getItemAsync(SESSION_KEY).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<SessionInfo>;
        if (parsed.agentUrl && parsed.token) {
          setSession({
            agentUrl: String(parsed.agentUrl),
            token: String(parsed.token),
            workspaceName: String(parsed.workspaceName ?? "Workspace"),
            root: String(parsed.root ?? ""),
            providers: Array.isArray(parsed.providers) ? parsed.providers.map(String) : [],
            transport: {
              kind: parsed.transport?.kind === "relay" ? "relay" : "direct",
              sessionId: typeof parsed.transport?.sessionId === "string" ? parsed.transport.sessionId : undefined,
              proxyBaseUrl: typeof parsed.transport?.proxyBaseUrl === "string" ? parsed.transport.proxyBaseUrl : undefined,
              controlUrl: typeof parsed.transport?.controlUrl === "string" ? parsed.transport.controlUrl : undefined,
              dataUrl: typeof parsed.transport?.dataUrl === "string" ? parsed.transport.dataUrl : undefined,
              expiresAt: typeof parsed.transport?.expiresAt === "string" || parsed.transport?.expiresAt === null
                ? parsed.transport.expiresAt
                : undefined,
            },
          });
          setStatus("connected");
        }
      } catch {
        void SecureStore.deleteItemAsync(SESSION_KEY);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function pairWithCode(input: string) {
    const pairUrl = normalizePairingInput(input);
    const baseUrl = getAgentBaseUrl(pairUrl);
    const code = pairUrl.searchParams.get("code");
    if (!code) {
      throw new Error("Pair URL is missing a code");
    }

    setStatus("connecting");
    try {
      const response = await fetch(`${baseUrl}/pair?code=${encodeURIComponent(code)}`);
      const body = await response.json();
      if (!response.ok || body?.ok !== true) {
        throw new Error(body?.error ?? "Pairing failed");
      }

      const nextSession: SessionInfo = {
        agentUrl: baseUrl,
        token: String(body.session.token),
        workspaceName: String(body.session.workspaceName ?? "Workspace"),
        root: String(body.session.root ?? ""),
        providers: Array.isArray(body.session.providers) ? body.session.providers.map(String) : [],
        transport: {
          kind: body.session.transport?.kind === "relay" ? "relay" : "direct",
          sessionId: typeof body.session.transport?.sessionId === "string" ? body.session.transport.sessionId : undefined,
          proxyBaseUrl: typeof body.session.transport?.proxyBaseUrl === "string" ? body.session.transport.proxyBaseUrl : undefined,
          controlUrl: typeof body.session.transport?.controlUrl === "string" ? body.session.transport.controlUrl : undefined,
          dataUrl: typeof body.session.transport?.dataUrl === "string" ? body.session.transport.dataUrl : undefined,
          expiresAt: typeof body.session.transport?.expiresAt === "string" || body.session.transport?.expiresAt === null
            ? body.session.transport.expiresAt
            : undefined,
        },
      };

      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setStatus("connected");
    } catch (error) {
      setStatus("idle");
      throw toPairingError(error);
    }
  }

  function disconnect() {
    setSession(null);
    setStatus("idle");
    void SecureStore.deleteItemAsync(SESSION_KEY);
  }

  const value = useMemo(() => ({
    status,
    session,
    pairWithCode,
    disconnect
  }), [status, session]);

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnection() {
  const value = useContext(ConnectionContext);
  if (!value) {
    throw new Error("useConnection must be used inside ConnectionProvider");
  }
  return value;
}
