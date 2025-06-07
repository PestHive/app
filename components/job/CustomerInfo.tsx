import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Badge from "../../components/Badge";
import { Job } from "../../services/authService";

interface CustomerInfoProps {
  job: Job;
  statusInfo: {
    label: string;
    icon: any;
  };
  getBadgeVariant: (status: string) => any;
  isToday: (dateString: string) => boolean;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  job,
  statusInfo,
  getBadgeVariant,
  isToday,
  formatDate,
  formatTime,
}) => {
  return (
    <View className="bg-card rounded-xl p-4 mb-4">
      <View className="flex-row items-start mb-4">
        <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center mr-3">
          <Ionicons
            name="person"
            size={20}
            color="#757575"
          />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-base text-foreground">
            {job.customer}
          </Text>
          <View className="flex-1 flex-col gap-2">
            <View className="flex-row items-center mt-1">
              <Ionicons
                name="location-outline"
                size={14}
                color="#757575"
              />
              <Text className="text-muted-foreground text-xs ml-1 flex-1">
                {job.address}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#757575"
              />
              <Text className="text-muted-foreground text-xs ml-1">
                {isToday(job.scheduled)
                  ? "Today, "
                  : formatDate(job.scheduled).split(",")[0] + ", "}
                {formatTime(job.scheduled)}
              </Text>
            </View>
          </View>
        </View>
        <Badge
          label={statusInfo.label}
          icon={statusInfo.icon}
          variant={getBadgeVariant(job.status)}
        />
      </View>
    </View>
  );
};

export default CustomerInfo; 