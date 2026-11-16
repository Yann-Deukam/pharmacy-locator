/**
 * src/app/(auth)/_layout.tsx
 * Auth group layout — no headers, all dark/light handled by screens.
 */
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

