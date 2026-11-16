/**
 * src/app/settings.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Settings screen — pushed modally from the header cog icon.
 * Options: theme, location info, edit profile, rate app, privacy, about,
 *          sign out.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Heart,
  Info,
  Lock,
  LogOut,
  Map,
  Moon,
  Star,
  Sun,
  SunMoon,
  User,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuthStore } from "@/store/authStore";
import type { Theme } from "@/theme";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return <Text style={[s.sectionHeader, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>;
}

function SettingsRow({
  Icon,
  label,
  onPress,
  right,
  tint,
}: {
  Icon: any;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  tint?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      disabled={!onPress}
    >
      <View style={[s.rowIcon, { backgroundColor: (tint ?? colors.primary) + "18" }]}>
        <Icon size={18} color={tint ?? colors.primary} />
      </View>
      <Text style={[s.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      {right ?? <ChevronRight size={18} color={colors.textSecondary} />}
    </Pressable>
  );
}

function ThemeChip({ value, label, Icon }: { value: Theme; label: string; Icon: any }) {
  const { theme, setTheme, colors } = useTheme();
  const active = theme === value;
  return (
    <Pressable
      onPress={() => setTheme(value)}
      style={[
        s.themeChip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Icon size={16} color={active ? "#fff" : colors.textSecondary} />
      <Text style={[s.chipLabel, { color: active ? "#fff" : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.textPrimary }]}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardLabel, { color: colors.textPrimary }]}>Theme</Text>
          <View style={s.themeRow}>
            <ThemeChip value="light" label="Light" Icon={Sun} />
            <ThemeChip value="dark" label="Dark" Icon={Moon} />
            <ThemeChip value="system" label="System" Icon={SunMoon} />
          </View>
        </View>

        {/* Account */}
        <SectionHeader label="Account" />
        {user ? (
          <>
            <SettingsRow Icon={User} label="Edit profile" onPress={() => { /* future profile edit screen */ }} />
            <SettingsRow Icon={Heart} label="My favorites" onPress={() => { router.back(); router.push("/(tabs)/favorites"); }} />
            <SettingsRow Icon={LogOut} label="Sign out" onPress={handleSignOut} tint={colors.error} right={null} />
          </>
        ) : (
          <SettingsRow Icon={User} label="Sign in / Create account" onPress={() => { router.back(); router.push("/(auth)/login"); }} />
        )}

        {/* Map & Location */}
        <SectionHeader label="Location" />
        <SettingsRow
          Icon={Map}
          label="Location permission"
          onPress={() => Linking.openSettings()}
          right={<Text style={[s.muted, { color: colors.textSecondary }]}>Manage →</Text>}
        />

        {/* General */}
        <SectionHeader label="General" />
        <SettingsRow Icon={Star} label="Rate PharmaNear" onPress={() => { /* deep link to store */ }} />
        <SettingsRow Icon={Lock} label="Privacy policy" onPress={() => Linking.openURL("https://pharmanear.app/privacy")} />
        <SettingsRow Icon={Info} label="Terms of service" onPress={() => Linking.openURL("https://pharmanear.app/terms")} />

        {/* About */}
        <SectionHeader label="About" />
        <View style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.rowIcon, { backgroundColor: colors.primary + "18" }]}>
            <Info size={18} color={colors.primary} />
          </View>
          <Text style={[s.rowLabel, { color: colors.textPrimary }]}>Version</Text>
          <Text style={[s.muted, { color: colors.textSecondary }]}>v{APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 8 },

  sectionHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginTop: 16, marginBottom: 4 },

  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardLabel: { fontSize: 14, fontWeight: "600" },
  themeRow: { flexDirection: "row", gap: 8 },
  themeChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  chipLabel: { fontSize: 13, fontWeight: "600" },

  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  muted: { fontSize: 13 },
});

