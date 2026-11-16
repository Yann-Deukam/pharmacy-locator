/**
 * src/app/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * App entry point.
 * Decision tree on first load:
 *   1. Onboarding not done yet → go to onboarding
 *   2. Onboarding done, no session → go to login
 *   3. Session exists (or guest flag) → go to home tabs
 *
 * Shows a splash/loading indicator while state is being resolved.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/theme";

type Destination = "onboarding" | "auth" | "tabs" | null;

export default function Index() {
  const [destination, setDestination] = useState<Destination>(null);
  const { init, user, isGuest } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      // 1. Restore Supabase session
      await init();

      // 2. Check onboarding flag
      const onboardingDone = await SecureStore.getItemAsync("onboarding-done");

      if (onboardingDone !== "true") {
        setDestination("onboarding");
        return;
      }

      // 3. User is logged in or chose guest mode
      const { user: currentUser, isGuest: currentGuest } = useAuthStore.getState();
      if (currentUser || currentGuest) {
        setDestination("tabs");
      } else {
        setDestination("auth");
      }
    })();
  }, []);

  if (destination === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (destination === "onboarding") return <Redirect href="/(onboarding)/start" />;
  if (destination === "auth") return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/home" />;
}
