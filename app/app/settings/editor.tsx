import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EditorSettingsPage() {
  const { colors, fonts, spacing, typography } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <Header title="Editor" colors={colors} onBack={() => router.back()} />
      <View style={{ padding: spacing[4], gap: spacing[2] }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: typography.heading }}>
          Editor settings
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: typography.body, lineHeight: 22 }}>
          Font sizing, wrapping, autosave, and editor ergonomics will move here when the Lunel editor panel is ported.
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
