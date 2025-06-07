import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Badge, { BadgeVariant } from './Badge';

export interface Job {
  id: number;
  title: string;
  customer: string;
  address: string;
  scheduled: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface JobItemProps {
  job: Job;
}

type IconName = 'time-outline' | 'play-outline' | 'checkmark-done-outline' | 'help-outline' |
  'bug-outline' | 'flask-outline' | 'paw-outline' | 'build-outline' |
  'location-outline' | 'calendar-outline' | 'navigate-outline' | 'call-outline' |
  'time' | 'checkmark-circle' | 'alert-circle' | 'person-outline';

export default function JobItem({ job }: JobItemProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Get status color and icon
  const getStatusInfo = (status: string): { icon: IconName; label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time',
          label: 'Pending',
          variant: 'pending'
        };
      case 'in_progress':
        return {
          icon: 'play-outline',
          label: 'In Progress',
          variant: 'in_progress'
        };
      case 'completed':
        return {
          icon: 'checkmark-circle',
          label: 'Completed',
          variant: 'completed'
        };
      default:
        return {
          icon: 'help-outline',
          label: 'Unknown',
          variant: 'default'
        };
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Format time only
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Determine if job is today
  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const jobDate = new Date(dateString);
    return today.toDateString() === jobDate.toDateString();
  };

  const { icon, label, variant } = getStatusInfo(job.status);
  const jobDate = new Date(job.scheduled);
  const isPastDue = jobDate < new Date() && job.status !== 'completed';

  // Get time remaining or past due text
  const getTimeText = (): { text: string; isUrgent: boolean } => {
    if (job.status === 'completed') {
      return { text: 'Completed', isUrgent: false };
    }

    const now = new Date();
    const jobTime = new Date(job.scheduled);
    const diffMs = jobTime.getTime() - now.getTime();
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      // Past due
      const hoursPast = Math.abs(diffHrs);
      return {
        text: hoursPast < 24
          ? `${hoursPast}h overdue`
          : `${Math.floor(hoursPast / 24)}d overdue`,
        isUrgent: true
      };
    } else if (diffHrs < 24) {
      // Due soon (within 24 hours)
      return {
        text: diffHrs < 1
          ? 'Due now'
          : `In ${diffHrs}h`,
        isUrgent: diffHrs < 3
      };
    } else {
      // Future date
      const days = Math.floor(diffHrs / 24);
      return {
        text: `In ${days} day${days > 1 ? 's' : ''}`,
        isUrgent: false
      };
    }
  };

  const timeInfo = getTimeText();

  return (
    <Link href={{
      pathname: '/(tabs)/job/[id]',
      params: { id: job.id }
    }}
    asChild
    >
      <Pressable
        className={`my-2 mx-1 rounded-xl ${isDarkMode ? 'dark' : ''} bg-card border-border shadow-sm border elevation-1`}
      >
        <View className="p-4">
          {/* Header with Title and Status Badge */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-base font-bold text-foreground">{job.title}</Text>
            </View>
            <Badge
              label={label}
              icon={icon}
              variant={variant}
            />
          </View>

          {/* Customer Info */}
          <View className="flex-row items-center mb-3">
            <View className="h-6 w-6 rounded-full bg-secondary items-center justify-center mr-2">
              <Ionicons name="person-outline" size={14} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
            </View>
            <Text className="text-sm text-foreground">{job.customer}</Text>
          </View>

          {/* Schedule and Address Info */}
          <View className="space-y-1.5 mb-4">
            <View className="flex-row items-center">
              <View className="w-6 h-6 flex items-center justify-center mr-2">
                <Ionicons name="calendar-outline" size={14} color={isDarkMode ? "#a1a1aa" : "#6b7280"} />
              </View>
              <Text className="text-xs text-muted-foreground">
                {isToday(job.scheduled) ? 'Today, ' : formatDate(job.scheduled).split(',')[0] + ', '}
                {formatTime(job.scheduled)}
                {timeInfo.isUrgent && (
                  <Text className="text-destructive font-medium"> • {timeInfo.text}</Text>
                )}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 flex items-center justify-center mr-2">
                <Ionicons name="location-outline" size={14} color={isDarkMode ? "#a1a1aa" : "#6b7280"} />
              </View>
              <Text className="text-xs text-muted-foreground flex-1">{job.address}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row">
            <TouchableOpacity className="bg-secondary w-8 h-8 rounded-full items-center justify-center mr-2">
              <Ionicons name="navigate-outline" size={16} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
            </TouchableOpacity>

            <TouchableOpacity className="bg-secondary w-8 h-8 rounded-full items-center justify-center mr-2">
              <Ionicons name="call-outline" size={16} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
            </TouchableOpacity>

            <TouchableOpacity className="bg-secondary w-8 h-8 rounded-full items-center justify-center">
              <Ionicons name="information-circle-outline" size={16} color={isDarkMode ? "#a5b4fc" : "#6366f1"} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Link>
  );
} 