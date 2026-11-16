// app/(onboarding)/[...onboarding].tsx
// Simple three‑page onboarding flow using Expo Router's "catch‑all" segment.
// Stores a flag in SecureStore so the flow is shown only once.

import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const pages = [
  {
    title: "Healthcare starts closer",
    description: "Discover pharmacies around your current location and find the nearest places to get the care you need.",
    image: require("../../../assets/onboarding1.jpg"),
  },
  {
    title: "Never waste a trip",
    description: "Quickly identify pharmacies that are currently open, operating 24/7 or available during on‑duty hours when verified information is available.",
    image: require("../../../assets/onboarding2.jpg"),
  },
  {
    title: "Your pharmacy, just a tap away",
    description: "Explore pharmacy details, contact information and directions to help you find the right pharmacy.",
    image: require("../../../assets/onboarding3.jpg"),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // If onboarding already completed, skip directly to the main tabs.
    (async () => {
      const done = await SecureStore.getItemAsync("onboarding-done");
      if (done === "true") router.replace("/(tabs)/home");
    })();
  }, []);

  const next = () => {
    if (index < pages.length - 1) setIndex(index + 1);
    else finish();
  };

  const skip = () => finish();

  const finish = async () => {
    await SecureStore.setItemAsync("onboarding-done", "true");
    router.replace("/(tabs)/home");
  };

  const { title, description, image } = pages[index];

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      <View style={styles.indicatorRow}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.indicator, i === index && styles.active]} />
        ))}
      </View>
      <View style={styles.buttonRow}>
        {index < pages.length - 1 && (
          <Pressable onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
        <Pressable onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextText}>{index === pages.length - 1 ? "Get Started" : "Next"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  image: { width: "80%", height: 200, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  desc: { fontSize: 16, textAlign: "center", color: "#64748B", marginBottom: 24 },
  indicatorRow: { flexDirection: "row", marginBottom: 24 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E2E8F0", marginHorizontal: 4 },
  active: { backgroundColor: "#0F766E" },
  buttonRow: { flexDirection: "row", alignItems: "center" },
  skipBtn: { marginRight: 16 },
  skipText: { color: "#64748B" },
  nextBtn: { backgroundColor: "#0F766E", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  nextText: { color: "#fff", fontWeight: "600" },
});

