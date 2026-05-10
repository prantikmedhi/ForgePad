import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";

export default function SettingsScreen() {
  const { colors, fonts } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <Header title="Settings" />
      <View style={{ padding: 20, gap: 12 }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.bodySemiBold, fontSize: 18 }}>
          Security defaults
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 }}>
          Workspace trust, device keys, and provider authentication controls will live here.
        </Text>
      </View>
    </View>
  );
}
