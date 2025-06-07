import { Ionicons } from '@expo/vector-icons';
import { Text, useColorScheme, View } from 'react-native';

type IconName = 'time-outline' | 'play-outline' | 'checkmark-done-outline' | 'help-outline' |
  'bug-outline' | 'flask-outline' | 'paw-outline' | 'build-outline' |
  'location-outline' | 'calendar-outline' | 'navigate-outline' | 'call-outline' |
  'time' | 'checkmark-circle' | 'alert-circle' | 'person-outline';

export type BadgeVariant = 
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 
  'warning' | 'info' | 'emerald' | 'amber' | 'blue' | 'indigo' | 
  'slate' | 'pending' | 'canceled' | 'completed' | 'in_progress' | 
  'purple' | 'rose' | 'neutral' | 'paid' | 'overdue';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
}

// Define colors in a single object for better maintainability
const LIGHT_VARIANT_STYLES = {
  default: {
    background: '#0f172a', // primary bg
    border: 'transparent',
    text: '#ffffff', // primary-foreground
  },
  secondary: {
    background: '#f1f5f9', // secondary bg
    border: 'transparent',
    text: '#0f172a', // secondary-foreground
  },
  destructive: {
    background: '#fef2f2', // red-50
    border: '#fecaca', // red-200
    text: '#b91c1c', // red-700
  },
  outline: {
    background: 'transparent',
    border: '#e2e8f0', // border color
    text: '#0f172a', // foreground
  },
  success: {
    background: '#f0fdf4', // green-50
    border: '#bbf7d0', // green-200
    text: '#15803d', // green-700
  },
  warning: {
    background: '#fffbeb', // amber-50
    border: '#fde68a', // amber-200
    text: '#b45309', // amber-700
  },
  info: {
    background: '#eff6ff', // blue-50
    border: '#bfdbfe', // blue-200
    text: '#1d4ed8', // blue-700
  },
  emerald: {
    background: '#ecfdf5', // emerald-50
    border: '#a7f3d0', // emerald-200
    text: '#047857', // emerald-700
  },
  amber: {
    background: '#fffbeb', // amber-50
    border: '#fde68a', // amber-200
    text: '#b45309', // amber-700
  },
  blue: {
    background: '#eff6ff', // blue-50
    border: '#bfdbfe', // blue-200
    text: '#1d4ed8', // blue-700
  },
  indigo: {
    background: '#eef2ff', // indigo-50
    border: '#c7d2fe', // indigo-200
    text: '#4338ca', // indigo-700
  },
  slate: {
    background: '#f8fafc', // slate-50
    border: '#e2e8f0', // slate-200
    text: '#334155', // slate-700
  },
  pending: {
    background: '#fefce8', // yellow-50
    border: '#fef08a', // yellow-200
    text: '#f59e0b', // yellow/amber-500
  },
  canceled: {
    background: '#fef2f2', // red-50
    border: '#fecaca', // red-200
    text: '#ef4444', // red-500
  },
  completed: {
    background: '#f0fdf4', // green-50
    border: '#bbf7d0', // green-200
    text: '#22c55e', // green-500
  },
  in_progress: {
    background: '#eef2ff', // indigo-50
    border: '#c7d2fe', // indigo-200
    text: '#6366f1', // indigo-500
  },
  purple: {
    background: '#faf5ff', // purple-50
    border: '#e9d5ff', // purple-200
    text: '#7e22ce', // purple-700
  },
  rose: {
    background: '#fff1f2', // rose-50
    border: '#fecdd3', // rose-200
    text: '#be123c', // rose-700
  },
  neutral: {
    background: '#fafafa', // neutral-50
    border: '#e5e5e5', // neutral-200
    text: '#404040', // neutral-700
  },
  paid: {
    background: '#f0fdf4', // green-50
    border: '#bbf7d0', // green-200
    text: '#22c55e', // green-500
  },
  overdue: {
    background: '#fef2f2', // red-50
    border: '#fecaca', // red-200
    text: '#ef4444', // red-500
  },
};


