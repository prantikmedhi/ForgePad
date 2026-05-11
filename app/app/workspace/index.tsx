import Header from "@/components/Header";
import NotConnected from "@/components/NotConnected";
import { useConnection } from "@/contexts/ConnectionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bot, Cpu, FolderCode, Globe, KeyRound, TerminalSquare } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function ProviderChip({ label }: { label: string }) {
  const { colors, fonts, spacing, radius, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bg.overlay,
        borderRadius: radius.full,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
      }}
    >
      <Text
        style={{
          color: colors.fg.default,
          fontFamily: fonts.mono.medium,
          fontSize: typography.caption,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const { colors, fonts, spacing, radius, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bg.raised,
        borderRadius: radius.lg,
        padding: spacing[4],
        gap: spacing[2],
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          backgroundColor: colors.bg.overlay,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          color: colors.fg.default,
          fontFamily: fonts.sans.semibold,
          fontSize: typography.body,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.fg.muted,
          fontFamily: fonts.sans.regular,
          fontSize: typography.caption,
          lineHeight: 18,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

export default function WorkspaceScreen() {
  const { status, session } = useConnection();
  const { colors, fonts, spacing, radius, typography } = useTheme();

  if (status !== "connected" || !session) {
    return <NotConnected />;
  }

  const providers = session.providers ?? [];
  const tokenPreview = session.token ? `${session.token.slice(0, 10)}...` : "missing";
  const transportLabel = session.transport.kind === "relay" ? "Relay" : "Direct LAN";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <Header title={session.workspaceName || "Workspace"} colors={colors} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.bg.raised,
            borderRadius: radius.lg,
            padding: spacing[4],
            gap: spacing[3],
          }}
        >
          <View style={{ gap: spacing[1] }}>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.sans.semibold,
                fontSize: typography.title,
              }}
            >
              Connected
            </Text>
            <Text
              style={{
                color: colors.fg.muted,
                fontFamily: fonts.sans.regular,
                fontSize: typography.body,
                lineHeight: 22,
              }}
            >
              Desktop session live. App talking to agent.
            </Text>
          </View>

          <View style={{ gap: spacing[2] }}>
            <Text style={[styles.metaLabel, { color: colors.fg.subtle, fontFamily: fonts.sans.medium }]}>
              PROJECT DIRECTORY
            </Text>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.mono.regular,
                fontSize: typography.caption,
                lineHeight: 18,
              }}
            >
              {session.root}
            </Text>
          </View>

          <View style={{ gap: spacing[2] }}>
            <Text style={[styles.metaLabel, { color: colors.fg.subtle, fontFamily: fonts.sans.medium }]}>
              AGENT URL
            </Text>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.mono.regular,
                fontSize: typography.caption,
              }}
            >
              {session.agentUrl}
            </Text>
          </View>

          <View style={{ gap: spacing[2] }}>
            <Text style={[styles.metaLabel, { color: colors.fg.subtle, fontFamily: fonts.sans.medium }]}>
              TRANSPORT
            </Text>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.mono.regular,
                fontSize: typography.caption,
              }}
            >
              {transportLabel}
            </Text>
          </View>

          {session.transport.sessionId ? (
            <View style={{ gap: spacing[2] }}>
              <Text style={[styles.metaLabel, { color: colors.fg.subtle, fontFamily: fonts.sans.medium }]}>
                RELAY SESSION
              </Text>
              <Text
                style={{
                  color: colors.fg.default,
                  fontFamily: fonts.mono.regular,
                  fontSize: typography.caption,
                }}
              >
                {session.transport.sessionId}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: spacing[2] }}>
            <Text style={[styles.metaLabel, { color: colors.fg.subtle, fontFamily: fonts.sans.medium }]}>
              SESSION TOKEN
            </Text>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.mono.regular,
                fontSize: typography.caption,
              }}
            >
              {tokenPreview}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.bg.raised,
            borderRadius: radius.lg,
            padding: spacing[4],
            gap: spacing[3],
          }}
        >
          <View style={{ gap: spacing[1] }}>
            <Text
              style={{
                color: colors.fg.default,
                fontFamily: fonts.sans.semibold,
                fontSize: typography.heading,
              }}
            >
              AI Agents
            </Text>
            <Text
              style={{
                color: colors.fg.muted,
                fontFamily: fonts.sans.regular,
                fontSize: typography.body,
                lineHeight: 22,
              }}
            >
              Providers desktop agent reported for this session.
            </Text>
          </View>

          {providers.length > 0 ? (
            <View style={styles.chipWrap}>
              {providers.map((provider) => (
                <ProviderChip key={provider} label={provider} />
              ))}
            </View>
          ) : (
            <Text
              style={{
                color: colors.git.deleted,
                fontFamily: fonts.sans.regular,
                fontSize: typography.body,
              }}
            >
              No providers detected. Re-pair with fresh CLI session.
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          <FeatureCard
            title="AI Chat"
            description="Provider list now visible. Full agent chat panel still need port."
            icon={<Bot size={18} color={colors.fg.default} strokeWidth={2} />}
          />
          <FeatureCard
            title="Terminal"
            description="Desktop agent connected. Terminal UI not ported into app yet."
            icon={<TerminalSquare size={18} color={colors.fg.default} strokeWidth={2} />}
          />
          <FeatureCard
            title="Explorer"
            description="Project root visible. File tree UI still pending."
            icon={<FolderCode size={18} color={colors.fg.default} strokeWidth={2} />}
          />
          <FeatureCard
            title="Runtime"
            description="Session live over LAN. App shell ahead of full feature port."
            icon={<Globe size={18} color={colors.fg.default} strokeWidth={2} />}
          />
          <FeatureCard
            title="Providers"
            description={`${providers.length} backend${providers.length === 1 ? "" : "s"} available from desktop agent.`}
            icon={<Cpu size={18} color={colors.fg.default} strokeWidth={2} />}
          />
          <FeatureCard
            title="Auth"
            description="Session token stored on device for reconnect."
            icon={<KeyRound size={18} color={colors.fg.default} strokeWidth={2} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grid: {
    gap: 12,
  },
});
