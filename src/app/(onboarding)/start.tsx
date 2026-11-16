/**
 * src/app/(onboarding)/start.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Three-page onboarding. Shown only once — after completion a flag is stored
 * in SecureStore and the user is sent to the login screen.
 *
 * "Skip" on any page → marks onboarding done and goes straight to login.
 * Last page "Get Started" → same.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Clock, Navigation } from "lucide-react-native";
import { useTheme } from "@/theme";

const { width: SCREEN_W } = Dimensions.get("window");

const PAGES = [
  {
    id: "1",
    Icon: MapPin,
    heading: "Healthcare starts closer",
    description:
      "Discover pharmacies around your current location and find the nearest places to get the care you need.",
  },
  {
    id: "2",
    Icon: Clock,
    heading: "Never waste a trip",
    description:
      "Quickly identify pharmacies that are currently open, operating 24/7 or available during on-duty hours.",
  },
  {
    id: "3",
    Icon: Navigation,
    heading: "Your pharmacy, just a tap away",
    description:
      "Explore pharmacy details, contact info, and directions to find the right pharmacy fast.",
  },
];

export default function OnboardingStart() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finish = async () => {
    await SecureStore.setItemAsync("onboarding-done", "true");
    router.replace("/(auth)/login");
  };

  const goNext = () => {
    if (activeIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={styles.skipRow}>
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent + "33" }]}>
              <item.Icon size={56} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>{item.heading}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Indicators + CTA */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? colors.primary : colors.border,
                  width: i === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.ctaText}>
            {activeIndex === PAGES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  skipRow: { alignItems: "flex-end", paddingHorizontal: 24, paddingTop: 8 },
  skipText: { fontSize: 15, fontWeight: "500" },

  page: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
    alignItems: "center",
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 8, borderRadius: 4 },

  ctaBtn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

