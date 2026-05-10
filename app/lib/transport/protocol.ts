export type Namespace = "session" | "fs" | "terminal" | "git" | "ai" | "security";

export type Envelope = {
  id: string;
  ns: Namespace;
  action: string;
  payload?: unknown;
};
