import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeWatcher is a utility component that helps manage theme changes
 * by applying the correct CSS class to the document root (HTML) element
 * on web platforms, and ensuring theme changes are properly reflected.
 */
export function ThemeWatcher() {
  const { isDark } = useTheme();

  // This effect runs whenever the theme changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web platforms, we need to add/remove the 'dark' class on the document
      const root = document.documentElement;
      
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [isDark]);

  // This component doesn't render anything visible
  return null;
}

export default ThemeWatcher; 