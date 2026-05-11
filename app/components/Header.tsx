import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeColors } from "@/constants/themes";
import { useTheme } from "@/contexts/ThemeContext";

export function useHeaderHeight() {
  const { top } = useSafeAreaInsets();
  return top + 44;
}

type HeaderProps = {
  title: string;
  onBack?: () => void;
  rightAccessory?: React.ReactNode;
  colors?: ThemeColors;
};

export default function Header({ title, onBack, rightAccessory, colors: propColors }: HeaderProps) {
  const router = useRouter();
  const { colors: themeColors, fonts, typography } = useTheme();
  const colors = propColors ?? themeColors;
  const { top } = useSafeAreaInsets();

  return (
    <>
      <View style={{ height: top + 44 }} />
      <View
        style={[
          styles.wrapper,
          {
            paddingTop: top,
            backgroundColor: colors.bg.base,
            borderBottomColor: colors.border.secondary,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={colors.fg.default} strokeWidth={2} />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            {
              color: colors.fg.default,
              fontFamily: fonts.sans.semibold,
              fontSize: typography.heading,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={styles.rightAccessory}>{rightAccessory}</View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
  },
  rightAccessory: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
