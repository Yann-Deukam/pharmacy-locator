/**
 * src/app/(auth)/login.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Login screen.
 * - Email + password with visibility toggle
 * - "Continue as guest" button
 * - Links to register and forgot-password
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, MapPin } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, continueAsGuest, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    const result = await signIn(email.trim(), password);
    if (result.success) {
      router.replace("/(tabs)/home");
    } else {
      setError(result.error ?? "Sign-in failed. Please try again.");
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + "20" }]}>
            <MapPin size={36} color={colors.primary} strokeWidth={2} />
          </View>

          <Text style={[styles.appName, { color: colors.primary }]}>PharmaNear</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find the pharmacy you need, right now.
          </Text>

          {/* Error banner */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.error + "18" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
            <View style={[styles.passwordRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Forgot password */}
          <Pressable onPress={() => router.push("/(auth)/forgot-password")} style={styles.forgotBtn}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>

          {/* Sign in */}
          <Pressable
            onPress={handleSignIn}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Guest mode */}
          <Pressable
            onPress={handleGuest}
            style={[styles.ghostBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.ghostBtnText, { color: colors.textPrimary }]}>
              Continue as guest
            </Text>
          </Pressable>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerHint, { color: colors.textSecondary }]}>
              No account yet?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Create one</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 16 },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 8 },

  errorBanner: { width: "100%", padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, textAlign: "center" },

  fieldGroup: { width: "100%", gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  passwordRow: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  passwordInput: { flex: 1, fontSize: 15 },

  forgotBtn: { alignSelf: "flex-end" },
  linkText: { fontSize: 13, fontWeight: "600" },

  primaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },

  ghostBtn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: { fontSize: 15, fontWeight: "600" },

  registerRow: { flexDirection: "row", alignItems: "center" },
  registerHint: { fontSize: 14 },
});

