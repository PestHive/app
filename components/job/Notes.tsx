import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface Note {
  id: number;
  added_by: {
    name: string;
  };
  added_at: string;
  content: string;
}

interface NotesProps {
  notes: Note[];
  formatNoteDate: (dateString: string) => string;
  onAddNote?: () => void;
}

const Notes: React.FC<NotesProps> = ({ notes, formatNoteDate, onAddNote }) => {
  return (
    <View className="bg-card rounded-xl p-4 mb-4">
      {notes.length > 0 ? (
        <>
          {notes.map((note, index) => (
            <View
              key={note.id}
              className={`${index !== 0 ? "mt-4 pt-4 border-t border-border" : ""}`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="h-7 w-7 rounded-full bg-primary/20 items-center justify-center mr-2">
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="font-medium text-foreground">
                    {note.added_by.name}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {formatNoteDate(note.added_at)}
                </Text>
              </View>
              <Text className="text-foreground pl-9">
                {note.content}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            className="mt-4 pt-4 border-t border-border flex-row items-center"
            onPress={onAddNote || (() => 
              Alert.alert(
                "Add Note",
                "This feature would allow adding new notes to the job."
              )
            )}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color="#3B82F6"
            />
            <Text className="text-primary font-medium ml-2">
              Add New Note
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View className="items-center py-6">
          <Ionicons
            name="document-text-outline"
            size={40}
            color="#CBD5E1"
          />
          <Text className="text-muted-foreground mt-2">
            No notes available
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary/10 px-4 py-2 rounded-full flex-row items-center"
            onPress={onAddNote || (() => 
              Alert.alert(
                "Add Note",
                "This feature would allow adding new notes to the job."
              )
            )}
          >
            <Ionicons
              name="add-circle-outline"
              size={16}
              color="#3B82F6"
            />
            <Text className="text-primary font-medium ml-1">
              Add First Note
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Notes; 