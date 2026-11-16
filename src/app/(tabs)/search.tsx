/**
 * src/app/(tabs)/search.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Search tab — coming-soon placeholder for the medicine search feature.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlaskConical } from "lucide-react-native";
import { useTheme } from "@/theme";

export default function SearchScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
          <FlaskConical size={52} color={colors.primary} strokeWidth={1.5} />
        </View>

        <Text style={[styles.heading, { color: colors.textPrimary }]}>Medicine search is coming</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Soon you'll be able to search for medicines and check their availability in nearby pharmacies — right from this screen.
        </Text>

        {/* Visual teaser */}
        <View style={[styles.teaser, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.teaserInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Search a medicine…</Text>
          </View>
          {["Paracetamol 500mg", "Amoxicillin 250mg", "Ibuprofen 400mg"].map((name) => (
            <View key={name} style={[styles.teaserRow, { borderBottomColor: colors.border }]}>
              <FlaskConical size={16} color={colors.textSecondary} />
              <Text style={[styles.teaserText, { color: colors.textSecondary }]}>{name}</Text>
              <View style={[styles.availBadge, { backgroundColor: colors.success + "20" }]}>
                <Text style={[styles.availText, { color: colors.success }]}>Available</Text>
              </View>
            </View>
          ))}
          <View style={styles.teaserBlur} pointerEvents="none" />
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>Coming in a future update</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 20 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 24, fontWeight: "700", textAlign: "center", letterSpacing: -0.3 },
  body: { fontSize: 15, textAlign: "center", lineHeight: 22 },

  teaser: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 14, gap: 10, opacity: 0.7, overflow: "hidden" },
  teaserInput: { height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, justifyContent: "center" },
  teaserRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  teaserText: { flex: 1, fontSize: 14 },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  availText: { fontSize: 11, fontWeight: "700" },
  teaserBlur: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },

  hint: { fontSize: 13, fontStyle: "italic" },
});

