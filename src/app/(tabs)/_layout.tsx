
import { useTheme } from "@/theme";
import { Tabs } from "expo-router";
import { Heart, Home, Search, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ITEMS = [
  { name: "home", label: "Home", Icon: Home },
  { name: "search", label: "Search", Icon: Search },
  { name: "favorites", label: "Favorites", Icon: Heart },
  { name: "profile", label: "Profile", Icon: User },
] as const;

function FloatingTabBar({ state, navigateToTab }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.barWrapper,
        { paddingBottom: insets.bottom + 8 },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.primaryDark,
          },
        ]}
      >
        {TAB_ITEMS.map((item, index) => {
          const isFocused = state.index === index;
          const { Icon } = item;

          return (
            <Pressable
              key={item.name}
              onPress={() => navigateToTab(state.routes[index].key)}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isFocused }}
            >
              {isFocused && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                />
              )}

              <Icon
                size={22}
                color={
                  isFocused ? colors.primary : colors.textSecondary
                }
                strokeWidth={isFocused ? 2.2 : 1.6}
              />

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused
                      ? colors.primary
                      : colors.textSecondary,
                  },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    pointerEvents: "box-none",
  },
  bar: {
    flexDirection: "row",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 2,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  tabLabelActive: {
    fontWeight: "700",
  },
});
