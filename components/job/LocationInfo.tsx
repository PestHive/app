import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Job } from "../../services/authService";

interface LocationInfoProps {
  job: Job;
  onNavigate: () => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ job, onNavigate }) => {
  return (
    <View className="bg-card rounded-xl p-4 mb-4">
      <Text className="font-medium text-foreground mb-1">
        Service Address
      </Text>
      <Text className="text-muted-foreground dark:text-sm">{job.address}</Text>
      <Text className="text-muted-foreground dark:text-sm">Austin, TX 78759</Text>
      <Text className="text-muted-foreground dark:text-sm mb-2">United States</Text>

      <TouchableOpacity
        className="flex-row items-center border border-border rounded-lg px-3 py-2 self-start bg-secondary"
        onPress={onNavigate}
      >
        <Ionicons
          name="open-outline"
          size={14}
          color="#3B82F6"
          style={{ marginRight: 6 }}
        />
        <Text className="text-foreground text-sm">View on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationInfo; 