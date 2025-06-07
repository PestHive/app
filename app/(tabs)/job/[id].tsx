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

  // Handle navigation
  const handleNavigate = () => {
    if (!job) return;

    // Open Google Maps with the address
    const address = encodeURIComponent(job.address);
    const url = `https://maps.google.com/?q=${address}`;

    Linking.openURL(url).catch((error) => {
      Alert.alert("Error", "Could not open maps");
      console.error("Error opening maps:", error);
    });
  };

  // Format date for notes
  const formatNoteDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get status information with colors and icons
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
          color: "amber-500",
          bgColor: "amber-50",
          icon: "time",
          label: "Pending",
          hexColor: "#f59e0b",
        };
      case "in_progress":
        return {
          color: "blue-500",
          bgColor: "blue-50",
          icon: "play-outline",
          label: "In Progress",
          hexColor: "#3b82f6",
        };
      case "completed":
        return {
          color: "green-500",
          bgColor: "green-50",
          icon: "checkmark-circle",
          label: "Completed",
          hexColor: "#22c55e",
        };
      default:
        return {
          color: "neutral-500",
          bgColor: "neutral-50",
          icon: "help-outline",
          label: "Unknown",
          hexColor: "#6b7280",
        };
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Determine if job is today
  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const jobDate = new Date(dateString);
    return today.toDateString() === jobDate.toDateString();
  };

  // Format time only
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Map job status to badge variant
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
        return { variant: "info", text: "Created" };
      case "scheduled":
        return { variant: "warning", text: "Scheduled" };
      case "started":
        return { variant: "info", text: "Started" };
      case "completed":
        return { variant: "success", text: "Completed" };
      case "comment":
        return { variant: "default", text: "Comment" };
      case "status_updated":
        return { variant: "info", text: "Status Updated" };
      default:
        return { variant: "default", text: "Event" };
    }
  };

  if (loading || !job) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <Text className="text-muted-foreground mt-4">
          Loading job details...
        </Text>
      </View>
    );
  }

  const jobDate = new Date(job.scheduled);
  const isPastDue = jobDate < new Date() && job.status !== "completed";
  const statusInfo = getStatusInfo(job.status);

  return (
    <ThemedView>
      <View className="flex-1 bg-background">
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View className="pt-12 pb-2 px-4 bg-card shadow-sm z-10">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 rounded-full bg-secondary items-center justify-center mr-3"
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={isDark ? "#FBFBFB" : "#242424"}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                {job.title}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Job #{job.id}
              </Text>
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-secondary items-center justify-center mr-2"
              onPress={handleRefresh}
            >
              <Ionicons
                name={refreshing ? "sync-circle" : "refresh-outline"}
                size={18}
                color={isDark ? "#FBFBFB" : "#242424"}
              />
            </TouchableOpacity>
            <TouchableOpacity className="w-9 h-9 rounded-full bg-secondary items-center justify-center">
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={isDark ? "#FBFBFB" : "#242424"}
              />
            </TouchableOpacity>
          </View>

          {/* Customer Info Section */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-1">
                Customer
              </Text>
              <Text className="text-base font-medium text-foreground">
                {job.customer}
              </Text>
            </View>
            <Badge
              variant={getBadgeVariant(job.status)}
              label={getStatusInfo(job.status).label}
            />
          </View>

          {/* Date and Time */}
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? "#B4B4B4" : "#757575"}
            />
            <Text className="text-muted-foreground text-xs ml-1">
              {new Date(job.scheduled).toLocaleDateString()}
            </Text>
            <Text className="text-muted-foreground text-xs ml-2">
              {new Date(job.scheduled).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {refreshing && (
            <View className="h-10 items-center justify-center bg-primary/10 py-2">
              <View className="flex-row items-center">
                <View className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
                <Text className="text-xs text-primary">
                  Refreshing job details...
                </Text>
              </View>
            </View>
          )}

          {/* Customer Information - Header outside card */}
          <View className="px-4 pt-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Customer Information
            </Text>
            <CustomerInfo 
              job={job} 
              statusInfo={statusInfo} 
              getBadgeVariant={getBadgeVariant}
              isToday={isToday}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </View>

          {/* Status Update */}
          <View className="px-4 mb-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Update Status
            </Text>
            <StatusUpdate job={job} updateJobStatus={updateJobStatus} />
          </View>

          {/* Quick Actions - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Quick Actions
            </Text>
            <QuickActions onCall={handleCall} onNavigate={handleNavigate} />
          </View>

          {/* Location Section - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Location
            </Text>
            <LocationInfo job={job} onNavigate={handleNavigate} />
          </View>

          {/* Service Details - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Service Details
            </Text>
            <ServiceDetails />
          </View>

          {/* Notes Section - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Notes
            </Text>
            <Notes notes={notes} formatNoteDate={formatNoteDate} />
          </View>

          {/* Assigned Technicians Section - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Assigned Technicians
            </Text>
            <AssignedTechnicians job={job} />
            
            {job.status === "in_progress" && (
              <View className="bg-primary/10 p-3 rounded-lg mb-4">
                <Text className="text-primary text-sm text-center">
                  Your technician is on the way to your location.
                </Text>
              </View>
            )}
          </View>

          {/* Job Timeline - Header outside card */}
          <View className="px-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Activity Timeline
            </Text>
            <ActivityTimeline 
              jobHistory={jobHistory} 
              getActionBadgeDetails={getActionBadgeDetails} 
            />
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}
