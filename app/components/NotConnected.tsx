import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function NotConnected() {
  const { colors, fonts } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: 22, marginBottom: 8 }}>
        No Active Session
      </Text>
      <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 22, textAlign: "center" }}>
        Pair this device with your desktop agent to browse files, run terminals, and use AI tools.
      </Text>
    </View>
  );
}
