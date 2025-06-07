import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Job } from "../../services/authService";

interface StatusUpdateProps {
  job: Job;
  updateJobStatus: (status: string) => Promise<void>;
}

const StatusUpdate: React.FC<StatusUpdateProps> = ({ 
  job, 
  updateJobStatus 
}) => {
  return (
    <View className="bg-card rounded-xl p-4">
      {/* Status steps */}
      <View className="flex-row items-center mb-5">
        <View className="items-center flex-1">
          <View
            className={`h-8 w-8 rounded-full items-center justify-center ${
              job.status === "pending" ? "bg-amber-500" : "bg-secondary"
            }`}
          >
            <Ionicons
              name="time"
              size={16}
              color={job.status === "pending" ? "#FFFFFF" : "#757575"}
            />
          </View>
          <Text
            className={`text-xs mt-1 ${
              job.status === "pending" ? "text-amber-600 font-medium" : "text-muted-foreground"
            }`}
          >
            Pending
          </Text>
        </View>

        <View
          className={`h-0.5 flex-1 ${
            job.status === "in_progress" || job.status === "completed" ? "bg-primary" : "bg-secondary"
          }`}
        />

        <View className="items-center flex-1">
          <View
            className={`h-8 w-8 rounded-full items-center justify-center ${
              job.status === "in_progress" ? "bg-primary" : "bg-secondary"
            }`}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </View>
          <Text
            className={`text-xs mt-1 ${
              job.status === "in_progress" ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            In Progress
          </Text>
        </View>

        <View
          className={`h-0.5 flex-1 ${
            job.status === "completed" ? "bg-green-500" : "bg-secondary"
          }`}
        />

        <View className="items-center flex-1">
          <View
            className={`h-8 w-8 rounded-full items-center justify-center ${
              job.status === "completed" ? "bg-green-500" : "bg-secondary"
            }`}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
          <Text
            className={`text-xs mt-1 ${
              job.status === "completed" ? "text-green-600 font-medium" : "text-muted-foreground"
            }`}
          >
            Completed
          </Text>
        </View>
      </View>

      {/* Action button for transitioning to next state */}
      {job.status !== "completed" && (
        <TouchableOpacity
          className={`py-3 rounded-lg ${
            job.status === "pending" ? "bg-primary" : "bg-green-500"
          }`}
          onPress={() =>
            updateJobStatus(job.status === "pending" ? "in_progress" : "completed")
          }
        >
          <Text className="text-white font-medium text-center">
            {job.status === "pending" ? "Start Job" : "Complete Job"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Completed confirmation message */}
      {job.status === "completed" && (
        <View className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <Text className="text-green-700 dark:text-green-400 text-center font-medium">
            This job has been completed
          </Text>
        </View>
      )}
    </View>
  );
};

export default StatusUpdate; 