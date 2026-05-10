import type { AiProvider } from "./interface.js";

export class ClaudeProvider implements AiProvider {
  async init() {}
  async listModels() {
    return ["claude-sonnet"];
  }
}
