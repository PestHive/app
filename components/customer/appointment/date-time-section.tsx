import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Appointment } from '../../../app/(customer)/appointment/[id]';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface DateTimeSectionProps {
  appointment: Appointment | null;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  appointment,
}) => {

  if (!appointment) return null;

  return (
    <Card className="my-2 px-4">
      <CardHeader>
        <CardTitle>
          Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-3xl bg-secondary items-center justify-center mr-3">
            <Ionicons
              name="calendar-outline"
              size={16}
              className='text-white'
            />
          </View>
          <View>
            <Text className="text-sm text-muted-foreground">Date</Text>
            <Text className="text-foreground">{appointment.scheduled_date}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-3xl bg-secondary items-center justify-center mr-3">
            <Ionicons
              name="time-outline"
              size={16}
              className='text-white'
            />
          </View>
          <View>
            <Text className="text-sm text-muted-foreground">Time</Text>
            <Text className="text-foreground">{appointment.scheduled_time}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export default DateTimeSection; 