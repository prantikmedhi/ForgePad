import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { ExternalLink } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { colors, fonts, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bg.raised,
          borderColor: colors.bg.raised,
          borderRadius: 10,
          padding: spacing[3],
        },
      ]}
    >
      <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.medium, fontSize: typography.body, marginBottom: 6 }}>
        {question}
      </Text>
      <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: typography.caption, lineHeight: 16 }}>
        {answer}
      </Text>
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const { colors, fonts, spacing, typography } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        void WebBrowser.openBrowserAsync(url);
      }}
      style={[
        styles.linkRow,
        {
          backgroundColor: colors.bg.raised,
          borderColor: colors.bg.raised,
          borderRadius: 10,
          paddingVertical: spacing[2],
          paddingHorizontal: spacing[3],
        },
      ]}
    >
      <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.medium, fontSize: typography.body }}>
        {label}
      </Text>
      <ExternalLink size={16} color={colors.fg.subtle} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function HelpPage() {
  const { colors, fonts, spacing, typography } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <Header title="Help & Information" colors={colors} onBack={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        <Text style={[styles.sectionHeader, { color: colors.fg.muted, fontFamily: fonts.sans.medium, fontSize: typography.caption }]}>
          GETTING STARTED
        </Text>
        <View style={[styles.list, { marginHorizontal: 12 }]}>
          <FaqItem
            question="How do I connect to a session?"
            answer="Run `npx forgepad-agent` on your machine, then paste direct Pair URL or relay Pair URL into the app."
          />
          <FaqItem
            question="What if I get disconnected?"
            answer="Rerun the desktop agent and use the fresh Pair URL if the old session is no longer reachable."
          />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.fg.muted, fontFamily: fonts.sans.medium, fontSize: typography.caption }]}>
          TROUBLESHOOTING
        </Text>
        <View style={[styles.list, { marginHorizontal: 12 }]}>
          <FaqItem
            question="Why is pairing failing?"
            answer="For direct mode, keep phone and computer on same Wi-Fi. For relay mode, verify manager and proxy are reachable and the session has not expired."
          />
          <FaqItem
            question="Why do I see network request failed?"
            answer="Older APKs blocked local HTTP pairing on Android release builds. Install the latest APK from the GitHub release and try again."
          />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.fg.muted, fontFamily: fonts.sans.medium, fontSize: typography.caption }]}>
          LINKS
        </Text>
        <View style={[styles.list, { marginHorizontal: 12 }]}>
          <LinkRow label="GitHub" url="https://github.com/prantikmedhi/ForgePad" />
          <LinkRow label="Releases" url="https://github.com/prantikmedhi/ForgePad/releases" />
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  list: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
  },
  linkRow: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
