import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import { authService } from '../../services/authService';

export default function TechnicianProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  // Profile editing state
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('John Technician');
  const [role, setRole] = useState('Pest Control Specialist');
  const [email, setEmail] = useState('john.tech@pesthive.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleLogout = async (): Promise<void> => {
    // Clear tokens and user data
    await authService.logout();
    // Navigate to login screen
    router.replace('/login' as any);
  };
  
  const handleSavePassword = () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    
    // Here you would call your API to change the password
    Alert.alert("Success", "Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditing(null);
  };
  
  const renderProfileItem = (label: string, value: string, field: string) => (
    <View className="py-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        {editing === field ? (
          <TouchableOpacity 
            onPress={() => setEditing(null)}
            className="px-3 py-1 rounded-full bg-secondary"
          >
            <Text className="text-xs text-secondary-foreground">Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => setEditing(field)}
            className="px-3 py-1 rounded-full bg-secondary"
          >
            <Text className="text-xs text-secondary-foreground">Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {editing === field ? (
        field === 'password' ? (
          <View className="mt-2">
            <View className="mb-3">
              <Text className="text-xs mb-1 text-muted-foreground">Current Password</Text>
              <TextInput
                className="p-2 rounded bg-input text-foreground"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                placeholder="Enter current password"
              />
            </View>
            <View className="mb-3">
              <Text className="text-xs mb-1 text-muted-foreground">New Password</Text>
              <TextInput
                className="p-2 rounded bg-input text-foreground"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                placeholder="Enter new password"
              />
            </View>
            <View className="mb-3">
              <Text className="text-xs mb-1 text-muted-foreground">Confirm Password</Text>
              <TextInput
                className="p-2 rounded bg-input text-foreground"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                placeholder="Confirm new password"
              />
            </View>
            <TouchableOpacity 
              onPress={handleSavePassword}
              className="bg-primary p-2 rounded mt-2"
            >
              <Text className="text-primary-foreground text-center font-semibold">Update Password</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-2">
            <TextInput
              className="p-2 rounded bg-input text-foreground"
              value={
                field === 'name' ? name : 
                field === 'email' ? email : phone
              }
              onChangeText={text => {
                if (field === 'name') setName(text);
                else if (field === 'email') setEmail(text);
                else if (field === 'phone') setPhone(text);
              }}
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
            />
            <TouchableOpacity 
              onPress={() => setEditing(null)}
              className="bg-primary p-2 rounded mt-2"
            >
              <Text className="text-primary-foreground text-center font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <Text className="text-base mt-1 text-foreground">
          {field === 'password' ? '••••••••' : 
           field === 'name' ? name : 
           field === 'email' ? email : phone}
        </Text>
      )}
    </View>
  );
  
  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View className="pt-12 pb-2 px-4 bg-card shadow-sm z-10">
        <View className="flex-row items-center mb-4">
          <Ionicons name="person-outline" size={28} color={isDark ? "#FBFBFB" : "#242424"} />
          <Text className="text-xl font-bold ml-2 text-foreground">Profile</Text>
        </View>
      </View>
      
      <ScrollView className="flex-1">
        {/* Profile Info - Simplified */}
        <View className="mt-4 mb-2 px-4">
          <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2">My Profile</Text>
        </View>
        
        {/* Personal Information Section */}
        <View className="mx-4 rounded-xl bg-card shadow-sm mb-4 px-4">
          {renderProfileItem('Full Name', name, 'name')}
          {renderProfileItem('Role', role, 'role')}
          {renderProfileItem('Email Address', email, 'email')}
          {renderProfileItem('Phone Number', phone, 'phone')}
          {renderProfileItem('Password', '••••••••', 'password')}
        </View>
        
        {/* Logout Button */}
        <View className="mx-4 rounded-xl overflow-hidden shadow-sm mb-8">
          <TouchableOpacity 
            className="flex-row items-center py-4 px-4 bg-card" 
            onPress={handleLogout}
          >
            <View className="w-8 h-8 rounded-full bg-destructive/10 items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={18} color={isDark ? "#FFA09E" : "#E54D2E"} />
            </View>
            <Text className="flex-1 text-destructive font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* App Version */}
        <View className="mt-2 mb-12 items-center">
          <Text className="text-sm text-muted-foreground">
            PestHive Technician App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
} 