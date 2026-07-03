import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Feather, Ionicons } from "@expo/vector-icons";

import { Checkbox } from "@/src/components/Checkbox";
import { CategoryChip } from "@/src/components/CategoryChip";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes } from "@/src/context/NotesContext";
import { useToast } from "@/src/components/Toast";
import { PRIORITY_COLOR } from "@/src/theme/colors";
import { relativeDate } from "@/src/lib/format";
import { haptics } from "@/src/lib/haptics";
import { Note, Priority } from "@/src/types";

interface Props {
  note: Note;
  onEdit: (n: Note) => void;
  variant: "capture" | "organize";
  isLast?: boolean;
}

// Tik atınca çizgi bir an görünür kalır, sonra not Tamamlananlar'a süzülür.
const DONE_DELAY = 700;

const NEXT_PRIORITY: Record<Priority, Priority> = {
  low: "medium",
  medium: "high",
  high: "low",
};

export function NoteRow({ note, onEdit, variant, isLast }: Props) {
  const { colors, scheme } = useTheme();
  const { t, lang } = useI18n();
  const { toggleDone, togglePinned, deleteNote, updateNote } = useNotes();
  const { show } = useToast();

  const [pendingDone, setPendingDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // dış dünyada done değiştiyse bekleyen animasyon durumunu sıfırla
  useEffect(() => {
    setPendingDone(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, [note.done]);

  const struck = note.done || pendingDone;

  const onCheck = () => {
    if (note.done) {
      // Tamamlananlar'dan geri al — beklemeden döner
      toggleDone(note.id);
      return;
    }
    if (pendingDone) {
      // çizgi süresi içinde ikinci dokunuş = vazgeç
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      setPendingDone(false);
      return;
    }
    setPendingDone(true);
    haptics.success();
    if (variant === "capture") show(t("note.done"));
    timer.current = setTimeout(() => toggleDone(note.id), DONE_DELAY);
  };

  const cyclePriority = () => {
    haptics.selection();
    updateNote(note.id, { priority: NEXT_PRIORITY[note.priority] ?? "medium" });
  };

  const prColor = PRIORITY_COLOR[note.priority];
  const prLow = note.priority === "low";

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
        <Checkbox checked={struck} onToggle={onCheck} testID={`note-check-${note.id}`} />

        <Pressable style={styles.middle} onPress={() => onEdit(note)} testID={`note-row-${note.id}`}>
          <Text
            numberOfLines={2}
            style={[
              styles.text,
              {
                color: struck ? colors.textMuted : colors.text,
                textDecorationLine: struck ? "line-through" : "none",
              },
            ]}
          >
            {note.text}
          </Text>
          <View style={styles.meta}>
            {!note.done && (
              <Pressable
                testID={`note-priority-${note.id}`}
                onPress={cyclePriority}
                hitSlop={6}
                style={[
                  styles.prChip,
                  prLow
                    ? { borderColor: colors.cardBorder, backgroundColor: "transparent" }
                    : {
                        borderColor: "transparent",
                        backgroundColor: prColor + (scheme === "light" ? "1F" : "2E"),
                      },
                ]}
              >
                {!prLow && <View style={[styles.prDot, { backgroundColor: prColor }]} />}
                <Text
                  style={[
                    styles.prText,
                    { color: prLow ? colors.textMuted : prColor },
                  ]}
                >
                  {t(`priority.${note.priority}`)}
                </Text>
              </Pressable>
            )}
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
  prChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
  },
  prDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  prText: {
    fontSize: 11.5,
    fontWeight: "700",
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
