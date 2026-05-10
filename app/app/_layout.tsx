import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function RootNavigator() {
  const { colors, dark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.base }
        }}
      />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ConnectionProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </ConnectionProvider>
  );
}
