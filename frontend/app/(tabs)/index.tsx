import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

import { Icon } from "@/src/components/Icon";
import { NoteRow } from "@/src/components/NoteRow";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes, selectPriorityNotes } from "@/src/context/NotesContext";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";
import { useEditSheet } from "@/src/context/EditSheetContext";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  resolveCategory,
} from "@/src/constants/categories";
import { headerDate } from "@/src/lib/format";
import { haptics } from "@/src/lib/haptics";

export default function CaptureScreen() {
  const { colors, scheme } = useTheme();
  const { t, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, processing, addFromText, customCategories } = useNotes();
  const { token, syncing } = useAuth();
  const { show } = useToast();
  const { openEdit } = useEditSheet();

  const [text, setText] = useState("");
  const [collapsedPriority, setCollapsedPriority] = useState<Record<string, boolean>>({});

  const priorityNotes = useMemo(() => selectPriorityNotes(notes), [notes]);

  // Group priority notes by category in canonical order
  const priorityGroups = useMemo(() => {
    const map: Record<string, typeof priorityNotes> = {};
    for (const n of priorityNotes) {
      if (!map[n.category]) map[n.category] = [];
      map[n.category].push(n);
    }
    const orderedIds = [
      ...CATEGORY_ORDER,
      ...customCategories.map((c) => c.id),
    ];
    return orderedIds
      .filter((id) => map[id])
      .map((id) => ({ id, items: map[id] }));
  }, [priorityNotes, customCategories]);

  // Button enabled as soon as there is text — never blocked by AI processing
  const canAdd = text.trim().length > 0;

  const catLabel = (id: string) =>
    CATEGORIES[id]
      ? t(`cat.${id}`)
      : customCategories.find((c) => c.id === id)?.label ?? t("cat.notlar");

  const onAdd = async () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    haptics.light();
    const res = await addFromText(value);
    if (res.count > 0) {
      if (res.count === 1)
        show(t("capture.addedOne", { cat: catLabel(res.categories[0]) }));
      else show(t("capture.addedMany", { n: res.count }));
    }
  };

  const toggleGroup = (id: string) =>
    setCollapsedPriority((c) => ({ ...c, [id]: !c[id] }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      {/* top bar */}
      <View style={styles.topBar}>
        {token ? (
          <View style={styles.backup} testID="backup-indicator">
            {syncing ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <Feather name="cloud" size={18} color={colors.brand} />
            )}
          </View>
        ) : (
          <View style={styles.backup} />
        )}
        <Pressable
          testID="open-settings"
          hitSlop={10}
          onPress={() => router.push("/settings")}
          style={[styles.gear, { backgroundColor: colors.card }]}
        >
          <Feather name="settings" size={19} color={colors.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {headerDate(lang)}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("capture.title")}
        </Text>

        <TextInput
          testID="capture-input"
          value={text}
          onChangeText={setText}
          placeholder={t("capture.placeholder")}
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.inputText,
              borderColor: colors.cardBorder,
            },
          ]}
        />

        {/* section header with background AI indicator */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {t("capture.priority")}
          </Text>
          {processing && (
            <View style={styles.aiDot} testID="ai-processing-indicator">
              <ActivityIndicator size="small" color={colors.brand} />
            </View>
          )}
        </View>

        {priorityGroups.length === 0 ? (
          <View style={styles.empty} testID="capture-empty">
            <Feather name="check-circle" size={22} color={colors.textMuted} />
            <Text
              style={[styles.emptyTitle, { color: colors.textSecondary }]}
            >
              {t("capture.emptyTitle")}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {t("capture.emptySub")}
            </Text>
          </View>
        ) : (
          <View style={styles.groups}>
            {priorityGroups.map(({ id, items }) => {
              const meta = resolveCategory(id, customCategories);
              const isOpen = !collapsedPriority[id];
              return (
                <View key={id} style={styles.group}>
                  <Pressable
                    testID={`priority-group-${id}`}
                    style={styles.groupHeader}
                    onPress={() => toggleGroup(id)}
                  >
                    <View
                      style={[
                        styles.groupIcon,
                        { backgroundColor: meta.tint[scheme] },
                      ]}
                    >
                      <Icon
                        family={meta.icon.family}
                        name={meta.icon.name}
                        size={13}
                        color={meta.fg[scheme]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.groupLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {catLabel(id)}
                    </Text>
                    <View
                      style={[
                        styles.groupCount,
                        { backgroundColor: colors.input },
                      ]}
                    >
                      <Text
                        style={[
                          styles.groupCountText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {items.length}
                      </Text>
                    </View>
                    <Feather
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.textMuted}
                    />
                  </Pressable>
                  {isOpen && (
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      {items.map((n, i) => (
                        <NoteRow
                          key={n.id}
                          note={n}
                          onEdit={openEdit}
                          variant="capture"
                          isLast={i === items.length - 1}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View
          style={[
            styles.addBar,
            {
              backgroundColor: colors.bg,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            },
          ]}
        >
          <Pressable
            testID="add-note-button"
            onPress={onAdd}
            disabled={!canAdd}
            style={[
              styles.addBtn,
              { backgroundColor: canAdd ? colors.brand : colors.input },
            ]}
          >
            <Feather
              name="plus"
              size={20}
              color={canAdd ? colors.brandText : colors.textMuted}
            />
            <Text
              style={[
                styles.addText,
                { color: canAdd ? colors.brandText : colors.textMuted },
              ]}
            >
              {t("capture.add")}
            </Text>
          </Pressable>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 44,
  },
  backup: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  input: {
    minHeight: 150,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    fontSize: 18,
    lineHeight: 25,
    textAlignVertical: "top",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  aiDot: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  groups: { gap: 12 },
  group: {},
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  groupIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  groupLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  groupCount: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  groupCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 19,
  },
  addBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
  },
  addText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
