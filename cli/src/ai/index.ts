import type { AiBackend, AiProvider } from "./interface.js";
import { CodexProvider } from "./codex.js";
import { ClaudeProvider } from "./claude.js";
import { GeminiProvider } from "./gemini.js";
import { OpenAiProvider } from "./openai.js";

export class AiManager {
  private providers = new Map<AiBackend, AiProvider>();

  async init() {
    const entries: Array<[AiBackend, AiProvider]> = [
      ["codex", new CodexProvider()],
      ["claude", new ClaudeProvider()],
      ["gemini", new GeminiProvider()],
      ["openai", new OpenAiProvider()]
    ];

    for (const [key, provider] of entries) {
      await provider.init();
      this.providers.set(key, provider);
    }
  }

  availableBackends(): AiBackend[] {
    return Array.from(this.providers.keys());
  }
}

export async function createAiManager() {
  const manager = new AiManager();
  await manager.init();
  return manager;
}
