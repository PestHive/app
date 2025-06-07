import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';
import axios from '../../../lib/axios';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  role: string;
}

export default function PersonalInfoSection() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function getUser() {
      const user = JSON.parse(await SecureStore.getItemAsync('user') || '{}');
      setUser(user);
    }
    getUser();
  }, []);

  const onChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value } as User);
  }

  const updateProfile = async (field: string, value: string) => {
    try {
      setIsSaving(true);
      await axios.post('/update-profile', {
        [field]: value
      });
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      setEditing(null);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async () => {
    try {
      const response = await axios.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (response.data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setEditing(null);
        Alert.alert("Success", "Password changed successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
    }
  };

  const renderProfileItem = (label: string, value: string, field: string) => {
    return (
      <View >
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
                  className="p-2 rounded bg-input dark:bg-input/30 text-foreground placeholder:text-muted-foreground"
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
                  className="p-2 rounded bg-input dark:bg-input/30 text-foreground placeholder:text-muted-foreground"
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
                  className="p-2 rounded bg-input dark:bg-input/30 text-foreground placeholder:text-muted-foreground"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  placeholder="Confirm new password"
                />
              </View>
              <TouchableOpacity
                onPress={updatePassword}
                className="bg-primary p-2 rounded mt-2"
              >
                <Text className="text-primary-foreground text-center font-semibold">Update Password</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-2">
              <TextInput
                className="p-2 rounded bg-input dark:bg-input/30 text-foreground placeholder:text-muted-foreground"
                value={
                  field === 'name' ? user?.name :
                    field === 'email' ? user?.email : user?.phone
                }
                onChangeText={text => onChange(field, text)}
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
              />
              <TouchableOpacity
                onPress={() => updateProfile(field, user?.[field as keyof typeof user] as string)}
                className="bg-primary p-2 rounded mt-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={isDark ? "#FBFBFB" : "#242424"} />
                ) : (
                  <Text className="text-primary-foreground text-center font-semibold">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          <Text className="text-base mt-1 text-foreground">
            {field === 'password' ? '••••••••' :
              field === 'name' ? user?.name :
                field === 'email' ? user?.email : user?.phone}
          </Text>
        )}
      </View>
    )
  };

  return (
    <Card>
      <CardHeader className="mt-4 px-4">
        <CardTitle >Personal Information</CardTitle>
      </CardHeader>

      <CardContent className="mx-4 mb-4">
        {renderProfileItem('Full Name', user?.name || '', 'name')}
        {renderProfileItem('Email Address', user?.email || '', 'email')}
        {renderProfileItem('Phone Number', user?.phone || '', 'phone')}
        {renderProfileItem('Password', '••••••••', 'password')}
      </CardContent>
    </Card>
  );
} 