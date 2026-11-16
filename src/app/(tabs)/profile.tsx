/**
 * src/app/(tabs)/profile.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Profile tab.
 * - Authenticated: avatar initials, name, email, links to settings/favorites.
 * - Guest / not signed in: prompt to sign in.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Heart, LogOut, Settings, Star, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";

function MenuItem({
  Icon,
  label,
  onPress,
  color,
}: {
  Icon: any;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color ?? colors.primary) + "18" }]}>
        <Icon size={18} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{label}</Text>
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const router = useRouter();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "G";
  const displayName = user?.email?.split("@")[0] ?? "Guest";

  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.empty}>
          <User size={48} color={colors.primary} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sign in to your account</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Create an account to save your favorite pharmacies and sync them across devices.
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={[styles.btn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.btnText}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        <View style={[styles.statBadge, { backgroundColor: colors.primary + "18" }]}>
          <Heart size={12} color={colors.primary} fill={colors.primary} />
          <Text style={[styles.statText, { color: colors.primary }]}>
            {favorites.length} {favorites.length === 1 ? "favorite" : "favorites"}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem Icon={Settings} label="Settings" onPress={() => router.push("/settings")} />
        <MenuItem Icon={Heart} label="My Favorites" onPress={() => router.push("/(tabs)/favorites")} />
        <MenuItem Icon={Star} label="Rate the app" onPress={() => { /* open store link */ }} />
        <MenuItem Icon={LogOut} label="Sign out" onPress={async () => { await signOut(); router.replace("/(auth)/login"); }} color={colors.error} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  avatarSection: { alignItems: "center", paddingTop: 32, paddingBottom: 24, gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14 },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  statText: { fontSize: 12, fontWeight: "600" },

  menu: { paddingHorizontal: 20, gap: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyBody: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

