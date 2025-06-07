import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';

export interface ScreenHeaderProps {
  title: string;
  onBackPress: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBackPress }) => {
  const { isDark } = useTheme();

  return (
    <View className="pt-12 px-4 pb-2 bg-card">
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={onBackPress}
          className="p-2 -ml-2"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#FBFBFB" : "#242424"}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">{title}</Text>
        <View style={{ width: 28 }} />
      </View>
    </View>
  );
};

export default ScreenHeader; 