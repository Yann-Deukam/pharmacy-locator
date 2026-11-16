/**
 * src/app/(onboarding)/_layout.tsx
 * Thin layout wrapper for the onboarding group so Expo Router
 * recognises it as a proper route group and doesn't show a header.
 */
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

