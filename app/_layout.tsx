import IonIcons from '@expo/vector-icons/Ionicons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop, useColorScheme } from 'nativewind';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // This one is also needed, but can be later
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '~/context/AuthContext';
import { ThemeProvider } from '~/context/ThemeContext';
import '../global.css';

cssInterop(IonIcons, {
  className: {
    target: 'style',
    nativeStyleToProp: { height: true, width: true, size: true },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { colorScheme } = useColorScheme();

  if (!loaded) {
    // Async font loading only occurs in development.
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <AuthProvider>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                  <Stack>
                    <Stack.Screen
                      name="login"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="(technician)"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="(customer)"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                </KeyboardAvoidingView>
                <StatusBar style="auto" />
              </AuthProvider>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </NavigationThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}