import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="pt-12 pb-2 px-4 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <Ionicons name="map-outline" size={28} color="#3B82F6" />
          <Text className="text-xl font-bold ml-2">Job Map</Text>
        </View>
      </View>
      
      {/* Placeholder content */}
      <View className="flex-1 justify-center items-center p-6">
        <Ionicons name="map" size={80} color="#CBD5E1" />
        <Text className="text-xl font-bold mt-4">Map View</Text>
        <Text className="text-gray-500 text-center mt-2">
          This screen would display a map with all your assigned jobs and their locations.
        </Text>
      </View>
    </View>
  );
} 