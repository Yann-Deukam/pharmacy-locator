/**
 * src/app/_layout.tsx
 * Root layout — registers all route groups and global providers.
 */

import { ThemeProvider } from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Entry point decides where to route */}
              <Stack.Screen name="index" />
              {/* Onboarding group */}
              <Stack.Screen name="(onboarding)" />
              {/* Auth group */}
              <Stack.Screen name="(auth)" />
              {/* Main tabs */}
              <Stack.Screen name="(tabs)" />
              {/* Settings — pushed modally from any tab */}
              <Stack.Screen
                name="settings"
                options={{ presentation: "modal", animation: "slide_from_bottom" }}
              />
            </Stack>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
