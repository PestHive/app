import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';

export default function TechnicianSettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  
  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(!value);
  };
  
  const renderSettingItem = (
    icon: string, 
    title: string, 
    description: string, 
    value: boolean, 
    setter: React.Dispatch<React.SetStateAction<boolean>> | (() => void)
  ) => (
    <View className="py-4 ">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`h-10 w-10 rounded-full bg-secondary items-center justify-center mr-4`}>
            <Ionicons name={icon as any} size={20} color={isDark ? "#FBFBFB" : "#242424"} />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-foreground`}>{title}</Text>
            <Text className={`text-sm text-muted-foreground`}>{description}</Text>
          </View>
        </View>
        <Switch
          trackColor={{ false: isDark ? '#333333' : '#E5E5E5', true: isDark ? '#454545' : '#242424' }}
          thumbColor={value ? isDark ? '#FBFBFB' : '#FBFBFB' : isDark ? '#B4B4B4' : '#FFFFFF'}
          ios_backgroundColor={isDark ? "#333333" : "#E5E5E5"}
          onValueChange={() => {
            if (title === 'Dark Mode') {
              toggleTheme();
            } else {
              toggleSwitch(setter as React.Dispatch<React.SetStateAction<boolean>>, value);
            }
          }}
          value={value}
        />
      </View>
    </View>
  );
  
  const renderMenuSection = (title: string) => (
    <View className="mt-6 mb-2">
      <Text className={`text-sm font-semibold uppercase text-muted-foreground px-4`}>{title}</Text>
    </View>
  );
  
  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View className={`pt-12 pb-2 px-4 bg-card shadow-sm z-10`}>
        <View className="flex-row items-center mb-4">
          <Ionicons name="settings-outline" size={28} color={isDark ? "#FBFBFB" : "#242424"} />
          <Text className={`text-xl font-bold ml-2 text-foreground`}>
            Settings
          </Text>
        </View>
      </View>
      
      <ScrollView className="flex-1">
        {/* Preferences */}
        {renderMenuSection('PREFERENCES')}
        <View className={`mx-4 rounded-xl bg-card shadow-sm px-4`}>
          {renderSettingItem(
            'moon-outline', 
            'Dark Mode', 
            'Switch between light and dark themes', 
            isDark, 
            toggleTheme
          )}
          {renderSettingItem(
            'notifications-outline', 
            'Notifications', 
            'Receive alerts about job updates', 
            notifications, 
            setNotifications
          )}
          {renderSettingItem(
            'location-outline', 
            'Location Services', 
            'Allow app to access your location', 
            locationServices, 
            setLocationServices
          )}
          {renderSettingItem(
            'sync-outline', 
            'Auto Sync', 
            'Sync job data automatically', 
            dataSync, 
            setDataSync
          )}
        </View>
        
        {/* App Info */}
        <View className="mt-6 mb-12 items-center">
          <Text className={`text-sm text-muted-foreground`}>
            PestHive Technician App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
} 