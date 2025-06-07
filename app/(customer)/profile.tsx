import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import AddressSection from '../../components/customer/profile/AddressSection';
import LogoutSection from '../../components/customer/profile/LogoutSection';
import PersonalInfoSection from '../../components/customer/profile/PersonalInfoSection';

// Define the Address interface
interface Address {
  id: number;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  is_primary: boolean;
}

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  role: string;
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  // Profile editing state
  const [editing, setEditing] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const onChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value } as User);
  }

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: 'Home',
      address_line1: '123 Main St, Apt 4B',
      city: 'Anytown',
      state: 'CA',
      postcode: '12345',
      phone: '(555) 123-4567',
      is_primary: true
    }
  ]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    name: '',
    address_line1: '',
    city: '',
    state: '',
    postcode: '',
    phone: '',
    is_primary: false
  });

  // Animation ref
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    async function getUser() {
      const user = JSON.parse(await SecureStore.getItemAsync('user') || '{}');
      setUser(user);
    }
    getUser();
  }, []);

  // Modal animation
  useEffect(() => {
    if (showAddressModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showAddressModal]);


  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''} bg-background`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="pt-12 pb-2 px-4 bg-card shadow-sm z-10">
        <View className="flex-row items-center mb-4">
          <Text className="text-lg font-bold ml-2 text-foreground">My Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <PersonalInfoSection

        />

        <AddressSection

        />

        {/* <PaymentMethodsSection /> */}

        <LogoutSection />

        {/* App Version */}
        <View className="mt-2 mb-12 items-center">
          <Text className="text-sm text-muted-foreground">
            PestHive Customer App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
} 