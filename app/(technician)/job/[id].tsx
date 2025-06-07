import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ThemedView } from "~/components/ThemedView";
import {
    ActivityTimeline,
    AssignedTechnicians,
    CustomerInfo,
    LocationInfo,
    Notes,
    QuickActions,
    ServiceDetails,
    StatusUpdate
} from "~/components/job";
import { useTheme } from "~/context/ThemeContext";
import Badge, { BadgeVariant } from "../../../components/Badge";
import { authService, Job } from "../../../services/authService";

// Import the IconName type from Badge
type IconName =
  | "time-outline"
  | "play-outline"
  | "checkmark-done-outline"
  | "help-outline"
  | "bug-outline"
  | "flask-outline"
  | "paw-outline"
  | "build-outline"
  | "location-outline"
  | "calendar-outline"
  | "navigate-outline"
  | "call-outline"
  | "time"
  | "checkmark-circle"
  | "alert-circle"
  | "person-outline";

// Define the Note type
interface Note {
  id: number;
  added_by: {
    name: string;
  };
  added_at: string;
  content: string;
}

// Define the History type
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

export default function JobDetailsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sample notes data
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      added_by: {
        name: "John Technician",
      },
      added_at: "2023-10-15T10:30:00",
      content:
        "Customer has mentioned that the pest issue is primarily in the kitchen and bathroom areas. Will need to focus treatment there.",
    },
    {
      id: 2,
      added_by: {
        name: "Sarah Manager",
      },
      added_at: "2023-10-16T14:45:00",
      content:
        "Customer called to ask if we can arrive 30 minutes earlier than scheduled. Please try to accommodate if possible.",
    },
  ]);

  // Sample timeline history data
  const [jobHistory, setJobHistory] = useState<History[]>([
    {
      id: 1,
      action: "created",
      occurred_at: "2023-10-10T09:15:00",
      occurred_by: {
        name: "System",
      },
    },
    {
      id: 2,
      action: "scheduled",
      occurred_at: "2023-10-11T14:30:00",
      occurred_by: {
        name: "Sarah Manager",
      },
      comment: "Job scheduled for October 17th between 9-11 AM",
    },
    {
      id: 3,
      action: "comment",
      occurred_at: "2023-10-12T10:45:00",
      occurred_by: {
        name: "John Technician",
      },
      comment: "Customer confirmed appointment via text message",
    },
    {
      id: 4,
      action: "started",
      occurred_at: "2023-10-17T09:05:00",
      occurred_by: {
        name: "John Technician",
      },
    },
    {
      id: 5,
      action: "completed",
      occurred_at: "2023-10-17T10:45:00",
      occurred_by: {
        name: "John Technician",
      },
      comment:
        "Treatment completed successfully. Follow-up may be needed in 30 days.",
    },
  ]);

  const loadJobDetails = async (): Promise<void> => {
    try {
      const jobs = await authService.getJobs();
      const selectedJob = jobs.find((j) => j.id.toString() === id);
      if (selectedJob) {
        setJob(selectedJob);
      } else {
        Alert.alert("Error", "Job not found");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load job details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [id, router]);

  const updateJobStatus = async (status: string): Promise<void> => {
    if (!id) return;

    try {
      await authService.updateJobStatus(id, status);
      setJob((prev) =>
        prev ? { ...prev, status: status as Job["status"] } : null
      );
      Alert.alert("Success", `Job status updated to ${status}`);
    } catch (error) {
      Alert.alert("Error", "Failed to update job status");
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadJobDetails();
  };

  // Handle phone call
  const handleCall = () => {
    if (!job) return;

    // In a real app, you would get the phone number from the job data
    const phoneNumber = "555-123-4567"; // Example phone number

    // Use tel: URL scheme which works on both platforms
    const phoneUrl = `tel:${phoneNumber}`;

    Linking.openURL(phoneUrl).catch((error) => {
      Alert.alert("Error", "Could not make phone call");
      console.error("Error making phone call:", error);
    });
  };

  // Handle navigation to address
  const handleNavigate = () => {
    if (!job) return;

    // In a real app, you'd use the actual coordinates or address from the job data
    const address = job.address;
    // For iOS and Android
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    if (url) {
      Linking.openURL(url).catch((error) => {
        Alert.alert("Error", "Could not open maps");
        console.error("Error opening maps:", error);
      });
    }
  };

  // Format notes date
  const formatNoteDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const noteDate = new Date(date);
    noteDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - noteDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getStatusInfo = (
    status: string
  ): {
    color: string;
    bgColor: string;
    icon: IconName;
    label: string;
    hexColor: string;
  } => {
    switch (status) {
      case "pending":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-100",
          icon: "time-outline",
          label: "Pending",
          hexColor: "#EAB308", // Yellow
        };
      case "in_progress":
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-100",
          icon: "play-outline",
          label: "In Progress",
          hexColor: "#3B82F6", // Blue
        };
      case "completed":
        return {
          color: "text-green-500",
          bgColor: "bg-green-100",
          icon: "checkmark-done-outline",
          label: "Completed",
          hexColor: "#22C55E", // Green
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          icon: "help-outline",
          label: "Unknown",
          hexColor: "#6B7280", // Gray
        };
    }
  };

  // Format date in a readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Check if date is today
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  // Get badge details for timeline actions
  const getActionBadgeDetails = (
    history: History
  ): { variant: BadgeVariant; text: string } => {
    switch (history.action) {
      case "created":
        return { variant: "default", text: "Created" };
      case "scheduled":
        return { variant: "warning", text: "Scheduled" };
      case "started":
        return { variant: "info", text: "Started" };
      case "completed":
        return { variant: "success", text: "Completed" };
      case "comment":
        return { variant: "secondary", text: "Comment" };
      case "status_updated":
        return { variant: "outline", text: "Status Update" };
      default:
        return { variant: "default", text: history.action };
    }
  };

  if (loading) {
    return (
      <ThemedView>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Loading job details...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!job) {
    return (
      <ThemedView>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Job not found</Text>
        </View>
      </ThemedView>
    );
  }

  const statusInfo = getStatusInfo(job.status);

  return (
    <ThemedView>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="pt-12 px-4 pb-4 bg-card">
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FBFBFB" : "#242424"}
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Job Details</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Job Title and Status */}
        <View className="px-4 py-4 bg-card mb-2">
          <Text className="text-xl font-bold text-foreground mb-2">
            {job.title}
          </Text>
          <View className="flex-row items-center">
            <Badge
              text={statusInfo.label}
              variant={getBadgeVariant(job.status)}
              icon={statusInfo.icon}
            />
            <Text className="text-muted-foreground ml-2">
              ID: #{job.id.toString().padStart(4, "0")}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActions
          handleCall={handleCall}
          handleNavigate={handleNavigate}
          isDark={isDark}
        />

        {/* Status Update */}
        <StatusUpdate
          currentStatus={job.status}
          updateStatus={updateJobStatus}
          isDark={isDark}
        />

        {/* Date and Time */}
        <View className="px-4 py-4 bg-card mb-2">
          <Text className="text-base font-semibold text-foreground mb-2">
            Scheduled Time
          </Text>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-3">
              <Ionicons
                name="calendar-outline"
                size={18}
                color={isDark ? "#FBFBFB" : "#242424"}
              />
            </View>
            <View>
              <Text className="text-foreground">
                {isToday(job.scheduled)
                  ? "Today"
                  : formatDate(job.scheduled)}
              </Text>
              <Text className="text-muted-foreground">
                {formatTime(job.scheduled)}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Info */}
        <LocationInfo address={job.address} isDark={isDark} />

        {/* Customer Info */}
        <CustomerInfo customer={job.customer} isDark={isDark} />

        {/* Service Details */}
        <ServiceDetails
          serviceType="Pest Control"
          pestTypes={["Ants", "Cockroaches"]}
          treatments={["Spray Treatment", "Bait Application"]}
          isDark={isDark}
        />

        {/* Assigned Technicians */}
        <AssignedTechnicians
          technicians={[{ id: 1, name: "John Technician" }]}
          isDark={isDark}
        />

        {/* Notes */}
        <Notes
          notes={notes}
          formatNoteDate={formatNoteDate}
          isDark={isDark}
        />

        {/* Activity Timeline */}
        <ActivityTimeline
          history={jobHistory}
          getActionBadgeDetails={getActionBadgeDetails}
          formatNoteDate={formatNoteDate}
          isDark={isDark}
        />

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </ThemedView>
  );
} 