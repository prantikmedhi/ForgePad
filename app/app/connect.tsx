import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useConnection } from "@/contexts/ConnectionContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function ConnectScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const { pairWithCode, status } = useConnection();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      setError(null);
      await pairWithCode(code.trim());
      router.replace("/workspace");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Connection failed");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base, padding: 24, justifyContent: "center", gap: 16 }}>
      <Text style={{ color: colors.fg.default, fontFamily: fonts.display, fontSize: 28 }}>
        Connect Desktop
      </Text>
      <Text style={{ color: colors.fg.muted, fontFamily: fonts.sans.regular, fontSize: 15, lineHeight: 22 }}>
        Paste Pair URL from desktop agent or relay gateway.
      </Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        placeholder="http://192.168.1.10:47321/pair?code=forge-abcd1234"
        placeholderTextColor={colors.fg.subtle}
        style={{
          backgroundColor: colors.bg.raised,
          color: colors.fg.default,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: fonts.mono.regular
        }}
      />
      {error ? (
        <Text style={{ color: colors.status.error, fontFamily: fonts.sans.regular, fontSize: 13 }}>
          {error}
        </Text>
      ) : null}
      <Pressable
        onPress={handleConnect}
        style={{ backgroundColor: colors.accent.default, borderRadius: 16, paddingVertical: 16, alignItems: "center", opacity: status === "connecting" ? 0.7 : 1 }}
      >
        <Text style={{ color: colors.accent.onAccent, fontFamily: fonts.sans.semibold, fontSize: 16 }}>
          {status === "connecting" ? "Connecting..." : "Pair and Continue"}
        </Text>
      </Pressable>
    </View>
  );
}
