import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '~/components/nativewindui/bottom-sheet';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';
import axios from '~/lib/axios';

interface Address {
  id: number;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postcode: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  type: 'billing' | 'service';
}

export default function AddressSection() {
  const { isDark } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    name: '',
    address_line1: '',
    city: '',
    state: '',
    postcode: '',
    phone: '',
    email: '',
    is_primary: false,
    type: 'billing'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await axios.get('/customer/addresses');
        setAddresses(response.data.data.addresses);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    }
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: '',
      address_line1: '',
      city: '',
      state: '',
      postcode: '',
      phone: '',
      email: '',
      is_primary: false,
      type: 'billing'
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({ ...address });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/customer/addresses/${id}`);
              let updatedAddresses = addresses.filter(addr => addr.id !== id);
              setAddresses(updatedAddresses);
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "Failed to delete address. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleSaveAddress = async () => {
    if (isSaving) return;

    if (!addressForm.address_line1 || !addressForm.city ||
      !addressForm.state || !addressForm.postcode) {
      Alert.alert("Error", "Please fill in all required fields (Street, City, State, Zip Code)");
      return;
    }
    setIsSaving(true);
    try {
      let updatedAddresses;
      if (editingAddress) {
        const response = await axios.post(`/customer/addresses/${editingAddress.id}`, { ...addressForm });
        const savedAddress = response.data.data;
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress.id ? savedAddress : addr
        );

        if (savedAddress.is_primary) {
          updatedAddresses = updatedAddresses.map(addr => {
            if (addr.type === savedAddress.type && addr.id !== savedAddress.id) {
              return { ...addr, is_primary: false };
            }
            return addr;
          });
        }
      } else {
        const response = await axios.post('/customer/addresses', addressForm);
        const newAddress = response.data.data;
        updatedAddresses = [...addresses];
        if (newAddress.is_primary) {
          updatedAddresses = updatedAddresses.map(addr => {
            if (addr.type === newAddress.type && addr.id !== newAddress.id) {
              return { ...addr, is_primary: false };
            }
            return addr;
          });
        }

        updatedAddresses.push(newAddress);
      }

      setAddresses(updatedAddresses);
      setShowAddressModal(false);
    } catch (error: any) {
      console.log(error)
      Alert.alert("Error", error.response?.data?.message || "Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPrimaryAddress = async (id: number) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await axios.post(`/addresses/${id}/set-primary`);
      const address = addresses.find(addr => addr.id === id);
      const updatedAddresses = addresses.map(addr => {
        if (addr.id === id) {
          return { ...addr, is_primary: true };
        } else if (address && addr.type === address.type) {
          return { ...addr, is_primary: false };
        }
        return addr;
      });
      setAddresses(updatedAddresses);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to set primary address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderAddressForm = () => (
    <BottomSheet
      visible={showAddressModal}
      onDismiss={() => {
        if (!isSaving) {
          setShowAddressModal(false);
        }
      }}
      title={editingAddress ? 'Edit Address' : 'Add New Address'}
      snapPoints={['85%', '90%']}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-sm mb-1 text-muted-foreground">Address Type</Text>
          <View className="flex-row mt-2">
            <TouchableOpacity
              className={`flex-1 mr-2 p-3 rounded ${addressForm.type === 'billing' ? 'bg-primary' : 'bg-secondary'
                }`}
              onPress={() => setAddressForm({ ...addressForm, type: 'billing' })}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text className={`text-center ${addressForm.type === 'billing' ? 'text-primary-foreground' : 'text-secondary-foreground'
                }`}>
                Billing Address
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ml-2 p-3 rounded ${addressForm.type === 'service' ? 'bg-primary' : 'bg-secondary'
                }`}
              onPress={() => setAddressForm({ ...addressForm, type: 'service' })}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text className={`text-center ${addressForm.type === 'service' ? 'text-primary-foreground' : 'text-secondary-foreground'
                }`}>
                Service Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-1 text-muted-foreground">Street Address</Text>
          <BottomSheetTextInput
            className="p-3 rounded bg-input text-foreground"
            value={addressForm.address_line1}
            onChangeText={(text) => setAddressForm({ ...addressForm, address_line1: text })}
            placeholder="123 Main St"
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            editable={!isSaving}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-1 text-muted-foreground">City</Text>
          <BottomSheetTextInput
            className="p-3 rounded bg-input text-foreground"
            value={addressForm.city}
            onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
            placeholder="Anytown"
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            editable={!isSaving}
          />
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-sm mb-1 text-muted-foreground">State</Text>
            <BottomSheetTextInput
              className="p-3 rounded bg-input text-foreground"
              value={addressForm.state}
              onChangeText={(text) => setAddressForm({ ...addressForm, state: text })}
              placeholder="CA"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              editable={!isSaving}
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-sm mb-1 text-muted-foreground">
              Postcode
            </Text>
            <BottomSheetTextInput
              className="p-3 rounded bg-input text-foreground"
              value={addressForm.postcode}
              onChangeText={(text) => setAddressForm({ ...addressForm, postcode: text })}
              placeholder="12345"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              keyboardType="default"
              editable={!isSaving}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-1 text-muted-foreground">Phone Number (Optional)</Text>
          <BottomSheetTextInput
            className="p-3 rounded bg-input text-foreground"
            value={addressForm.phone}
            onChangeText={(text) => setAddressForm({ ...addressForm, phone: text })}
            placeholder="(555) 123-4567"
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            keyboardType="phone-pad"
            editable={!isSaving}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm mb-1 text-muted-foreground">Email (Optional)</Text>
          <BottomSheetTextInput
            className="p-3 rounded bg-input text-foreground"
            value={addressForm.email}
            onChangeText={(text) => setAddressForm({ ...addressForm, email: text })}
            placeholder="youremail@example.com"
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSaving}
          />
        </View>

        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            className="w-6 h-6 border-2 rounded mr-2 items-center justify-center"
            style={{ borderColor: isDark ? "#FBFBFB" : "#242424", backgroundColor: addressForm.is_primary ? (isDark ? "#FBFBFB" : "#242424") : 'transparent' }}
            onPress={() => setAddressForm({ ...addressForm, is_primary: !addressForm.is_primary })}
            disabled={isSaving}
          >
            {addressForm.is_primary && (
              <Ionicons name="checkmark" size={16} color={isDark ? "#242424" : "#FBFBFB"} />
            )}
          </TouchableOpacity>
          <Text className="text-foreground">Set as primary address</Text>
        </View>

        <TouchableOpacity
          className={`bg-primary p-4 rounded mb-6 disabled:opacity-50`}
          onPress={handleSaveAddress}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={isDark ? "#FBFBFB" : "#242424"} />
          ) : (
            <Text className="text-primary-foreground text-center font-semibold">Save Address</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );

  return (
    <Card>
      <CardHeader className="mt-4 px-4">
        <CardTitle>My Addresses</CardTitle>
      </CardHeader>

      {addresses.length > 0 ? (
        addresses.map((address) => (
          <CardContent key={address.id} className="mx-4 gap-2 mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                {address.is_primary && (
                  <View className="bg-primary mr-2 px-2 py-0.5 rounded-full">
                    <Text className="text-xs text-primary-foreground">Primary</Text>
                  </View>
                )}
                <View className="bg-secondary px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-secondary-foreground">
                    {address.type === 'billing' ? 'Billing' : 'Service'}
                  </Text>
                </View>
              </View>
              <View className="flex-row">
                {!address.is_primary && (
                  <TouchableOpacity
                    onPress={() => handleSetPrimaryAddress(address.id)}
                    className="px-3 py-1 rounded-full mr-1 "
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={isDark ? "#FBFBFB" : "#242424"} />
                    ) : (
                      <Text className="text-xs text-secondary-foreground">Set Primary</Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleEditAddress(address)}
                  className="px-3 py-1 rounded-full mr-1 "
                  disabled={isSaving}
                >
                  <Text className="text-xs text-secondary-foreground">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(address.id)}
                  className="px-3 py-1 rounded-full bg-destructive"
                  disabled={isSaving}
                >
                  <Text className="text-xs text-destructive-foreground">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-foreground">{address.address_line1}</Text>
            <Text className="text-foreground">{address.city}, {address.state} {address.postcode}</Text>
            {address.phone && <Text className="text-muted-foreground text-sm mt-1">{address.phone}</Text>}
            {address.email && <Text className="text-muted-foreground text-sm mt-1">{address.email}</Text>}
          </CardContent>
        ))
      ) : (
        <View className="mx-4 rounded-xl bg-card shadow-sm mb-4 px-4 py-8 items-center">
          <Ionicons name="location-outline" size={40} color={isDark ? "#4B5563" : "#9CA3AF"} />
          <Text className="text-muted-foreground text-center mt-2">No addresses added yet</Text>
        </View>
      )}

      <Button
        onPress={handleAddAddress}
        className="flex-row items-center mx-4 mb-8"
      >
        <Ionicons name="add-outline" size={18} color="white" />
        <Text className="text-white font-medium ">Add New Address</Text>
      </Button>
      {renderAddressForm()}
    </Card>
  );
} 