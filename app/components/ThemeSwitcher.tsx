import { useTheme } from "@/contexts/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

const OPTIONS = [
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
] as const;

export function ThemeSwitcher() {
  const { selectedTheme, setTheme, colors, fonts, spacing, radius, typography } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing[3] }]}>
      {OPTIONS.map((option) => {
        const selected = option.id === selectedTheme;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              void setTheme(option.id);
            }}
            style={[
              styles.option,
              {
                backgroundColor: selected ? colors.accent.default : colors.bg.raised,
                borderRadius: radius.md,
                paddingVertical: spacing[3],
                paddingHorizontal: spacing[4],
                marginBottom: spacing[2],
              },
            ]}
          >
            <Text
              style={{
                color: selected ? colors.accent.onAccent : colors.fg.default,
                fontFamily: selected ? fonts.sans.semibold : fonts.sans.regular,
                fontSize: typography.body,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default ThemeSwitcher;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  option: {},
});
