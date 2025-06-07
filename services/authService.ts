import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    type: "technician" | "customer";
  };
  token: string;
}

export interface Job {
  id: number;
  title: string;
  customer: string;
  address: string;
  scheduled: string;
  status: "pending" | "in_progress" | "completed";
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "job" | "system" | "alert";
  jobId?: number;
}

const API_URL = "http://10.0.2.2:8000/api/mobile"; // Change to your API URL

export const authService = {
  // Login using the actual API
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        password: password,
      });

      // Store token in local storage or secure storage
      if (response.data.token) {
        // Save token and user type for future requests
        await SecureStore.setItemAsync("auth_token", response.data.token);
        // Set the token in the axios instance for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error: any) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  // Mock data for testing other endpoints
  getJobs: async (): Promise<Job[]> => {
    // For testing - this would be an actual API call in production
    return [
      {
        id: 1,
        title: "Pest Control - Residential",
        customer: "John Smith",
        address: "123 Main St, Anytown, USA",
        scheduled: "2023-10-15T09:00:00",
        status: "pending",
      },
      {
        id: 2,
        title: "Termite Inspection - Commercial",
        customer: "ABC Business",
        address: "456 Commerce Ave, Anytown, USA",
        scheduled: "2023-10-15T13:00:00",
        status: "in_progress",
      },
      {
        id: 3,
        title: "Rodent Control - Residential",
        customer: "Jane Doe",
        address: "789 Oak Dr, Anytown, USA",
        scheduled: "2023-10-16T10:00:00",
        status: "completed",
      },
    ];
  },

  // Mock updating job status
  updateJobStatus: async (
    jobId: number | string,
    status: string
  ): Promise<{ success: boolean }> => {
    // This would be an actual API call in production
    console.log(`Updated job ${jobId} to status: ${status}`);
    return { success: true };
  },

  // Get notifications for the current user
  getNotifications: async (): Promise<Notification[]> => {
    // For testing - this would be an actual API call in production
    return [
      {
        id: 1,
        title: "New Job Assigned",
        message: "You have been assigned to a new pest control job",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        type: "job",
        jobId: 4,
      },
      {
        id: 2,
        title: "Schedule Change",
        message: "Your appointment with ABC Business has been rescheduled",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        type: "job",
        jobId: 2,
      },
      {
        id: 3,
        title: "System Update",
        message: "PestHive app has been updated to version 2.1.0",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        type: "system",
      },
      {
        id: 4,
        title: "Job Completed",
        message: "Job #3 has been marked as completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        read: true,
        type: "job",
        jobId: 3,
      },
      {
        id: 5,
        title: "Alert: Weather Warning",
        message:
          "Severe weather alert for your area tomorrow. Plan accordingly.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        read: false,
        type: "alert",
      },
    ];
  },

  // Mark notification as read
  markNotificationAsRead: async (
    notificationId: number
  ): Promise<{ success: boolean }> => {
    // This would be an actual API call in production
    console.log(`Marked notification ${notificationId} as read`);
    return { success: true };
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<{ success: boolean }> => {
    // This would be an actual API call in production
    console.log("Marked all notifications as read");
    return { success: true };
  },

  // Logout - clear stored tokens
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync("auth_token");
  },
};
