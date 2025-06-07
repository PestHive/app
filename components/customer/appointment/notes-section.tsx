import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/context/ThemeContext';
import { Appointment } from '../../../app/(customer)/appointment/[id]';
import axios from '~/lib/axios';
import { Card, CardContent } from '~/components/ui/card';

// Define a more specific type for a single note if not already available globally
type Note = NonNullable<Appointment['notes']>[number];

interface NotesSectionProps {
  appointment: Appointment | null;
  onNoteAdded?: () => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  appointment,
  onNoteAdded,
}) => {
  const { isDark } = useTheme();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSaveNote = async () => {
    if (newNoteContent.trim() === '') {
      setError('Empty Note');
      return;
    }
    setIsSavingNote(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await axios.post(`/customer/appointments/${appointment?.id}/notes`, {
        content: newNoteContent,
      });

      if (onNoteAdded) {
        onNoteAdded();
      }
      setNewNoteContent('');
      setShowNoteInput(false);
      setIsSavingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }

  };

  return (
    <View className="my-2 px-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-foreground">
          Notes
        </Text>
        <TouchableOpacity
          onPress={() => setShowNoteInput(prev => !prev)}
          className="flex-row items-center p-1 -mr-1"
        >
          <Ionicons
            name={showNoteInput ? "close-circle-outline" : "add-circle-outline"}
            size={16}
            className='text-primary'
          />
          <Text className="text-primary font-medium ml-1">
            {showNoteInput ? 'Cancel' : (appointment?.notes && appointment.notes.length > 0 ? 'Add Note' : 'Add First Note')}
          </Text>
        </TouchableOpacity>
      </View>

      <CardContent>
        {showNoteInput && (
          <View className="pb-4 mb-4 border-b border-border">
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Write your note here..."
              placeholderTextColor={isDark ? "#A1A1AA" : "#71717A"}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              className="bg-input dark:bg-input/30 text-foreground p-3 rounded h-24 leading-6"
              textAlignVertical="top"
            />
            {error && (
              <Text className="text-red-500 text-sm mt-2">{error}</Text>
            )}
            <View className="flex-row justify-end mt-3 space-x-2">
              <TouchableOpacity
                onPress={handleSaveNote}
                disabled={isSavingNote}
                className={`bg-primary px-4 py-2 rounded-lg ${isSavingNote ? 'opacity-50' : ''}`}>
                <Text className="text-primary-foreground font-medium">
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {appointment?.notes && appointment.notes.length > 0 ? (
          <View>
            {appointment.notes.map((note: Note, index: number) => (
              <View
                key={note.id || index}
                className={`${index !== 0 ? "mt-4 pt-4 border-t border-border" : ""}`}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="h-7 w-7 rounded-3xl bg-primary items-center justify-center mr-2">
                      <Ionicons
                        name="person-outline"
                        size={14}
                        className='text-white'
                      />
                    </View>
                    <Text className="font-medium text-foreground">
                      {note.added_by?.name || 'System'}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    {note.added_at}
                  </Text>
                </View>
                <Text className="text-muted-foreground pl-9">
                  {note.content}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          !showNoteInput && (
            <View className="items-center py-6">
              <Ionicons name="document-text-outline" size={40} color={isDark ? "#4B5563" : "#CBD5E1"} />
              <Text className="text-muted-foreground mt-2 mb-3"> No notes available </Text>
            </View>
          )
        )}
      </CardContent>
    </View>
  );
};

export default NotesSection; 