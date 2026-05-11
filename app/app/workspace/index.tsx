import { View, Text } from "react-native";
import Header from "@/components/Header";
import NotConnected from "@/components/NotConnected";
import { useConnection } from "@/contexts/ConnectionContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function WorkspaceScreen() {
  const { status, session } = useConnection();
  const { colors, fonts } = useTheme();

  if (status !== "connected") {
    return <NotConnected />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <Header title={session?.workspaceName ?? "Workspace"} />
      <View style={{ padding: 20, gap: 10 }}>
        <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: 22 }}>
          Connected
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 22 }}>
          {session?.root}
        </Text>
        <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 22 }}>
          Providers: {session?.providers.length ? session.providers.join(", ") : "none detected"}
        </Text>
      </View>
    </View>
  );
}
