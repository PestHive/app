import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { BadgeVariant } from '~/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Appointment } from '../../../app/(customer)/appointment/[id]';

// Define the ActivityLogEntry type
export interface ActivityLogEntry {
  id: number;
  action: string; // e.g., "created", "rescheduled", "cancelled", "completed", "note_added", "status_changed",
  comment?: string;
  occurred_at: string;
  status?: {
    code: string;
    name: string;
  };
  occurred_by?: {
    id: number;
    name: string;
    role?: string;
  };
}

// Props for the ActivityLogSection component
interface ActivityLogSectionProps {
  appointment: Appointment | null;
}

// Helper functions for activity log styling
const getActionIcon = (action: string): keyof typeof Ionicons.glyphMap => {
  switch (action.toLowerCase()) {
    case 'created':
      return 'add-circle';
    case 'rescheduled':
      return 'calendar';
    case 'cancelled':
      return 'close-circle';
    case 'completed':
      return 'checkmark-circle';
    case 'note_added':
      return 'document-text';
    case 'technician_assigned':
      return 'person-add';
    case 'payment_received':
      return 'card';
    case 'status_changed':
      return 'sync-circle';
    default:
      return 'information-circle';
  }
};

const getActionColor = (action: string, statusCode?: string): string => {
  if (action.toLowerCase() === 'status_changed' && statusCode) {
    switch (statusCode.toLowerCase()) {
      case 'scheduled':
        return '#2196F3'; // Blue
      case 'in_progress':
        return '#FF9800'; // Orange
      case 'completed':
        return '#8BC34A'; // Light Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#607D8B'; // Blue Grey
    }
  }

  switch (action.toLowerCase()) {
    case 'created':
      return '#4CAF50'; // Green
    case 'rescheduled':
      return '#2196F3'; // Blue
    case 'cancelled':
      return '#F44336'; // Red
    case 'completed':
      return '#8BC34A'; // Light Green
    case 'note_added':
      return '#9C27B0'; // Purple
    case 'technician_assigned':
      return '#FF9800'; // Orange
    case 'payment_received':
      return '#00BCD4'; // Cyan
    case 'status_changed':
      return '#607D8B'; // Blue Grey
    default:
      return '#607D8B'; // Blue Grey
  }
};

const getActionBadgeDetails = (activity: ActivityLogEntry): { variant: BadgeVariant; text: string } => {
  if (activity.action.toLowerCase() === 'status_changed' && activity.status) {
    return { variant: 'default', text: `Status changed to ${activity.status.name.toLowerCase()}` };
  }

  switch (activity.action.toLowerCase()) {
    case 'created':
      return { variant: 'info', text: 'Created' };
    case 'rescheduled':
      return { variant: 'warning', text: 'Rescheduled' };
    case 'cancelled':
      return { variant: 'canceled', text: 'Cancelled' };
    case 'completed':
      return { variant: 'completed', text: 'Completed' };
    case 'note_added':
      return { variant: 'blue', text: 'Note Added' };
    case 'technician_assigned':
      return { variant: 'indigo', text: 'Tech Assigned' };
    case 'payment_received':
      return { variant: 'emerald', text: 'Payment Received' };
    case 'status_changed':
      return { variant: 'default', text: 'Status Changed' };
    default:
      return { variant: 'default', text: 'Updated' };
  }
};

// Sample activity log data for demonstration
// Replace this with actual data from your API
const sampleActivityLog: ActivityLogEntry[] = [
  {
    id: 1,
    action: 'created',
    occurred_at: '2023-06-15T09:30:00Z',
    occurred_by: {
      id: 1,
      name: 'John Doe',
      role: 'Customer'
    }
  },
  {
    id: 2,
    action: 'technician_assigned',
    occurred_at: '2023-06-15T10:15:00Z',
    occurred_by: {
      id: 2,
      name: 'Admin User',
      role: 'Admin'
    }
  },
  {
    id: 3,
    action: 'note_added',
    comment: 'Customer requested specific treatment for carpenter ants in the basement area.',
    occurred_at: '2023-06-16T11:45:00Z',
    occurred_by: {
      id: 3,
      name: 'Mike Johnson',
      role: 'Technician'
    }
  },
  {
    id: 4,
    action: 'status_changed',
    occurred_at: '2023-06-17T13:00:00Z',
    status: {
      code: 'in_progress',
      name: 'In Progress'
    },
    occurred_by: {
      id: 3,
      name: 'Mike Johnson',
      role: 'Technician'
    }
  },
  {
    id: 5,
    action: 'rescheduled',
    comment: 'Due to weather conditions, appointment rescheduled to next week.',
    occurred_at: '2023-06-18T14:20:00Z',
    occurred_by: {
      id: 1,
      name: 'John Doe',
      role: 'Customer'
    }
  },
  {
    id: 6,
    action: 'status_changed',
    occurred_at: '2023-06-24T10:00:00Z',
    status: {
      code: 'completed',
      name: 'Completed'
    },
    occurred_by: {
      id: 3,
      name: 'Mike Johnson',
      role: 'Technician'
    }
  },
  {
    id: 7,
    action: 'completed',
    occurred_at: '2023-06-25T15:00:00Z',
    occurred_by: {
      id: 3,
      name: 'Mike Johnson',
      role: 'Technician'
    }
  }
];

const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({ appointment }) => {
  // In a real implementation, you would use appointment.activity_log or similar
  // For now, we'll use the sample data
  const activityLog = appointment?.history || sampleActivityLog;

  const sortedActivityLog = useMemo(() => {
    return [...activityLog].sort((a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
  }, [activityLog]);

  if (!appointment) return null;

  if (activityLog.length === 0) {
    return (
      <View className="mx-4 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">Activity Log</Text>
        <View className="bg-card rounded-xl p-6 items-center justify-center shadow-sm">
          <Ionicons name="document-outline" size={28} color="#9CA3AF" />
          <Text className="text-muted-foreground mt-2 text-center text-base">No activity recorded yet</Text>
        </View>
      </View>
    );
  }

  return (
    <Card className="mx-4 mt-6">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivityLog.map((activity, index) => {
          const { text } = getActionBadgeDetails(activity);
          const iconName = getActionIcon(activity.action);
          const iconColor = getActionColor(activity.action, activity.status?.code);

          return (
            <View key={activity.id} className="mb-1">
              {/* Header with icon, action name and timestamp */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View
                    className="h-8 w-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: `${iconColor}15` }}
                  >
                    <Ionicons name={iconName} size={16} color={iconColor} />
                  </View>

                  <View>
                    <Text className="text-xs text-muted-foreground">
                      by {activity.occurred_by?.name || "System"}
                      {activity.occurred_by?.role && <Text> • {activity.occurred_by.role}</Text>}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">{text}</Text>
                  </View>
                </View>

                <Text className="text-xs text-muted-foreground">
                  {activity.occurred_at}
                </Text>
              </View>

              {/* Comment if present */}
              {activity.comment && (
                <View className="ml-10 bg-background/80 p-3 rounded-md">
                  <Text className="text-foreground text-sm">{activity.comment}</Text>
                </View>
              )}
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivityLogSection; 