const DARK_VARIANT_STYLES = {
  default: {
    background: '#020817', // dark primary
    border: 'transparent',
    text: '#ffffff',
  },
  secondary: {
    background: '#1e293b', // dark secondary
    border: 'transparent',
    text: '#f8fafc',
  },
  destructive: {
    background: 'rgba(127, 29, 29, 0.6)', // red-950/60
    border: 'rgba(153, 27, 27, 0.6)', // red-800/60
    text: '#f87171', // red-400
  },
  outline: {
    background: 'transparent',
    border: '#1e293b', // dark border
    text: '#f8fafc', // dark foreground
  },
  success: {
    background: 'rgba(5, 46, 22, 0.3)', // green-950/30
    border: 'rgba(22, 101, 52, 0.6)', // green-800/60
    text: '#4ade80', // green-400
  },
  warning: {
    background: 'rgba(78, 53, 0, 0.3)', // amber-950/30
    border: 'rgba(146, 64, 14, 0.6)', // amber-800/60
    text: '#fbbf24', // amber-400
  },
  info: {
    background: 'rgba(23, 37, 84, 0.3)', // blue-950/30
    border: 'rgba(30, 64, 175, 0.6)', // blue-800/60
    text: '#60a5fa', // blue-400
  },
  emerald: {
    background: 'rgba(6, 78, 59, 0.2)', // emerald-900/20
    border: 'rgba(6, 78, 59, 0.3)', // emerald-900/30
    text: '#34d399', // emerald-400
  },
  amber: {
    background: 'rgba(120, 53, 15, 0.2)', // amber-900/20
    border: 'rgba(120, 53, 15, 0.3)', // amber-900/30
    text: '#fbbf24', // amber-400
  },
  blue: {
    background: 'rgba(23, 37, 84, 0.3)', // blue-950/30
    border: 'rgba(30, 64, 175, 0.6)', // blue-800/60
    text: '#60a5fa', // blue-400
  },
  indigo: {
    background: 'rgba(30, 27, 75, 0.3)', // indigo-950/30
    border: 'rgba(55, 48, 163, 0.6)', // indigo-800/60
    text: '#818cf8', // indigo-400
  },
  slate: {
    background: 'rgba(15, 23, 42, 0.1)', // slate-900/10
    border: '#1e293b', // slate-800
    text: '#94a3b8', // slate-400
  },
  pending: {
    background: 'rgba(113, 63, 18, 0.3)', // yellow-950/30
    border: 'rgba(133, 77, 14, 0.6)', // yellow-800/60
    text: '#facc15', // yellow-400
  },
  canceled: {
    background: 'rgba(127, 29, 29, 0.3)', // red-950/30
    border: 'rgba(153, 27, 27, 0.6)', // red-800/60
    text: '#f87171', // red-400
  },
  completed: {
    background: 'rgba(5, 46, 22, 0.3)', // green-950/30
    border: 'rgba(22, 101, 52, 0.6)', // green-800/60
    text: '#4ade80', // green-400
  },
  in_progress: {
    background: 'rgba(30, 27, 75, 0.3)', // indigo-950/30
    border: 'rgba(55, 48, 163, 0.6)', // indigo-800/60
    text: '#818cf8', // indigo-400
  },
  purple: {
    background: 'rgba(41, 37, 36, 0.3)', // purple-950/30
    border: 'rgba(107, 33, 168, 0.6)', // purple-800/60
    text: '#a78bfa', // purple-400
  },
  rose: {
    background: 'rgba(76, 5, 25, 0.3)', // rose-950/30
    border: 'rgba(159, 18, 57, 0.6)', // rose-800/60
    text: '#fb7185', // rose-400
  },
  neutral: {
    background: 'rgba(23, 23, 23, 0.1)', // neutral-900/10
    border: '#262626', // neutral-800
    text: '#a3a3a3', // neutral-400
  },
  paid: {
    background: 'rgba(5, 46, 22, 0.3)', // green-950/30
    border: 'rgba(22, 101, 52, 0.6)', // green-800/60
    text: '#4ade80', // green-400
  },
  overdue: {
    background: 'rgba(127, 29, 29, 0.3)', // red-950/30
    border: 'rgba(153, 27, 27, 0.6)', // red-800/60
    text: '#f87171', // red-400
  },
};


export default function Badge({
  label,
  variant = 'default',
  icon,
  size = 'md'
}: BadgeProps) {
  const colorScheme = useColorScheme();

  const VARIANT_STYLES = colorScheme === 'dark' ? DARK_VARIANT_STYLES : LIGHT_VARIANT_STYLES;

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      default: return 'text-xs';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 16;
      default: return 14;
    }
  };

  // Get the current variant's styles
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  
  const containerStyle = {
    paddingRight: 8,
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 9999,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: variantStyle.border,
    backgroundColor: variantStyle.background,
  };

  return (
    <View
      className={`rounded-full flex-row items-center`}
      style={containerStyle}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={variantStyle.text}
          className='mr-2'
        />
      )}
      <Text 
        className={`${getTextSize()} font-medium`} 
        style={{ color: variantStyle.text }}
      >
        {label}
      </Text>
    </View>
  );
}
