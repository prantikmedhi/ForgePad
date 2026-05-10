import type { AiProvider } from "./interface.js";

export class OpenAiProvider implements AiProvider {
  async init() {}
  async listModels() {
    return ["gpt-5", "gpt-4.1"];
  }
}
