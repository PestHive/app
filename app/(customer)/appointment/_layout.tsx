import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function AppointmentLayout() {

    return (
        <Stack>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen
                name="modal"
                options={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
        </Stack>
    );
} 