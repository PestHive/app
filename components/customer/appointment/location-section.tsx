import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';
import { Appointment } from '../../../app/(customer)/appointment/[id]';

interface LocationSectionProps {
  appointment: Appointment | null;
  onViewMapPress?: () => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  appointment,
  onViewMapPress,
}) => {
  const { isDark } = useTheme();
  if (!appointment || !appointment.address) return null;

  return (
    <Card className="my-2 px-4">
      <CardHeader>
        <CardTitle>
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-start">
          <Ionicons name="location-outline" size={20} className="text-muted-foreground mr-3 mt-1" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-muted-foreground">Service Address</Text>
            <Text className="text-base text-foreground mt-0.5">{appointment.address.address_line1}</Text>
            {appointment.address.address_line2 && (
              <Text className="text-base text-foreground">{appointment.address.address_line2}</Text>
            )}
            <Text className="text-base text-foreground">
              {appointment.address.city}, {appointment.address.state} {appointment.address.postcode}
            </Text>
            {appointment.address.country && (
              <Text className="text-base text-foreground">{appointment.address.country.name}</Text>
            )}
          </View>
        </View>

        {appointment.address.phone && (
          <View className="flex-row items-center mt-3">
            <Ionicons name="call-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} className="mr-3" />
            <Text className="text-foreground">{appointment.address.phone}</Text>
          </View>
        )}

        {appointment.address.email && (
          <View className="flex-row items-center mt-3">
            <Ionicons name="mail-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} className="mr-3" />
            <Text className="text-foreground">{appointment.address.email}</Text>
          </View>
        )}

      </CardContent>
    </Card>
  );
};

export default LocationSection; 