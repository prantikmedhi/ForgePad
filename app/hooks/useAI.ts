export function useAI() {
  return {
    backends: ["codex", "claude", "gemini"] as const
  };
}
