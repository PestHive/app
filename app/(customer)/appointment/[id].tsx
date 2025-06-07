import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BadgeVariant } from '~/components/Badge';
import { ThemedView } from '~/components/ThemedView';
import { useTheme } from '~/context/ThemeContext';
import axios from '~/lib/axios';
import ActionButtonsSection from '../../../components/customer/appointment/action-buttons-section';
import ActivityLogSection, { ActivityLogEntry } from '../../../components/customer/appointment/activity-log-section';
import AssignedTechniciansSection from '../../../components/customer/appointment/assigned-technicians-section';
import DateTimeSection from '../../../components/customer/appointment/date-time-section';
import LocationSection from '../../../components/customer/appointment/location-section';
import NotesSection from '../../../components/customer/appointment/notes-section';
import PriceDetailsSection from '../../../components/customer/appointment/price-details-section';
import ScreenHeader from '../../../components/customer/appointment/screen-header';
import ServiceDetailsSection from '../../../components/customer/appointment/service-details-section';

// Define appointment types
export interface Appointment {
  id: number;
  service: {
    name: string;
    description: string;
    price: string;
    estimated_duration_minutes: number;
  };
  status: {
    code: string;
    name: string;
  };
  address: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postcode: string;
    country: {
      name: string;
    };
    phone: string;
    email: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  notes?: {
    id: number;
    content: string;
    added_by: {
      name: string;
    };
    added_at: string;
  }[];
  technicians: {
    id: number;
    staff: {
      name: string;
      role: string;
      phone: string;
    };
    assigned_at: string;
  }[];
  history?: ActivityLogEntry[];
}

// Define a more specific type for a single note, matching NotesSection.tsx
export type Note = NonNullable<Appointment['notes']>[number];

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/customer/appointments/${id}`);
      setAppointment(response.data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAppointment();
    } catch (error) {
      console.error('Error refreshing appointment:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadgeInfo = (status: string): { icon: string; variant: BadgeVariant } => {
    let icon: string, variant: BadgeVariant;

    switch (status) {
      case 'confirmed':
        icon = 'checkmark-circle';
        variant = 'completed';
        break;
      case 'pending':
        icon = 'time';
        variant = 'pending';
        break;
      case 'completed':
        icon = 'checkmark-done-outline';
        variant = 'completed';
        break;
      case 'cancelled':
        icon = 'alert-circle';
        variant = 'canceled';
        break;
      default:
        icon = 'help-outline';
        variant = 'default';
    }

    return { icon, variant };
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            console.log('Simulating appointment cancellation...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert(
              "Appointment Cancelled",
              "Your appointment has been cancelled successfully.",
              [
                {
                  text: "OK",
                  onPress: async () => {
                    await fetchAppointment();
                    router.back();
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  if (loading && !isRefreshing) {
    return (
      <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title="Appointment Details" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? "#FBFBFB" : "#242424"} />
          <Text className="text-foreground mt-3">Loading appointment details...</Text>
        </View>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title="Appointment Details" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color={isDark ? "#FACC15" : "#F59E0B"} />
          <Text className="text-xl font-semibold text-foreground mt-4 text-center">Appointment Not Found</Text>
          <Text className="text-muted-foreground mt-2 text-center">
            We couldn&apos;t find the details for this appointment. It might have been moved or no longer exists.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-primary py-3 px-6 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { icon, variant } = getStatusBadgeInfo(appointment.status.code);

  return (
    <ThemedView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View className="flex-1 bg-background">
          <StatusBar style={isDark ? "light" : "dark"} />
          <ScreenHeader title="Appointment Details" onBackPress={() => router.back()} />
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={isDark ? ["#A5B4FC"] : ["#3B82F6"]}
                tintColor={isDark ? "#A5B4FC" : "#3B82F6"}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <ServiceDetailsSection
              appointment={appointment}
              statusVariant={variant}
            />
            <PriceDetailsSection appointment={appointment} />
            <ActionButtonsSection
              appointment={appointment}
              handleRefresh={handleRefresh}
            />
            <NotesSection appointment={appointment} onNoteAdded={handleRefresh} />
            <DateTimeSection appointment={appointment} />
            <LocationSection
              appointment={appointment}
              onViewMapPress={() => Alert.alert('View Map', 'Map functionality to be implemented.')}
            />
            <AssignedTechniciansSection appointment={appointment} />
            <ActivityLogSection appointment={appointment} />
            <View className="h-8" />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
} 