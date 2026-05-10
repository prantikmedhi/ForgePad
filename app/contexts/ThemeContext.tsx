import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { theme, fontTokens } from "@/constants/themes";

type ThemeMode = "dark" | "light";

type ThemeValue = {
  dark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: (typeof theme)[ThemeMode];
  fonts: typeof fontTokens;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const value = useMemo<ThemeValue>(() => {
    const colors = mode === "dark" ? theme.dark : theme.light;
    return {
      dark: mode === "dark",
      mode,
      setMode,
      colors,
      fonts: fontTokens
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
