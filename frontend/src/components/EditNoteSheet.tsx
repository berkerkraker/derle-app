import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";

import { Icon } from "@/src/components/Icon";
import { SegmentedControl } from "@/src/components/SegmentedControl";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  resolveCategory,
} from "@/src/constants/categories";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes } from "@/src/context/NotesContext";
import { haptics } from "@/src/lib/haptics";
import { Note, Priority } from "@/src/types";

interface Props {
  note: Note | null;
  onClose: () => void;
}

export function EditNoteSheet({ note, onClose }: Props) {
  const ref = useRef<BottomSheetModal>(null);
  const { colors, scheme } = useTheme();
  const { t } = useI18n();
  const { updateNote, deleteNote, customCategories } = useNotes();

  const [text, setText] = useState("");
  const [category, setCategory] = useState("notlar");
  const [priority, setPriority] = useState<Priority>("low");
  const [pinned, setPinned] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (note) {
      setText(note.text);
      setCategory(note.category);
      setPriority(note.priority);
      setPinned(note.pinned);
      setConfirmDelete(false);
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [note]);

  const catIds = useMemo(
    () => [...CATEGORY_ORDER, ...customCategories.map((c) => c.id)],
    [customCategories],
  );

  const save = () => {
    if (note) {
      const cleaned = text.trim();
      updateNote(note.id, {
        text: cleaned.length > 0 ? cleaned : note.text,
        category,
        priority,
        pinned,
      });
    }
    haptics.success();
    onClose();
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (note) deleteNote(note.id);
    haptics.warning();
    onClose();
  };

  const onPriorityChange = (p: string) => {
    const pr = p as Priority;
    setPriority(pr);
    setPinned(pr !== "low");
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["74%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={{ backgroundColor: colors.sheetHandle }}
      backgroundStyle={{ backgroundColor: colors.sheet }}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>{t("edit.title")}</Text>
          <Pressable hitSlop={8} onPress={onClose} testID="edit-close">
            <Feather name="x" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <BottomSheetTextInput
          testID="edit-text-input"
          value={text}
          onChangeText={setText}
          multiline
          style={[
            styles.input,
            { backgroundColor: colors.input, color: colors.inputText },
          ]}
          placeholder={t("capture.placeholder")}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("edit.category")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {catIds.map((id) => {
            const meta = resolveCategory(id, customCategories);
            const selected = id === category;
            const label = CATEGORIES[id]
              ? t(`cat.${id}`)
              : customCategories.find((c) => c.id === id)?.label ?? id;
            return (
              <Pressable
                key={id}
                testID={`edit-cat-${id}`}
                onPress={() => {
                  haptics.selection();
                  setCategory(id);
                }}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: selected ? meta.tint[scheme] : colors.input,
                    borderColor: selected ? meta.accent : "transparent",
                  },
                ]}
              >
                <Icon
                  family={meta.icon.family}
                  name={meta.icon.name}
                  size={14}
                  color={selected ? meta.fg[scheme] : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.catLabel,
                    { color: selected ? meta.fg[scheme] : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t("edit.priority")}</Text>
        <SegmentedControl
          testIDPrefix="edit-priority"
          value={priority}
          onChange={onPriorityChange}
          options={[
            { label: t("priority.high"), value: "high" },
            { label: t("priority.medium"), value: "medium" },
            { label: t("priority.low"), value: "low" },
          ]}
        />

        <View style={styles.actions}>
          <Pressable
            testID="edit-delete"
            onPress={remove}
            style={[
              styles.deleteBtn,
              {
                backgroundColor: confirmDelete ? colors.danger : colors.dangerSoft,
              },
            ]}
          >
            <Feather name="trash-2" size={18} color={confirmDelete ? "#FFFFFF" : colors.danger} />
            <Text
              style={[
                styles.deleteText,
                { color: confirmDelete ? "#FFFFFF" : colors.danger },
              ]}
            >
              {confirmDelete ? t("edit.deleteConfirm") : t("edit.delete")}
            </Text>
          </Pressable>

          <Pressable
            testID="edit-save"
            onPress={save}
            style={[styles.saveBtn, { backgroundColor: colors.brand }]}
          >
            <Text style={[styles.saveText, { color: colors.brandText }]}>{t("edit.save")}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  input: {
    minHeight: 110,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  catRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
