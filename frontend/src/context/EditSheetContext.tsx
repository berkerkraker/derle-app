import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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

interface EditSheetContextValue {
  openEdit: (note: Note) => void;
}

const EditSheetContext = createContext<EditSheetContextValue>({ openEdit: () => {} });
export const useEditSheet = () => useContext(EditSheetContext);

export function EditSheetProvider({ children }: { children: React.ReactNode }) {
  const { colors, scheme } = useTheme();
  const { t } = useI18n();
  const { updateNote, deleteNote, customCategories } = useNotes();
  const insets = useSafeAreaInsets();

  const [note, setNote] = useState<Note | null>(null);
  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const [text, setText] = useState("");
  const [category, setCategory] = useState("notlar");
  const [priority, setPriority] = useState<Priority>("low");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openEdit = useCallback(
    (n: Note) => {
      setNote(n);
      setText(n.text);
      setCategory(n.category);
      setPriority(n.priority);
      setConfirmDelete(false);
      setMounted(true);
    },
    [],
  );

  useEffect(() => {
    if (mounted) {
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        damping: 22,
        stiffness: 240,
        mass: 0.7,
      }).start();
    }
  }, [mounted, progress]);

  const close = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
      setNote(null);
    });
  }, [progress]);

  // Acil ve Önemli notlar Yakala ekranında otomatik öne çıkar;
  // ayrı bir "yıldız" kavramı yok.
  const save = () => {
    if (note) {
      const cleaned = text.trim();
      updateNote(note.id, {
        text: cleaned.length > 0 ? cleaned : note.text,
        category,
        priority,
      });
    }
    haptics.success();
    close();
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (note) deleteNote(note.id);
    haptics.warning();
    close();
  };

  const catIds = useMemo(
    () => [...CATEGORY_ORDER, ...customCategories.map((c) => c.id)],
    [customCategories],
  );

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <EditSheetContext.Provider value={{ openEdit }}>
      {children}
      {mounted && (
        <View style={styles.overlay} testID="edit-sheet">
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay, opacity: backdropOpacity }]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={close} testID="edit-backdrop" />
          <KeyboardAvoidingView
            style={styles.kav}
            behavior="padding"
          >
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: colors.sheet,
                  paddingBottom: insets.bottom + 20,
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={[styles.handle, { backgroundColor: colors.sheetHandle }]} />
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                  <Text style={[styles.title, { color: colors.text }]}>{t("edit.title")}</Text>
                  <Pressable hitSlop={8} onPress={close} testID="edit-close">
                    <Feather name="x" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <TextInput
                  testID="edit-text-input"
                  value={text}
                  onChangeText={setText}
                  multiline
                  style={[styles.input, { backgroundColor: colors.input, color: colors.inputText }]}
                  placeholder={t("capture.placeholder")}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>{t("edit.category")}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catRow}
                  keyboardShouldPersistTaps="handled"
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
                        onPress={() => setCategory(id)}
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
                  onChange={(p) => {
                    haptics.selection();
                    setPriority(p as Priority);
                  }}
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
                      { backgroundColor: confirmDelete ? colors.danger : colors.dangerSoft },
                    ]}
                  >
                    <Feather name="trash-2" size={18} color={confirmDelete ? "#FFFFFF" : colors.danger} />
                    <Text
                      style={[styles.deleteText, { color: confirmDelete ? "#FFFFFF" : colors.danger }]}
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
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      )}
    </EditSheetContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  kav: {
    flex: 1,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: "700" },
  input: {
    minHeight: 100,
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
    marginTop: 18,
    marginBottom: 10,
  },
  catRow: { gap: 8, paddingVertical: 2, paddingRight: 8 },
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
  catLabel: { fontSize: 14, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
  },
  deleteText: { fontSize: 15, fontWeight: "700" },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontSize: 16, fontWeight: "700" },
});
