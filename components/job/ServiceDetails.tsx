import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ServiceDetailsProps {
  onViewFullDetails?: () => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ onViewFullDetails }) => {
  return (
    <View className="bg-card rounded-xl p-4 mb-4">
      <View className="flex-row items-center mb-2">
        <View className="h-8 w-8 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Ionicons name="bug-outline" size={16} color="#3B82F6" />
        </View>
        <View>
          <Text className="font-medium text-foreground">
            Pest Control
          </Text>
          <Text className="text-xs text-muted-foreground">
            General Treatment
          </Text>
        </View>
      </View>
      <Text className="text-foreground mb-2">
        This is a mock service detail section. In a real app, this would
        contain specific information about the job such as pest types,
        areas to be treated, special instructions, etc.
      </Text>
      <TouchableOpacity 
        className="flex-row items-center"
        onPress={onViewFullDetails}
      >
        <Text className="text-primary font-medium">
          View full details
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
};

export default ServiceDetails; 