import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Sheet, useSheetRef } from '~/components/nativewindui/sheet';
import { ThemedView } from '~/components/ThemedView';
import { useTheme } from '~/context/ThemeContext';
import axios from '~/lib/axios';
import { Appointment } from '../../../app/(customer)/appointment/[id]';
import { Button } from '~/components/ui/button';

interface ActionButtonsSectionProps {
  appointment: Appointment | null;
  handleRefresh: () => void;
}

const ActionButtonsSection: React.FC<ActionButtonsSectionProps> = ({
  appointment,
  handleRefresh
}) => {
  const { colors, isDark } = useTheme();
  const bottomSheetModalRef = useSheetRef();
  const cancelSheetRef = useSheetRef();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [formErrors, setFormErrors] = useState<{ date?: string; time?: string; reason?: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cancelReason, setCancelReason] = useState('');
  const [cancelFormErrors, setCancelFormErrors] = useState<{ reason?: string }>({});
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const validateRescheduleForm = () => {
    const newErrors: { date?: string; time?: string; reason?: string } = {};
    if (!selectedDate) newErrors.date = 'Date is required.';
    if (!selectedTime) newErrors.time = 'Time is required.';
    if (!reason.trim()) newErrors.reason = 'Reason for rescheduling is required.';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRescheduleSubmit = async () => {
    if (!appointment) return;
    setIsSubmitting(true);

    const payload = {
      scheduled_date: selectedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', formatMatcher: 'best fit' }),
      scheduled_time: selectedTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      reason: reason
    }

    console.log(payload)
    if (validateRescheduleForm()) {
      try {
        await axios.post(`/customer/appointments/${appointment.id}/reschedule`, payload);
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setReason('');
        setFormErrors({});
        bottomSheetModalRef.current?.dismiss();
        handleRefresh();
      } catch (error) {
        console.error('Error rescheduling appointment:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log(formErrors)
      setIsSubmitting(false);
    }
  };

  const formatDateDisplay = (dateToFormat?: Date) => {
    if (!dateToFormat) return 'Select Date';
    return dateToFormat.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeDisplay = (timeToFormat?: Date) => {
    if (!timeToFormat) return 'Select Time';
    return timeToFormat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleOpenDatePicker = () => setShowDatePicker(true);
  const handleOpenTimePicker = () => setShowTimePicker(true);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios' ? true : false);
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'set' && date) {
      // format the date to make it only date without time
      const formattedDate = new Date(date.setHours(0, 0, 0, 0));
      setSelectedDate(formattedDate);
      setFormErrors((prev) => ({ ...prev, date: undefined }));
      if (Platform.OS === 'ios') setShowDatePicker(false);
    } else if (event.type === 'dismissed' && Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios' ? true : false);
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (event.type === 'set' && time) {
      setSelectedTime(time);
      setFormErrors((prev) => ({ ...prev, time: undefined }));
      if (Platform.OS === 'ios') setShowTimePicker(false);
    } else if (event.type === 'dismissed' && Platform.OS === 'ios') {
      setShowTimePicker(false);
    }
  };

  const handlePresentRescheduleSheet = () => {
    if (!appointment) return;
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setReason('');
    setFormErrors({});
    bottomSheetModalRef.current?.present();
  };

  const handlePresentCancelSheet = () => {
    if (!appointment) return;
    setCancelReason('');
    setCancelFormErrors({});
    setIsSubmittingCancel(false);
    cancelSheetRef.current?.present();
  };

  const validateCancelForm = () => {
    const newErrors: { reason?: string } = {};
    if (!cancelReason.trim()) newErrors.reason = 'Reason for cancellation is required.';
    setCancelFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelSubmit = async () => {
    if (!appointment) return;
    setIsSubmittingCancel(true);

    const payload = {
      reason: cancelReason,
    };

    if (validateCancelForm()) {
      try {
        await axios.post(`/customer/appointments/${appointment.id}/cancel`, payload);
        setCancelReason('');
        setCancelFormErrors({});
        cancelSheetRef.current?.dismiss();
        handleRefresh(); // Refresh data after successful cancellation
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        // Optionally, show an alert to the user
        Alert.alert('Error', 'Could not cancel the appointment. Please try again.');
      } finally {
        setIsSubmittingCancel(false);
      }
    } else {
      setIsSubmittingCancel(false);
    }
  };

  if (!appointment || appointment.status.code === 'completed' || appointment.status.code === 'cancelled') {
    return null;
  }

  return (
    <>
      <View className="mx-4 my-4 flex-row gap-4">
        <Button
          variant='destructive'
          onPress={handlePresentCancelSheet}
          className='flex-1'
        >
          <Text className="text-center font-bold text-white">Cancel</Text>
        </Button>
        <Button
          variant='secondary'
          onPress={handlePresentRescheduleSheet}
          className='flex-1'
        >
          <Text className="text-center font-bold text-white">Reschedule</Text>
        </Button>
      </View>

      <Sheet
        ref={bottomSheetModalRef}
        snapPoints={["70%", "90%"]}

      >
        <BottomSheetView style={{ flex: 1 }} className="p-0">
          <ThemedView>
            <View >
              <View className="flex-row justify-between items-center p-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">Reschedule Appointment</Text>
                <TouchableOpacity activeOpacity={0.625} onPress={() => bottomSheetModalRef.current?.dismiss()} >
                  <Ionicons name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>
              <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                <View className="">
                  <View className="mb-5">
                    <Text className="text-base font-medium text-foreground mb-2">Date</Text>
                    <TouchableOpacity
                      onPress={handleOpenDatePicker}
                      className="flex-row justify-between items-center p-3 bg-input rounded-lg border border-border"
                    >
                      <Text className={`text-foreground ${!selectedDate ? 'opacity-60' : ''}`}>{formatDateDisplay(selectedDate)}</Text>
                      <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    {formErrors.date && <Text className="text-destructive mt-1 text-sm">{formErrors.date}</Text>}
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-foreground mb-2">Time</Text>
                    <TouchableOpacity
                      onPress={handleOpenTimePicker}
                      className="flex-row justify-between items-center p-3 bg-input rounded-lg border border-border"
                    >
                      <Text className={`text-foreground ${!selectedTime ? 'opacity-60' : ''}`}>{formatTimeDisplay(selectedTime)}</Text>
                      <Ionicons name="time-outline" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    {formErrors.time && <Text className="text-destructive mt-1 text-sm">{formErrors.time}</Text>}
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-foreground mb-2">Reason for Rescheduling</Text>
                    <BottomSheetTextInput
                      className="min-h-[100px] p-3 bg-input text-foreground rounded-lg border border-border text-base align-top"
                      placeholder="Please provide a reason..."
                      placeholderTextColor={colors.mutedForeground}
                      value={reason}
                      onChangeText={(text) => {
                        setReason(text);
                        setFormErrors((prev) => ({ ...prev, reason: undefined }));
                      }}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    {formErrors.reason && <Text className="text-destructive mt-1 text-sm">{formErrors.reason}</Text>}
                  </View>

                  <Button
                    onPress={handleRescheduleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ActivityIndicator size="small" color={colors.foreground} /> : <Text className="text-primary-foreground font-semibold text-base">Reschedule</Text>}
                  </Button>
                </View>
              </BottomSheetScrollView>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="default"
                  minuteInterval={15}
                  onChange={onTimeChange}
                />
              )}
            </View>
          </ThemedView>
        </BottomSheetView>
      </Sheet>

      {/* Cancel Appointment Sheet */}
      <Sheet
        ref={cancelSheetRef}
        snapPoints={["55%", "60%"]} // Adjust snap points as needed for content
      >
        <BottomSheetView style={{ flex: 1 }} className="p-0">
          <ThemedView >
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-xl font-bold text-foreground">Cancel Appointment</Text>
              <TouchableOpacity activeOpacity={0.625} onPress={() => cancelSheetRef.current?.dismiss()} >
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <BottomSheetView>
                <BottomSheetView className="mb-5">
                  <Text className="text-base font-medium text-foreground mb-2">Reason for Cancellation</Text>
                  <BottomSheetTextInput
                    className="min-h-[100px] p-3 bg-input text-foreground rounded-lg border border-border text-base align-top"
                    placeholder="Please provide a reason..."
                    placeholderTextColor={colors.mutedForeground}
                    value={cancelReason}
                    onChangeText={(text) => {
                      setCancelReason(text);
                      setCancelFormErrors((prev) => ({ ...prev, reason: undefined }));
                    }}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {cancelFormErrors.reason && <Text className="text-destructive mt-1 text-sm">{cancelFormErrors.reason}</Text>}
                </BottomSheetView>

                <Button
                  // className="bg-destructive p-4 rounded-xl items-center mt-3"
                  variant="destructive"
                  onPress={handleCancelSubmit}
                  disabled={isSubmittingCancel}
                >
                  {isSubmittingCancel ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <Text className="font-bold text-white">Confirm Cancellation</Text>
                  )}
                </Button>
              </BottomSheetView>
            </BottomSheetScrollView>
          </ThemedView>
        </BottomSheetView>
      </Sheet>
    </>
  );
};

export default ActionButtonsSection; 