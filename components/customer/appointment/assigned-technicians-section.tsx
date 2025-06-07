import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Appointment } from '../../../app/(customer)/appointment/[id]';

interface AssignedTechniciansSectionProps {
  appointment: Appointment | null;
}

const AssignedTechniciansSection: React.FC<AssignedTechniciansSectionProps> = ({
  appointment,
}) => {

  const getInitials = (name: string | undefined | null): string => {
    if (!name) return '';
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const handleCallTechnician = (technicianId: number) => {
    // In a real app, this would use the technician's contact info
    // For now, we'll just show an alert or simulate a call
    console.log(`Call technician ${technicianId}`);
    
    // Example: If you have phone numbers, you could do:
    // const phoneNumber = technician.phone;
    // Linking.openURL(`tel:${phoneNumber}`);
  };

  if (!appointment || !appointment.technicians || appointment.technicians.length === 0) {
    return null; // Don't render if no technicians
  }

  return (
    <Card className="my-2 px-4">
      <CardHeader>
        <CardTitle>
          Assigned Technicians
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointment.technicians.map((technician, index) => (
          <View
            key={technician.id}
            className={`flex-row items-center ${
              index < appointment.technicians.length - 1 ? "border-b border-border" : ""
            }`}>
            <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-primary font-medium">
                {getInitials(technician.staff.name)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-medium text-foreground mr-2">
                  {technician.staff.name || 'N/A'}
                </Text>
                {technician.staff.role && (
                  <View className="bg-secondary px-2 py-0.5 rounded">
                    <Text className="text-secondary-foreground text-xs">
                      {technician.staff.role}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-muted-foreground mt-1">
                Assigned: {technician.assigned_at}
              </Text>
            </View>
            
            {/* Call button */}
            <TouchableOpacity 
              onPress={() => handleCallTechnician(technician.id)}
              className="h-9 w-9 rounded-3xl bg-primary/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons 
                name="call" 
                size={18} 
                className='text-primary'
              />
            </TouchableOpacity>
          </View>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssignedTechniciansSection; 