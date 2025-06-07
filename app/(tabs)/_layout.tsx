import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
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
          <TouchableOpacity {...props} activeOpacity={1} />
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
          title: "Jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      /> */}

      {/* <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
       */}
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
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide the job, chat, and map routes from tab bar */}
      <Tabs.Screen
        name="job/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
