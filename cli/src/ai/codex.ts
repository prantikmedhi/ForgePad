import type { AiProvider } from "./interface.js";

export class CodexProvider implements AiProvider {
  async init() {}
  async listModels() {
    return ["gpt-5-codex"];
  }
}
