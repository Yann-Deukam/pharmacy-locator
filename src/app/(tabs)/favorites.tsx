/**
 * src/app/(tabs)/favorites.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Favorites tab.
 * - Authenticated users: list of saved pharmacies from Supabase.
 * - Guests: prompt to log in.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, Navigation, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { favorites, load, remove } = useFavoritesStore();
  const router = useRouter();

  useEffect(() => {
    if (user) load(user.id);
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.empty}>
          <Heart size={48} color={colors.primary} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Save your favorite pharmacies</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Sign in to save pharmacies and access them quickly next time.
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
      <Text style={[styles.title, { color: colors.textPrimary }]}>Favorites</Text>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={40} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved pharmacies yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Tap the heart icon on a pharmacy to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: f }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardName, { color: colors.textPrimary }]} numberOfLines={1}>{f.place_name}</Text>
                <Text style={[styles.cardAddress, { color: colors.textSecondary }]} numberOfLines={1}>{f.place_address}</Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.place_name)}`;
                    Linking.openURL(url);
                  }}
                  style={[styles.iconBtn, { backgroundColor: colors.primary + "18" }]}
                >
                  <Navigation size={16} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => remove(user.id, f.place_id)}
                  style={[styles.iconBtn, { backgroundColor: colors.error + "15" }]}
                >
                  <Trash2 size={16} color={colors.error} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  cardAddress: { fontSize: 13 },
  cardActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyBody: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

