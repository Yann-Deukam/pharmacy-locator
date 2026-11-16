
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Appearance,
  type ColorSchemeName,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "nativewind";

import { darkColors, lightColors } from "./colors";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  colorScheme: "light" | "dark";
  isDark: boolean;
  isLoading: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  colors: typeof lightColors | typeof darkColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );
  const [isLoading, setIsLoading] = useState(true);

  const { setColorScheme } = useColorScheme();

  // Load saved theme preference
  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync("user-theme");

        if (
          isMounted &&
          (savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system")
        ) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }) => {
        setSystemScheme(colorScheme ?? "light");
      }
    );

    return () => subscription.remove();
  }, []);

  // Change and persist theme
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);

    try {
      await SecureStore.setItemAsync("user-theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  }, []);

  // Resolve effective theme
  const colorScheme =
    theme === "system"
      ? systemScheme ?? "light"
      : theme;

  const isDark = colorScheme === "dark";

  // Synchronize NativeWind color scheme.
  // We call setColorScheme on every colorScheme change (including during
  // initial load) but wrap it in try/catch so a timing issue never crashes
  // the app. tailwind.config must have darkMode: 'class' for this to work.
  useEffect(() => {
    try {
      setColorScheme(colorScheme);
    } catch (e) {
      // NativeWind not yet initialised — will re-sync on next render.
      console.warn("[ThemeProvider] setColorScheme failed:", e);
    }
  }, [colorScheme, setColorScheme]);

  const value: ThemeContextValue = {
    theme,
    colorScheme,
    isDark,
    isLoading,
    setTheme,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
