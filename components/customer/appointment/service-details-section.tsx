import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Badge from '~/components/Badge'; // Assuming BadgeVariant is also exported or handled by Badge
import { Appointment } from '../../../app/(customer)/appointment/[id]';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface ServiceDetailsSectionProps {
  appointment: Appointment;
  statusVariant: any; // Adjust to BadgeVariant type if possible
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
  appointment,
  statusVariant,
}) => {
  if (!appointment || !appointment.service) return null;

  return (
    <Card className="mt-4 mb-2 px-4">
      <CardHeader>
        <CardTitle>
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-between items-start">
          <Text className="text-xl font-bold text-foreground flex-1 mr-2">
            {appointment.service.name}
          </Text>
          <Badge
            label={appointment.status.name}
            variant={statusVariant}
            size="sm"
          />
        </View>
        <Text className="text-sm text-muted-foreground " numberOfLines={3}>
          {appointment.service.description}
        </Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={18}
            className='text-muted-foreground'
          />
          <Text className="text-sm text-foreground">
            Estimated duration: {appointment.service.estimated_duration_minutes} minutes
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

export default ServiceDetailsSection; 