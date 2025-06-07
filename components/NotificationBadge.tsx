import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/authService';

interface NotificationBadgeProps {
  onPress: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Load unread notifications count
    loadUnreadCount();
    
    // Set up interval to check for new notifications every minute
    const interval = setInterval(loadUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadUnreadCount = async () => {
    try {
      const notifications = await authService.getNotifications();
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };
  
  return (
    <TouchableOpacity 
      className={`w-10 h-10 rounded-full items-center justify-center ${unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-neutral-100 dark:bg-neutral-800'}`}
      onPress={onPress}
    >
      <Ionicons 
        name="notifications-outline" 
        size={20} 
        color={unreadCount > 0 ? '#3b82f6' : '#64748b'} 
      />
      
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 items-center justify-center px-1 border border-white dark:border-neutral-900">
          <Text className="text-white text-xs font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBadge; 