import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Feather, Ionicons } from "@expo/vector-icons";

import { Checkbox } from "@/src/components/Checkbox";
import { CategoryChip } from "@/src/components/CategoryChip";
import { PriorityDot } from "@/src/components/PriorityDot";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes } from "@/src/context/NotesContext";
import { relativeDate } from "@/src/lib/format";
import { haptics } from "@/src/lib/haptics";
import { Note } from "@/src/types";

interface Props {
  note: Note;
  onEdit: (n: Note) => void;
  variant: "capture" | "organize";
  isLast?: boolean;
}

export function NoteRow({ note, onEdit, variant, isLast }: Props) {
  const { colors, scheme } = useTheme();
  const { t, lang } = useI18n();
  const { toggleDone, togglePinned, deleteNote } = useNotes();

  const renderRightActions = () => (
    <Pressable
      testID={`note-delete-${note.id}`}
      onPress={() => {
        haptics.warning();
        deleteNote(note.id);
      }}
      style={[styles.deleteAction, { backgroundColor: colors.danger }]}
    >
      <Feather name="trash-2" size={20} color="#FFFFFF" />
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
      friction={2}
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.divider,
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Checkbox checked={note.done} onToggle={() => toggleDone(note.id)} testID={`note-check-${note.id}`} />

        <Pressable style={styles.middle} onPress={() => onEdit(note)} testID={`note-row-${note.id}`}>
          <Text
            numberOfLines={2}
            style={[
              styles.text,
              {
                color: note.done ? colors.textMuted : colors.text,
                textDecorationLine: note.done ? "line-through" : "none",
              },
            ]}
          >
            {note.text}
          </Text>
          <View style={styles.meta}>
            <PriorityDot priority={note.priority} />
            {variant === "capture" ? (
              <CategoryChip categoryId={note.category} />
            ) : (
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {relativeDate(note.createdAt, lang, t("date.today"), t("date.yesterday"))}
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          hitSlop={8}
          onPress={() => {
            haptics.light();
            togglePinned(note.id);
          }}
          style={styles.pin}
          testID={`note-pin-${note.id}`}
        >
          <Ionicons
            name={note.pinned ? "star" : "star-outline"}
            size={16}
            color={note.pinned ? colors.important : colors.textMuted}
          />
        </Pressable>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  middle: {
    flex: 1,
    gap: 7,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 13,
    fontWeight: "500",
  },
  pin: {
    padding: 4,
  },
  deleteAction: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
});
