import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AiSettingsPage() {
  const { colors, fonts, spacing, typography } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <Header title="AI Settings" colors={colors} onBack={() => router.back()} />
      <View style={{ padding: spacing[4], gap: spacing[2] }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: typography.heading }}>
          AI provider controls
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: typography.body, lineHeight: 22 }}>
          Model backends, provider credentials, and prompt behavior will land here once the Lunel AI plugin stack is ported.
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
