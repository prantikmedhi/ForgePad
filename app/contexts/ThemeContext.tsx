import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fonts,
  isDarkTheme,
  isValidTheme,
  radius,
  spacing,
  themes,
  typography,
  type ThemeColors,
  type ThemeFonts,
  type ThemeId,
  type ThemeOption,
  type ThemeRadius,
  type ThemeSpacing,
  type ThemeTypography,
} from "@/constants/themes";
import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@forgepad_theme";

type ThemeContextValue = {
  selectedTheme: ThemeOption;
  themeId: ThemeId;
  setTheme: (theme: ThemeOption) => Promise<void>;
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  isDark: boolean;
  dark: boolean;
};

const fallbackValue: ThemeContextValue = {
  selectedTheme: "system",
  themeId: "dark",
  setTheme: async () => {},
  colors: themes.dark,
  fonts,
  radius,
  spacing,
  typography,
  isDark: true,
  dark: true,
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (cancelled) return;
      if (value && isValidTheme(value)) {
        setSelectedTheme(value);
      }
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = async (theme: ThemeOption) => {
    setSelectedTheme(theme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  const themeId: ThemeId = selectedTheme === "system"
    ? (deviceColorScheme === "light" ? "light" : "dark")
    : selectedTheme;

  const value = useMemo<ThemeContextValue>(() => {
    const colors = themes[themeId];
    const dark = isDarkTheme(themeId);

    return {
      selectedTheme,
      themeId,
      setTheme,
      colors,
      fonts,
      radius,
      spacing,
      typography,
      isDark: dark,
      dark,
    };
  }, [selectedTheme, themeId]);

  if (!isReady) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  return value ?? fallbackValue;
}
