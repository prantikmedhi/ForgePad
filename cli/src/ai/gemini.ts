import type { AiProvider } from "./interface.js";

export class GeminiProvider implements AiProvider {
  async init() {}
  async listModels() {
    return ["gemini-2.5-pro"];
  }
}
