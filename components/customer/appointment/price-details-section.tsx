import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import { Appointment } from '../../../app/(customer)/appointment/[id]';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

interface PriceDetailsSectionProps {
  appointment: Appointment | null;
}

const PriceDetailsSection: React.FC<PriceDetailsSectionProps> = ({
  appointment,
}) => {
  const { isDark } = useTheme();

  if (!appointment || !appointment.service) return null;

  return (
    <Card className="my-2 px-4">
      <CardHeader>
        <CardTitle>
          Price Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-between items-center">
          <Text className="text-muted-foreground">
            Service:
            <Text className="text-foreground font-medium">
              {' '}
              {appointment.service.name}
            </Text>
          </Text>
          <Text className="text-foreground">{appointment.service.price}</Text>
        </View>
        <View className="h-px bg-border" />
        <View className="flex-row justify-between items-center">
          <Text className="text-foreground font-bold">Total</Text>
          <Text className="text-foreground font-bold">{appointment.service.price}</Text>
        </View>
        {(appointment.status.code === 'pending' || appointment.status.code === 'confirmed') && (
          <Text className="text-sm text-muted-foreground">
            Payment will be collected after the service is completed.
          </Text>
        )}
        {appointment.status.code === 'completed' && (
          <View className="mt-2 bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <Text className="text-green-800 dark:text-green-100 text-center">
              Paid on {appointment.scheduled_date}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceDetailsSection; 