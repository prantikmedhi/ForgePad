import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base, padding: 24, justifyContent: "space-between" }}>
      <View style={{ gap: 16, marginTop: 80 }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.display, fontSize: 36 }}>
          ForgePad
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24 }}>
          Your desktop workspace, terminal, git flow, and AI coding agents in one secure mobile IDE.
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace("/connect")}
        style={{ backgroundColor: colors.accent.default, borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
      >
        <Text style={{ color: colors.accent.onAccent, fontFamily: fonts.bodySemiBold, fontSize: 16 }}>
          Start Pairing
        </Text>
      </Pressable>
    </View>
  );
}
