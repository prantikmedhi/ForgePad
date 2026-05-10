import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.accent.default} />
    </View>
  );
}
