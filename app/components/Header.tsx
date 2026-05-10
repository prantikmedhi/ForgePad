import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const { colors, fonts } = useTheme();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.bg.raised, borderRadius: 12 }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.body }}>Back</Text>
      </Pressable>
      <Text style={{ color: colors.fg.default, fontFamily: fonts.bodySemiBold, fontSize: 18 }}>
        {title}
      </Text>
    </View>
  );
}
