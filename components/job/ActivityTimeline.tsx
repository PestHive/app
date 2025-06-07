import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Badge from "../../components/Badge";

interface History {
  id: number;
  action:
    | "created"
    | "scheduled"
    | "started"
    | "completed"
    | "comment"
    | "status_updated";
  occurred_at: string;
  occurred_by?: {
    name: string;
  };
  comment?: string;
}

interface ActivityTimelineProps {
  jobHistory: History[];
  getActionBadgeDetails: (history: History) => { variant: any; text: string };
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  jobHistory,
  getActionBadgeDetails,
}) => {
  // Get icon based on action type
  const getActionIcon = (action: string): string => {
    switch (action) {
      case "created":
        return "build-outline";
      case "scheduled":
        return "calendar-outline";
      case "started":
        return "play-outline";
      case "completed":
        return "checkmark-circle";
      case "comment":
        return "person-outline";
      case "status_updated":
        return "time-outline";
      default:
        return "time-outline";
    }
  };

  // Get color based on action
  const getActionColor = (action: string): string => {
    switch (action) {
      case "created":
        return "#818cf8"; // Indigo
      case "scheduled":
        return "#f59e0b"; // Amber
      case "started":
        return "#3b82f6"; // Blue
      case "completed":
        return "#22c55e"; // Green
      case "comment":
        return "#64748b"; // Slate
      case "status_updated":
        return "#8b5cf6"; // Violet
      default:
        return "#94a3b8"; // neutral
    }
  };

  return (
    <View className="bg-card rounded-xl p-4 mb-4">
      {jobHistory.map((history, index) => {
        const isFirst = index === 0;
        const isLast = index === jobHistory.length - 1;
        const { variant, text } = getActionBadgeDetails(history);

        const iconName = getActionIcon(history.action);
        const iconColor = getActionColor(history.action);

        return (
          <View key={history.id} className={`flex-row ${!isLast ? "mb-5" : ""}`}>
            {/* Timeline connector and icon */}
            <View className="mr-3 items-center">
              {/* Line to previous event */}
              {!isFirst && <View className="h-3 w-0.5 bg-border" />}

              {/* Icon in circle */}
              <View
                className={`h-8 w-8 rounded-full items-center justify-center z-10`}
                style={{ backgroundColor: `${iconColor}20` }}
              >
                <Ionicons name={iconName} size={16} color={iconColor} />
              </View>

              {/* Line to next event */}
              {!isLast && <View className="flex-1 w-0.5 bg-border" />}
            </View>

            {/* Event content */}
            <View className="flex-1 pb-2">
              {/* Date and badge in header */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted-foreground font-medium">
                  {new Date(history.occurred_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {new Date(history.occurred_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </Text>
              </View>

              {/* Event title with badge */}
              <View className="flex-row items-center mb-1">
                <Badge label={text} variant={variant} />
                <Text className="text-xs text-muted-foreground ml-2">
                  by {history.occurred_by?.name || "System"}
                </Text>
              </View>

              {/* Comment if present */}
              {history.comment && (
                <View className="bg-secondary p-3 rounded-lg mt-1">
                  <Text className="text-foreground">{history.comment}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ActivityTimeline; 