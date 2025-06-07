import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomerTabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          paddingTop: 5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props as TouchableOpacityProps} activeOpacity={1} />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide the appointment/[id] route from tab bar */}

      <Tabs.Screen
        name="appointment"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="invoice/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
} 