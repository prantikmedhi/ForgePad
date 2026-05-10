export type ControlRequest = {
  id: string;
  ns: "session" | "fs" | "terminal" | "git" | "ai";
  action: string;
  payload?: unknown;
};
