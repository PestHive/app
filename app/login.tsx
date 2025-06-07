import { Ionicons } from '@expo/vector-icons';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { authService } from '../services/authService';
import { useAuth } from '~/context/AuthContext';


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();



export default function LoginScreen() {

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ email?: string; password?: string; general?: string }>({});


  const handleLogin = async () => {
    // Reset error messages
    setErrorMsg({});

    // Validate input
    let hasError = false;
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) {
      setErrorMsg(newErrors);
      return;
    }


    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.token) {
        // Navigate to the appropriate route
        router.replace(result.user.type === 'technician' ? '/(technician)' as any : '/(customer)' as any);
      }
    } catch (error: any) {
      console.log(error);
      setErrorMsg({
        general: error.message || 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0 && email.includes('@') && email.includes('.') && password.length >= 6;

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = await SecureStore.getItemAsync('auth_token');
  //     const userTypeStored = await SecureStore.getItemAsync('user_type');

  //     if (token) {
  //       if (userTypeStored === 'technician') {
  //         router.replace('/(technician)' as any);
  //       } else {
  //         router.replace('/(customer)' as any);
  //       }
  //     }
  //   }
  //   checkAuth();
  // }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      SplashScreen.hideAsync();
      router.replace(user?.type === 'technician' ? '/(technician)' as any : '/(customer)' as any);
    } else {
      SplashScreen.hideAsync();
    }

  }, [isAuthenticated, user, router]);

  if (isAuthLoading) {
    return <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Text>Loading...</Text>
    </View>
  } else if (isAuthenticated) {
    return null;
  }


  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <ScrollView className="flex-1">
        <View className="flex-1 px-6 pt-4 pb-8">
          {/* Logo and Welcome Text */}
          <View className="items-center mt-12 mb-10">
            <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-5">
              <Ionicons name="build-outline" size={38} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-800">Welcome to PestHive</Text>
            <Text className="text-gray-500 mt-2 text-center text-base">Log in to access your account</Text>
          </View>


          {/* General Error Message */}
          {errorMsg.general && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500 text-center">{errorMsg.general}</Text>
            </View>
          )}

          <View className="w-full mb-2">
            {/* Email Field */}
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 ml-1 font-medium">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-800 bg-gray-50"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMsg.email) {
                      setErrorMsg(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errorMsg.email && (
                <Text className="text-red-500 text-sm ml-1 mt-1">{errorMsg.email}</Text>
              )}
            </View>

            {/* Password Field */}
            <View className="mb-8">
              <Text className="text-gray-700 mb-2 ml-1 font-medium">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 py-4 px-3 text-gray-800 bg-gray-50"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMsg.password) {
                      setErrorMsg(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {errorMsg.password && (
                <Text className="text-red-500 text-sm ml-1 mt-1">{errorMsg.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6 items-end">
              <Text className="text-blue-600">Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl mb-5 items-center justify-center ${isFormValid && !loading ? 'bg-blue-600' : 'bg-blue-300'}`}
              onPress={handleLogin}
              disabled={!isFormValid || loading}
            >
              <Text className="text-white font-bold">{loading ? 'Logging in...' : 'Log In'}</Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-500">Don&apos;t have an account? </Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 