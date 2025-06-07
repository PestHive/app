import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemeType = 'light' | 'dark';

// Theme storage key
const THEME_STORAGE_KEY = 'theme_preference';

// Define theme colors
export const lightColors = {
  background: "#FFFFFF",
  foreground: "#191919",
  card: "#FFFFFF",
  cardForeground: "#191919",
  popover: "#FFFFFF",
  popoverForeground: "#191919",
  primary: "#3b82f6",
  primaryForeground: "#FFFFFF",
  secondary: "#F7F7F7",
  secondaryForeground: "#242424",
  muted: "#F7F7F7",
  mutedForeground: "#757575",
  accent: "#F7F7F7",
  accentForeground: "#242424",
  destructive: "#E54D2E",
  border: "#EBEBEB",
  input: "#EBEBEB",
  ring: "#B4B4B4",
};

export const darkColors = {
  background: "#191919",
  foreground: "#FBFBFB",
  card: "#242424",
  cardForeground: "#FBFBFB",
  popover: "#333333",
  popoverForeground: "#FBFBFB",
  primary: "#60a5fa",
  primaryForeground: "#FFFFFF",
  secondary: "#333333",
  secondaryForeground: "#FBFBFB",
  muted: "#333333",
  mutedForeground: "#B4B4B4",
  accent: "#454545",
  accentForeground: "#FBFBFB",
  destructive: "#FFA09E",
  border: "rgba(255, 255, 255, 0.1)",
  input: "rgba(255, 255, 255, 0.15)",
  ring: "#757575",
};

type ColorScheme = typeof lightColors;

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ColorScheme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  const [isLoading, setIsLoading] = useState(true);
  const { setColorScheme } = useColorScheme();
  // Load saved theme on startup
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, []);


  // Set theme with persistence
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setColorScheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;
  const isDark = theme === 'dark';

  // Show loading state or children
  if (isLoading) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
