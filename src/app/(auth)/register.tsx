/**
 * src/app/(auth)/register.tsx
 * Registration screen — full name, email, password, confirm password.
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
import { Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    const result = await signUp(email.trim(), password, name.trim());
    if (result.success) {
      router.replace("/(tabs)/home");
    } else {
      setError(result.error ?? "Registration failed.");
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
          </Pressable>

          <Text style={[styles.heading, { color: colors.textPrimary }]}>Create account</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Start finding pharmacies near you.
          </Text>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.error + "18" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Full name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Full name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Jane Doe"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
            <View style={[styles.pwRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.pwInput, { color: colors.textPrimary }]}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                {showPw ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}
              </Pressable>
            </View>
          </View>

          {/* Confirm */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Confirm password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Repeat password"
              placeholderTextColor={colors.textSecondary}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
          </View>

          <Pressable
            onPress={handleSignUp}
            style={[styles.btn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={[styles.link, { color: colors.primary }]}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, gap: 16 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 15 },
  heading: { fontSize: 28, fontWeight: "700", letterSpacing: -0.4 },
  sub: { fontSize: 15, marginBottom: 4 },
  errorBanner: { padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, textAlign: "center" },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  pwRow: { height: 50, borderWidth: 1, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 8 },
  pwInput: { flex: 1, fontSize: 15 },
  btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  link: { fontWeight: "600", fontSize: 14 },
});

