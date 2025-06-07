import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  // @ts-ignore
  Dimensions,
  FlatList,
  // @ts-ignore
  Modal,
  // @ts-ignore
  PanResponder,
  // @ts-ignore
  PanResponderGestureState,
  // @ts-ignore
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "~/context/ThemeContext";
import { Notification, authService } from "../services/authService";

interface NotificationDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

// Format time simply
const formatTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);

  // Today
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    return `Today at ${hours % 12 || 12}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday at 9:30 AM";
  }

  // Format date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Memoized notification item component for better performance
const NotificationItem = React.memo(({ 
  item, 
  onPress 
}: { 
  item: Notification; 
  onPress: (notification: Notification) => void;
}) => {
  let iconName = "notifications-outline";
  let iconColor = "#3b82f6"; // primary color

  if (item.type === "job") {
    iconName = "briefcase-outline";
  } else if (item.type === "system") {
    iconName = "information-circle-outline";
    iconColor = "#6366f1"; // indigo-500
  } else if (item.type === "alert") {
    iconName = "warning-outline";
    iconColor = "#f59e0b"; // amber-500
  }

  return (
    <TouchableOpacity
      className={`flex-row p-4 border-b border-border ${
        !item.read ? "bg-blue-50/40 dark:bg-blue-900/20" : ""
      }`}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View className="mr-3 mt-1">
        <Ionicons 
          name={iconName as any} 
          size={22} 
          color={iconColor}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="font-semibold flex-1 mr-3 text-foreground">
            {item.title}
          </Text>
          {!item.read && (
            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </View>
        <Text className="mt-1 text-muted-foreground" numberOfLines={2}>
          {item.message}
        </Text>

        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-xs text-muted-foreground">
            {formatTime(item.timestamp)}
          </Text>

          {item.type === "job" && item.jobId && (
            <View className="flex-row items-center">
              <Ionicons name="briefcase-outline" size={12} color="#94A3B8" />
              <Text className="text-xs text-muted-foreground ml-1">
                Job #{item.jobId}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

NotificationItem.displayName = 'NotificationItem';

const EmptyNotifications = () => (
  <View className="flex-1 justify-center items-center p-6">
    <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4">
      <Ionicons
        name="notifications-off-outline"
        size={40}
        color="#94A3B8"
      />
    </View>
    <Text className="text-base font-bold text-card-foreground">
      No notifications
    </Text>
    <Text className="text-xs text-muted-foreground text-center mt-2">
      We will notify you when something happens
    </Text>
  </View>
);

EmptyNotifications.displayName = 'EmptyNotifications';

const LoadingIndicator = () => (
  <View className="flex-1 justify-center items-center p-6">
    <View className="w-10 h-10 rounded-full border-2 border-t-transparent border-primary animate-spin" />
  </View>
);

LoadingIndicator.displayName = 'LoadingIndicator';

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isVisible,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const screenHeight = Dimensions.get("window").height;
  const insets = useSafeAreaInsets();
  const statusBarHeight = Constants.statusBarHeight || 0;
  const { isDark } = useTheme();

  // Use a simple translateY value
  const translateY = useSharedValue(screenHeight);

  // Simple animation style
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Use standard React Native PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _: any,
        gestureState: PanResponderGestureState
      ) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_: any, gestureState: PanResponderGestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (
        _: any,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          // Close if dragged down enough or with enough velocity
          closeDrawer();
        } else {
          // Return to open position
          translateY.value = withTiming(0, { duration: 250 });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      loadNotifications();
      openDrawer();
    }
  }, [isVisible]);

  const openDrawer = useCallback(() => {
    // Start from bottom
    translateY.value = screenHeight;
    // Animate up
    translateY.value = withTiming(0, { duration: 300 });
  }, [screenHeight, translateY]);

  const closeDrawer = useCallback(() => {
    // Animate down
    translateY.value = withTiming(
      screenHeight,
      {
        duration: 250,
      },
      () => {
        // Make sure onClose is called with runOnJS
        runOnJS(onClose)();
      }
    );
  }, [screenHeight, translateY, onClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Add more test notifications
      const data = await getTestNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get more test notifications
  const getTestNotifications = async (): Promise<Notification[]> => {
    try {
      // Get the original notifications
      const originalData = await authService.getNotifications();

      // Add more test notifications
      const additionalNotifications: Notification[] = [
        {
          id: 6,
          title: "Price Update on Products",
          message:
            "There has been a 10% price increase on pest control chemicals. Please check the updated price list.",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          read: false,
          type: "system",
        },
        {
          id: 7,
          title: "New Training Available",
          message:
            "A new training module on rodent control has been added to your learning portal. Complete it by next week.",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
          read: false,
          type: "system",
        },
        {
          id: 8,
          title: "Customer Complaint",
          message:
            "Customer at 789 Oak Dr has reported seeing pests again. Please schedule a follow-up visit.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          read: false,
          type: "alert",
          jobId: 3,
        },
        {
          id: 9,
          title: "New Assignment",
          message:
            "You have been assigned to handle pest control at Green Hills Mall tomorrow at 8:00 AM.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          read: true,
          type: "job",
          jobId: 5,
        },
        {
          id: 10,
          title: "Equipment Maintenance",
          message:
            "Your spraying equipment is due for maintenance. Please bring it to the office by Friday.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), // 7 hours ago
          read: true,
          type: "system",
        },
        {
          id: 11,
          title: "Traffic Alert",
          message:
            "Heavy traffic reported on Main St. Consider alternative routes for your appointments today.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          read: false,
          type: "alert",
        },
        {
          id: 12,
          title: "Customer Feedback",
          message:
            "You received a 5-star rating from John Smith for your service yesterday. Great job!",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 1.5
          ).toISOString(), // 1.5 days ago
          read: true,
          type: "system",
        },
        {
          id: 13,
          title: "Schedule Change",
          message:
            "Your appointment at Riverside Apartments has been rescheduled to next Monday at 10:00 AM.",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 3
          ).toISOString(), // 3 days ago
          read: true,
          type: "job",
          jobId: 6,
        },
        {
          id: 14,
          title: "Product Recall",
          message:
            "Batch #2234 of termite bait has been recalled. Please check your inventory and return any affected products.",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 5
          ).toISOString(), // 5 days ago
          read: true,
          type: "alert",
        },
        {
          id: 15,
          title: "New Feature Available",
          message:
            "The PestHive app has been updated with new features. Check out the new navigation tool!",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 7
          ).toISOString(), // 7 days ago
          read: true,
          type: "system",
        },
      ];

      // Combine and return
      return [...originalData, ...additionalNotifications];
    } catch (error) {
      console.error("Error getting test notifications:", error);
      return [];
    }
  };

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      // Mark the notification as read
      await authService.markNotificationAsRead(notification.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );

      // Navigate if there's a job ID
      if (notification.type === "job" && notification.jobId) {
        closeDrawer();
        setTimeout(() => {
          // @ts-ignore - workaround for TypeScript path issues
          router.push(`/(tabs)/job/${notification.jobId}`);
        }, 300);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  }, [closeDrawer, router]);

  const markAllAsRead = useCallback(async () => {
    try {
      await authService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, []);

  // Calculate unread count
  const unreadCount = useMemo(() => 
    notifications.filter((n) => !n.read).length, 
  [notifications]);

  const keyExtractor = useCallback((item: Notification) => 
    item.id.toString(), 
  []);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={closeDrawer}
    >
      <View className="flex-1">
        {/* Fixed backdrop */}
        <Pressable 
          className="absolute inset-0 bg-black/40"
          style={{
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          onPress={closeDrawer} 
        />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: screenHeight * 0.8,
              paddingBottom: Math.max(insets.bottom, 16),
              marginLeft: insets.left,
              marginRight: insets.right,
            },
            drawerStyle,
          ]}
          className="bg-card rounded-t-xl shadow-lg"
        >
          {/* Handle for drag to close */}
          <View
            {...panResponder.panHandlers}
            className="w-full items-center py-3"
          >
            <View className="w-9 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View
            className="px-4 flex-row justify-between items-center border-b border-border"
            style={{
              paddingTop: Math.max(12, statusBarHeight > 24 ? 8 : 12),
              paddingBottom: 12,
            }}
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-primary mr-3 items-center justify-center">
                <Ionicons name="notifications" size={18} color="#FFFFFF" />
              </View>
              <Text className="text-lg font-bold text-card-foreground">
                Notifications
              </Text>
            </View>

            <View className="flex-row items-center">
              {unreadCount > 0 && (
                <TouchableOpacity
                  className="mr-4 py-2 px-3"
                  onPress={markAllAsRead}
                  activeOpacity={0.7}
                >
                  <Text className="text-primary text-sm">
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                onPress={closeDrawer}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={isDark ? "#FBFBFB" : "#242424"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unread count indicator */}
          {unreadCount > 0 && (
            <View className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30">
              <Text className="text-xs text-primary">
                {unreadCount} unread{" "}
                {unreadCount === 1 ? "notification" : "notifications"}
              </Text>
            </View>
          )}

          {/* Notification List */}
          {loading ? (
            <LoadingIndicator />
          ) : notifications.length > 0 ? (
            <FlatList
              data={notifications}
              renderItem={({ item }) => (
                <NotificationItem item={item} onPress={handleNotificationPress} />
              )}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom + 20, 34),
              }}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          ) : (
            <EmptyNotifications />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NotificationDrawer;
