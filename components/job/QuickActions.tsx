import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionsProps {
  onCall: () => void;
  onNavigate: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onCall, onNavigate }) => {
  return (
    <View className="flex-row justify-between mb-4">
      <TouchableOpacity
        className="bg-secondary rounded-xl p-3 items-center flex-1 mr-2"
        onPress={onCall}
      >
        <Ionicons name="call-outline" size={24} color="#3B82F6" />
        <Text className="mt-1 text-secondary-foreground font-medium">
          Call
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-secondary rounded-xl p-3 items-center flex-1 ml-2"
        onPress={onNavigate}
      >
        <Ionicons name="navigate-outline" size={24} color="#3B82F6" />
        <Text className="mt-1 text-secondary-foreground font-medium">
          Navigate
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions; 