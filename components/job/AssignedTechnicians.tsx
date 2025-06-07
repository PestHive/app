import React from "react";
import { Text, View } from "react-native";
import { Job } from "../../services/authService";

interface AssignedTechniciansProps {
  job: Job;
}

const AssignedTechnicians: React.FC<AssignedTechniciansProps> = ({ job }) => {
  return (
    <View className="bg-card rounded-xl overflow-hidden mb-4">
      {/* Technician 1 */}
      <View className="p-4 flex-row items-center border-b border-border">
        <View className="h-10 w-10 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Text className="text-primary font-medium">JD</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-medium text-foreground mr-2">
              John Doe
            </Text>
            <View className="bg-secondary px-2 py-0.5 rounded">
              <Text className="text-secondary-foreground text-xs">
                Lead Technician
              </Text>
            </View>
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            Assigned: Oct 15, 2023
          </Text>
        </View>
      </View>

      {/* Technician 2 */}
      <View className="p-4 flex-row items-center">
        <View className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
          <Text className="text-green-600 font-medium">MS</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-medium text-foreground mr-2">
              Mike Smith
            </Text>
            <View className="bg-secondary px-2 py-0.5 rounded">
              <Text className="text-secondary-foreground text-xs">Assistant</Text>
            </View>
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            Assigned: Oct 16, 2023
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AssignedTechnicians; 