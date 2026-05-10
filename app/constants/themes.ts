export const theme = {
  dark: {
    bg: {
      base: "#08111d",
      raised: "#0f1b2b"
    },
    fg: {
      default: "#f6f7fb",
      muted: "#9aa9bc",
      subtle: "#65758b"
    },
    accent: {
      default: "#17c964",
      onAccent: "#04110a"
    },
    status: {
      error: "#ff5d73"
    }
  },
  light: {
    bg: {
      base: "#f4f7fb",
      raised: "#ffffff"
    },
    fg: {
      default: "#0f1824",
      muted: "#4e6075",
      subtle: "#7d8c9e"
    },
    accent: {
      default: "#0f9f56",
      onAccent: "#f6fff9"
    },
    status: {
      error: "#d62f4b"
    }
  }
} as const;

export const fontTokens = {
  body: "System",
  bodySemiBold: "System",
  display: "System",
  mono: "Courier"
};
