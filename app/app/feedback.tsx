import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { Check, Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function RatingStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;
        return (
          <TouchableOpacity
            key={value}
            activeOpacity={0.7}
            onPress={() => onChange(value)}
            style={[
              styles.starButton,
              {
                backgroundColor: active ? colors.accent.default : colors.bg.raised,
                borderColor: active ? colors.accent.default : colors.bg.raised,
                borderRadius: 10,
                marginRight: value === 5 ? 0 : spacing[2],
              },
            ]}
          >
            <Star
              size={18}
              strokeWidth={2}
              color={active ? colors.accent.onAccent : colors.fg.muted}
              fill={active ? colors.accent.onAccent : "transparent"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function FeedbackPage() {
  const { colors, fonts, radius, spacing, typography } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const canSend = useMemo(
    () => !isSubmitting && rating > 0 && content.trim().length > 0,
    [content, isSubmitting, rating],
  );

  async function handleSend() {
    if (!canSend) {
      setError(rating === 0 ? "Choose a rating." : "Describe your feedback.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const subject = encodeURIComponent(`ForgePad feedback (${rating}/5)`);
      const body = encodeURIComponent(
        `Rating: ${rating}/5\nEmail: ${email.trim() || "not provided"}\n\n${content.trim()}`
      );

      await Linking.openURL(`mailto:prantikmedhi@users.noreply.github.com?subject=${subject}&body=${body}`);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to open email client.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <Header title="Feedback" colors={colors} onBack={() => router.back()} />

      {isSent ? (
        <View style={styles.sentState}>
          <View
            style={[
              styles.sentIconWrap,
              {
                backgroundColor: colors.accent.default,
                borderRadius: radius.full,
              },
            ]}
          >
            <Check size={34} color={colors.accent.onAccent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: 24 }}>
            Sent
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
          <View style={[styles.pageSection, { marginHorizontal: 16 }]}>
            <Text style={{ color: colors.fg.default, fontFamily: fonts.sans.semibold, fontSize: typography.body }}>
              Tell us what to improve
            </Text>

            <View style={styles.fieldGroup}>
              <View style={[styles.fieldCard, { backgroundColor: colors.bg.raised, borderColor: colors.bg.raised, borderRadius: 10 }]}>
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError("");
                  }}
                  placeholder="Email (optional)"
                  placeholderTextColor={colors.fg.subtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={[styles.input, { color: colors.fg.default, fontFamily: fonts.sans.regular }]}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.fieldCard, { backgroundColor: colors.bg.raised, borderColor: colors.bg.raised, borderRadius: 10 }]}>
                <TextInput
                  value={content}
                  onChangeText={(value) => {
                    setContent(value);
                    setError("");
                  }}
                  placeholder="Tell us what worked, what broke, or what should improve."
                  placeholderTextColor={colors.fg.subtle}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textarea, { color: colors.fg.default, fontFamily: fonts.sans.regular }]}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <RatingStars
                rating={rating}
                onChange={(value) => {
                  setRating(value);
                  setError("");
                }}
              />
            </View>
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.git.deleted, fontFamily: fonts.sans.regular }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!canSend}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              void handleSend();
            }}
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend ? colors.accent.default : colors.bg.raised,
                borderColor: canSend ? colors.accent.default : colors.bg.raised,
                borderRadius: 10,
                marginHorizontal: 16,
                marginTop: spacing[4],
                opacity: isSubmitting ? 0.8 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.accent.onAccent} />
            ) : (
              <Text
                style={{
                  color: canSend ? colors.accent.onAccent : colors.fg.subtle,
                  fontFamily: fonts.sans.semibold,
                  fontSize: typography.body,
                }}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: spacing[8] }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  pageSection: {
    paddingTop: 24,
  },
  fieldGroup: {
    marginTop: 10,
  },
  fieldCard: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 15,
    minHeight: 20,
    paddingVertical: 0,
  },
  textarea: {
    fontSize: 15,
    minHeight: 132,
    paddingVertical: 0,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    marginHorizontal: 16,
    marginTop: 14,
  },
  sendButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sentState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sentIconWrap: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
});
