
import { useRouter } from "expo-router";
import { ArrowLeft, Moon, Settings, Sun } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const Header = ({
  title,
  showBackButton = true,
}: HeaderProps) => {
  const router = useRouter();
  const { theme, setTheme, colorScheme } = useTheme();

  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#101C1B" : "#F0FDFA",
    text: isDark ? "#F0FDFA" : "#1F2937",
    border: isDark ? "#263A38" : "#E2E8F0",
    button: isDark ? "#1C302E" : "#FFFFFF",
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.side}>
        {showBackButton && (
          <Pressable
            onPress={handleBack}
            style={[styles.iconButton, { backgroundColor: colors.button }]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View style={[styles.side, styles.rightGroup]}>
        <Pressable
          onPress={toggleTheme}
          style={[styles.iconButton, { backgroundColor: colors.button }]}
          hitSlop={8}
        >
          {isDark ? (
            <Sun size={19} color={colors.text} />
          ) : (
            <Moon size={19} color={colors.text} />
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/settings")}
          style={[styles.iconButton, { backgroundColor: colors.button }]}
          hitSlop={8}
        >
          <Settings size={19} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 60,
  },
  side: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    flex: 2,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  rightGroup: {
    justifyContent: "flex-end",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
