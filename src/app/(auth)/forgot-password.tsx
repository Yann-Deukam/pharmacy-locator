/**
 * src/app/(auth)/forgot-password.tsx
 */
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.success) setSent(true);
    else setError(result.error ?? "Failed to send reset email.");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={{ color: colors.textSecondary }}>← Back</Text>
          </Pressable>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Reset password</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            We'll send a reset link to your email address.
          </Text>

          {sent ? (
            <View style={[styles.successBox, { backgroundColor: colors.success + "18" }]}>
              <Text style={[styles.successText, { color: colors.success }]}>
                Check your inbox — a reset link has been sent.
              </Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={[styles.errorBox, { backgroundColor: colors.error + "18" }]}>
                  <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
                </View>
              )}
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Pressable
                onPress={handleReset}
                style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send reset link</Text>}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, gap: 16 },
  back: { marginBottom: 8 },
  heading: { fontSize: 26, fontWeight: "700" },
  sub: { fontSize: 15, marginBottom: 4 },
  errorBox: { padding: 12, borderRadius: 10 },
  successBox: { padding: 16, borderRadius: 12 },
  successText: { fontSize: 15, fontWeight: "500" },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

