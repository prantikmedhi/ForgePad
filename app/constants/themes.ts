export type ThemeId = "light" | "dark";
export type ThemeOption = ThemeId | "system";

export type ThemeColors = {
  bg: {
    base: string;
    raised: string;
    overlay: string;
    elevated: string;
  };
  fg: {
    default: string;
    muted: string;
    subtle: string;
    disabled: string;
  };
  accent: {
    default: string;
    onAccent: string;
  };
  border: {
    main: string;
    secondary: string;
    tertiary: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  git: {
    added: string;
    modified: string;
    deleted: string;
  };
};

export type ThemeFonts = {
  sans: {
    regular: string | undefined;
    medium: string | undefined;
    semibold: string | undefined;
    bold: string | undefined;
  };
  mono: {
    regular: string | undefined;
    medium: string | undefined;
    bold: string | undefined;
  };
  display: string | undefined;
};

export type ThemeSpacing = {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
};

export type ThemeRadius = {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  full: number;
};

export type ThemeTypography = {
  caption: number;
  list: number;
  subHeading: number;
  body: number;
  heading: number;
  title: number;
  hero: number;
};

export const typography: ThemeTypography = {
  caption: 11,
  list: 12,
  subHeading: 13,
  body: 15,
  heading: 17,
  title: 22,
  hero: 32,
};

export const spacing: ThemeSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
};

export const radius: ThemeRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

export const fonts: ThemeFonts = {
  sans: {
    regular: undefined,
    medium: undefined,
    semibold: undefined,
    bold: undefined,
  },
  mono: {
    regular: "Courier",
    medium: "Courier",
    bold: "Courier",
  },
  display: undefined,
};

export const themes: Record<ThemeId, ThemeColors> = {
  dark: {
    bg: {
      base: "#0a0a0a",
      raised: "#141414",
      overlay: "#1a1a1a",
      elevated: "#242424",
    },
    fg: {
      default: "#f5f5f5",
      muted: "#a3a3a3",
      subtle: "#737373",
      disabled: "#525252",
    },
    accent: {
      default: "#ffffff",
      onAccent: "#0a0a0a",
    },
    border: {
      main: "#262626",
      secondary: "#202020",
      tertiary: "#1a1a1a",
    },
    status: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    git: {
      added: "#22c55e",
      modified: "#f59e0b",
      deleted: "#ef4444",
    },
  },
  light: {
    bg: {
      base: "#ffffff",
      raised: "#f7f7f7",
      overlay: "#f0f0f0",
      elevated: "#e8e8e8",
    },
    fg: {
      default: "#111111",
      muted: "#525252",
      subtle: "#737373",
      disabled: "#a3a3a3",
    },
    accent: {
      default: "#111111",
      onAccent: "#ffffff",
    },
    border: {
      main: "#e5e5e5",
      secondary: "#ededed",
      tertiary: "#f2f2f2",
    },
    status: {
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#2563eb",
    },
    git: {
      added: "#16a34a",
      modified: "#d97706",
      deleted: "#dc2626",
    },
  },
};

export function isValidTheme(theme: string): theme is ThemeOption {
  return theme === "light" || theme === "dark" || theme === "system";
}

export function isDarkTheme(theme: ThemeId) {
  return theme === "dark";
}
