export type AiBackend = "codex" | "claude" | "gemini" | "openai";

export type AiProvider = {
  init(): Promise<void>;
  listModels(): Promise<string[]>;
};
