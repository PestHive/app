import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import axios from '../../../lib/axios';

interface PaymentMethod {
  id: number;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export default function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const response = await axios.get('/payment-methods');
        setPaymentMethods(response.data);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = async () => {
    try {
      // Here you would typically integrate with a payment processor like Stripe
      // For now, we'll just show an alert
      Alert.alert(
        "Add Payment Method",
        "This feature will be available soon. We're working on integrating secure payment processing.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add payment method. Please try again.");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await axios.put(`/payment-methods/${id}/default`);
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        is_default: pm.id === id
      })));
    } catch (error) {
      Alert.alert("Error", "Failed to set default payment method. Please try again.");
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/payment-methods/${id}`);
              setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete payment method. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View className="mt-4 mb-2 px-4">
        <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2">Payment Methods</Text>
      </View>

      {paymentMethods.length > 0 ? (
        paymentMethods.map((method) => (
          <View key={method.id} className="mx-4 rounded-xl bg-card shadow-sm mb-4 px-4 py-4">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={22} color="#242424" />
                <Text className="font-semibold text-foreground ml-2">
                  {method.brand} ending in {method.last4}
                </Text>
                {method.is_default && (
                  <View className="bg-primary/10 ml-2 px-2 py-0.5 rounded">
                    <Text className="text-xs text-primary">Default</Text>
                  </View>
                )}
              </View>
              <View className="flex-row">
                {!method.is_default && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(method.id)}
                    className="px-3 py-1 rounded-full mr-1 bg-secondary"
                  >
                    <Text className="text-xs text-secondary-foreground">Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDeletePaymentMethod(method.id)}
                  className="px-3 py-1 rounded-full bg-destructive"
                >
                  <Text className="text-xs text-destructive-foreground">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-muted-foreground">
              Expires {method.exp_month}/{method.exp_year}
            </Text>
          </View>
        ))
      ) : (
        <View className="mx-4 rounded-xl bg-card shadow-sm mb-4 px-4 py-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="card-outline" size={22} color="#242424" />
            <Text className="font-semibold text-foreground ml-2">No payment methods</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleAddPaymentMethod}
        className="mx-4 flex-row items-center justify-center bg-primary py-2 rounded-lg mb-8"
      >
        <Ionicons name="add-outline" size={18} color="white" />
        <Text className="text-white font-medium ml-1">Add Payment Method</Text>
      </TouchableOpacity>
    </>
  );
} 