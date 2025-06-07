import { View, type ViewProps } from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import { cn } from '~/lib/utils';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {
  const { isDark } = useTheme();
  return <View className={cn("flex-1", isDark ? "dark" : "light", className)}
    {...otherProps} />;
}
