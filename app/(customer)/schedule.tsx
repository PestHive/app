import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import Axios from 'axios';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { z } from 'zod';
import BottomSheet from '~/components/nativewindui/bottom-sheet';
import { ThemedView } from '~/components/ThemedView';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { useTheme } from '~/context/ThemeContext';
import axios from '../../lib/axios';


interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  formatted_price: string;
}

interface Address {
  id: number;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}


interface AppointmentCreateData {
  services: Service[];
  addresses: Address[];
}

interface ApiResponse {
  data: AppointmentCreateData;
  message: string;
}

const addressSchema = z.object({
  id: z.number(),
  address_line1: z.string().min(1, "Address line 1 is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(1, "Postcode is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
});

const appointmentSchema = z.object({
  service_id: z.number({ invalid_type_error: "Service selection is required." }).nullable(),
  address_id: z.number({ invalid_type_error: "Address selection is required." }).nullable(),
  scheduled_date: z.string({ invalid_type_error: "Date selection is required." }).date("Invalid date format.").nullable(),
  scheduled_time: z.date({ invalid_type_error: "Time selection is required." }).nullable(),
  note: z.string().min(2, "Note must be at least 2 characters.").max(1000, "Note must be at most 1000 characters.").optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.service_id === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Service selection is required.",
      path: ['service_id'],
    });
  }
  if (data.scheduled_date === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Date selection is required.",
      path: ['scheduled_date'],
    });
  }
  if (data.scheduled_time === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Time selection is required.",
      path: ['scheduled_time'],
    });
  }
  if (data.address_id === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Address selection is required.",
      path: ['address_id'],
    });
  }
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function ScheduleAppointmentScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const notesInputRef = useRef<TextInput>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit: RHFhandleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    mode: 'onChange',
    defaultValues: {
      service_id: null,
      address_id: null,
      scheduled_date: null,
      scheduled_time: null,
      note: '',
    }
  });

  console.log('Current form errors:', JSON.stringify(errors));

  const fetchCreateData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/customer/appointments/create');
      const fetchedServices = response.data.data.services;
      const fetchedAddresses = response.data.data.addresses;
      setServices(fetchedServices);
      setAddresses(fetchedAddresses);

    } catch (err) {
      let errorMessage = "An unexpected error occurred.";
      if (Axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.message || "Error fetching creation data.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCreateData();
  }, []);

  const watchedServiceId = watch('service_id');
  const watchedScheduledDate = watch('scheduled_date');
  const watchedScheduledTime = watch('scheduled_time');
  const watchedAddressId = watch('address_id');
  const watchedNote = watch('note');

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    );
  }, [services, serviceSearchQuery]);

  const dateOptions = Array.from({ length: 21 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      id: i + 1,
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  });


  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || watchedScheduledTime;
    setShowTimePicker(Platform.OS === 'ios');

    if (currentTime) {
      setValue('scheduled_time', currentTime, { shouldValidate: true });
    }
  };

  const formatTimeDisplay = () => {
    if (watchedScheduledTime) {
      const hours = watchedScheduledTime.getHours();
      const minutes = watchedScheduledTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const minuteStr = minutes < 10 ? `0${minutes}` : minutes;

      return `${hour12}:${minuteStr} ${ampm}`;
    }

    return "Select a time";
  };

  const getSelectedServiceDetails = () => {
    return services.find(service => service.id === watchedServiceId);
  };

  const getSelectedAddressDetails = () => {
    if (!watchedAddressId) return null;
    return addresses.find(address => address.id === watchedAddressId);
  };

  const currentSelectedAddress = useMemo(() => {
    return getSelectedAddressDetails();
  }, [watchedAddressId, addresses]);

  const onSubmit = async (formData: AppointmentFormData) => {
    console.log('Form Data before processing:', formData);
    setIsSubmitting(true);

    if (!formData.scheduled_date || !formData.scheduled_time) {
      setError("Date or time is missing."); 
      setIsSubmitting(false);
      return;
    }

    const hours = formData.scheduled_time.getHours().toString().padStart(2, '0');
    const minutes = formData.scheduled_time.getMinutes().toString().padStart(2, '0');
    const formattedScheduledTime = `${hours}:${minutes}`;

    const payload = {
      service_id: formData.service_id,
      address_id: formData.address_id,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formattedScheduledTime,
      note: formData.note,
    };

    console.log('Payload to send:', payload);

    try {
      const response = await axios.post('/customer/appointments', payload);
      router.push({
        pathname: '/(customer)/appointment/[id]',
        params: {
          id: response.data.data.appointment.id
        }
      });
    } catch (errSubmission) {
      let errorMessage = "An unexpected error occurred during submission.";
      if (Axios.isAxiosError(errSubmission) && errSubmission.response && errSubmission.response.data) {
        if (typeof errSubmission.response.data === 'string') {
            errorMessage = errSubmission.response.data;
        } else if (errSubmission.response.data.message) {
            errorMessage = errSubmission.response.data.message;
        }
        console.error('Submission error response:', errSubmission.response.data);
      } else if (errSubmission instanceof Error) {
        errorMessage = errSubmission.message;
      }
      setError(errorMessage);
      console.error('Full submission error:', errSubmission);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className='text-primary' />
        <Text className="text-foreground mt-2">Loading appointment details...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <View className="flex-1 bg-background">
        <StatusBar style="auto" />

        <View className="pt-12 pb-2 px-4 bg-card shadow-sm z-10">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">Schedule Appointment</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">Select Service</Text>

            <TouchableOpacity
              onPress={() => setShowServiceModal(true)}
              className="flex-row justify-between items-center p-3 bg-input dark:bg-input/30 rounded-lg border border-border"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                {watchedServiceId ? (
                  <>
                    <View className="ml-0">
                      <Text className="text-foreground">{getSelectedServiceDetails()?.name}</Text>
                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                        {getSelectedServiceDetails()?.description}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="ml-0 text-muted-foreground">Select a service</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={18} className='text-muted-foreground' />
            </TouchableOpacity>
            {errors.service_id?.message && <Text className="text-destructive text-sm mt-1">{errors.service_id.message}</Text>}

            {watchedServiceId && (
              <Card className="mt-2">
                <CardContent className="p-2 rounded-lg gap-2">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                        <Ionicons name="pricetag-outline" size={16} className='text-muted-foreground' />
                      </View>
                      <View>
                        <Text className="text-sm text-muted-foreground">Price</Text>
                        <Text className="text-foreground font-medium">{getSelectedServiceDetails()?.formatted_price}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                      <Ionicons name="time-outline" size={16} className='text-muted-foreground' />
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">Average Duration</Text>
                      <Text className="text-foreground font-medium">2 hours</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              {dateOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  className={`mr-2 px-5 p-3 rounded-[6px] ${watchedScheduledDate === option.date
                    ? 'bg-primary border border-primary'
                    : 'bg-card border border-border'}`}
                  onPress={() => setValue('scheduled_date', option.date, { shouldValidate: true })}
                  activeOpacity={0.8}
                >
                  <Text className={`text-center font-medium ${watchedScheduledDate === option.date ? 'text-white' : 'text-foreground'}`}>
                    {option.day}
                  </Text>
                  <Text className={`text-center text-lg font-bold mt-1 ${watchedScheduledDate === option.date ? 'text-white' : 'text-foreground'}`}>
                    {option.dayOfMonth}
                  </Text>
                  <Text className={`text-center ${watchedScheduledDate === option.date ? 'text-white text-opacity-80' : 'text-muted-foreground'}`}>
                    {option.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {watchedScheduledDate && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="calendar-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className="text-muted-foreground text-sm ml-2">
                  {dateOptions.find(d => d.date === watchedScheduledDate)?.fullDate || new Date(watchedScheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </View>
            )}
            {errors.scheduled_date?.message && <Text className="text-destructive text-sm mt-1">{errors.scheduled_date.message}</Text>}
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">Select Time</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-row justify-between items-center p-3 bg-input dark:bg-input/30 rounded-lg border border-border"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`ml-2 ${!watchedScheduledTime ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {formatTimeDisplay()}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={watchedScheduledTime || new Date()}
                mode="time"
                display="default"
                minuteInterval={15}
                onChange={onTimeChange}
              />
            )}
            {errors.scheduled_time?.message && <Text className="text-destructive text-sm mt-1">{errors.scheduled_time.message}</Text>}
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">Select Address</Text>

            <TouchableOpacity
              onPress={() => setShowAddressModal(true)}
              className="flex-row justify-between items-center p-3 bg-input dark:bg-input/30 rounded-lg border border-border"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                {currentSelectedAddress ? (
                  <>
                    <View className="ml-0">
                      <Text className="text-foreground">{currentSelectedAddress.address_line1}</Text>
                      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                        {currentSelectedAddress.city}, {currentSelectedAddress.state}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="ml-0 text-muted-foreground">Select an address</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-down" size={18} className='text-muted-foreground' />
            </TouchableOpacity>
            {errors.address_id?.message && <Text className="text-destructive text-sm mt-1">{errors.address_id.message}</Text>}

            {currentSelectedAddress && (
              <Card className="mt-2">
                <CardContent className="p-2 rounded-lg gap-2">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                      <Ionicons name="location-outline" size={16} className='text-muted-foreground' />
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">Address</Text>
                      <Text className="text-foreground">{currentSelectedAddress.address_line1}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                      <Ionicons name="navigate-outline" size={16} className='text-muted-foreground' />
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">City, State, Zip</Text>
                      <Text className="text-foreground">{currentSelectedAddress.city}, {currentSelectedAddress.state} {currentSelectedAddress.postcode}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                      <Ionicons name="mail-outline" size={16} className='text-muted-foreground' />
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">Email</Text>
                      <Text className="text-foreground">{currentSelectedAddress.email || 'N/A'}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-2">
                      <Ionicons name="call-outline" size={16} className='text-muted-foreground' />
                    </View>
                    <View>
                      <Text className="text-sm text-muted-foreground">Phone</Text>
                      <Text className="text-foreground">{currentSelectedAddress.phone}</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">Additional Notes (Optional)</Text>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <Card className="rounded-lg">
                  <CardContent className="p-2 rounded-lg gap-2">
                    <TextInput
                      ref={notesInputRef}
                      className="text-foreground min-h-[70px] placeholder:text-muted-foreground"
                      placeholder="Add any special instructions or details"
                      value={value || ''}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      multiline
                      textAlignVertical="top"
                    />
                  </CardContent>
                </Card>
              )}
            />
            {errors.note?.message && <Text className="text-destructive text-sm mt-1">{errors.note.message}</Text>}
          </View>

          <Button
            className={`rounded-lg mb-20 ${isValid ? 'bg-primary' : 'bg-primary/50'}`}
            onPress={RHFhandleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-center font-bold text-primary-foreground">
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Text>
          </Button>
        </ScrollView>
      </View>

      <BottomSheet
        visible={showServiceModal}
        onDismiss={() => setShowServiceModal(false)}
        snapPoints={['60%', '85%']}
        title="Select Service"
      >
        <View className="flex-1 bg-background">
          <View>
            <View className="bg-input dark:bg-input/30 rounded-lg mb-2 flex-row items-center px-3">
              <Ionicons name="search-outline" size={20} className='text-muted-foreground' />
              <TextInput
                className="flex-1 p-3 text-foreground"
                placeholder="Search services..."
                placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
                value={serviceSearchQuery}
                onChangeText={setServiceSearchQuery}
              />
              {serviceSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setServiceSearchQuery('')}
                  className="p-2"
                >
                  <Ionicons name="close-circle" size={20} color={isDark ? "#71717A" : "#A1A1AA"} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredServices}
              keyExtractor={(item) => item.id.toString()}
              className="max-h-[calc(100%-100px)]"
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={({ item }) => (
                <CardContent
                  className={`p-3 rounded-lg gap-2 mb-3 ${watchedServiceId === item.id ? 'border-primary border-2 ' : ''}`}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setValue('service_id', item.id, { shouldValidate: true });
                      setShowServiceModal(false);
                    }}
                  >
                    <View className="flex-row items-start">
                      <View className="flex-1 ml-0">
                        <View className="flex-row justify-between items-start">
                          <Text className="font-medium text-base text-foreground flex-1 pr-2">
                            {item.name}
                          </Text>
                          <View className="bg-primary/10 px-2.5 py-1.5 rounded-full">
                            <Text className="text-primary font-medium text-xs">
                              {item.formatted_price || 'N/A'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm mt-1 text-muted-foreground" numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </CardContent>
              )}
              ListFooterComponent={<View style={{ height: 50 }} />}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Ionicons name="search-outline" size={48} color={isDark ? "#71717A" : "#A1A1AA"} />
                  <Text className="text-muted-foreground mt-2">No services found</Text>
                  <TouchableOpacity
                    onPress={() => setServiceSearchQuery('')}
                    className="mt-4 px-4 py-2 rounded-lg bg-secondary"
                  >
                    <Text className="text-foreground font-medium">Clear Search</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showAddressModal}
        onDismiss={() => setShowAddressModal(false)}
        snapPoints={['60%', '85%']}
        title="Select Address"
      >
        <View className="flex-1 bg-background">
          <View>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={({ item }) => (
                <CardContent
                  className={`p-2 rounded-lg gap-2 mb-2 ${watchedAddressId === item.id ? 'border-primary border-2' : ''}`}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setValue('address_id', item.id, { shouldValidate: true });
                      setShowAddressModal(false);
                    }}
                  >
                    <View className="flex-row items-start">
                      <View className="flex-1 ml-0">
                        <View className="flex-row items-center">
                          <Text className="font-semibold text-foreground flex-1 pr-2">{item.address_line1}</Text>
                          {item.is_primary && (
                            <View className="bg-primary/10 px-2 py-0.5 rounded">
                              <Text className="text-xs text-primary">Primary</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-foreground mt-1">{item.city}, {item.state} {item.postcode}</Text>
                        {item.email && <Text className="text-muted-foreground text-sm mt-1">{item.email}</Text>}
                        <Text className="text-muted-foreground text-sm mt-1">{item.phone}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </CardContent>
              )}
              ListFooterComponent={
                <View className="py-2">
                  <Button
                    onPress={() => {
                      setShowAddressModal(false);
                      router.push('/(customer)/profile');
                    }}
                  >
                    <Text className="text-white font-medium text-center">Add New Address</Text>
                  </Button>
                </View>
              }
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Ionicons name="location-outline" size={48} color={isDark ? "#71717A" : "#A1A1AA"} />
                  <Text className="text-muted-foreground text-center">No saved addresses</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddressModal(false);
                      router.push('/(customer)/profile');
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary"
                  >
                    <Text className="text-white font-medium">Add Address</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </BottomSheet>
    </ThemedView>
  );
} 