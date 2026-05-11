import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AppSettingsPage() {
  const { colors, fonts, spacing, typography } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <Header title="App Settings" colors={colors} onBack={() => router.back()} />
      <View style={{ padding: spacing[4], gap: spacing[2] }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: typography.heading }}>
          App-level preferences
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: typography.body, lineHeight: 22 }}>
          Keep awake, storage handling, and similar device preferences will live here as the Lunel-style shell fills out.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
