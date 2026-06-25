import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Icon } from "@/src/components/Icon";
import { NoteRow } from "@/src/components/NoteRow";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes, priorityWeight } from "@/src/context/NotesContext";
import { useEditSheet } from "@/src/context/EditSheetContext";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  resolveCategory,
} from "@/src/constants/categories";

export default function OrganizeScreen() {
  const { colors, scheme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, customCategories } = useNotes();
  const { openEdit } = useEditSheet();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [doneOpen, setDoneOpen] = useState(false);
  const [doneCollapsed, setDoneCollapsed] = useState<Record<string, boolean>>({});

  const orderedCatIds = useMemo(
    () => [...CATEGORY_ORDER, ...customCategories.map((c) => c.id)],
    [customCategories],
  );

  // ── Active groups: non-done notes only ────────────────────────────────────
  const groups = useMemo(() => {
    return orderedCatIds
      .map((id) => ({
        id,
        items: notes
          .filter((n) => n.category === id && !n.done)
          .sort(
            (a, b) =>
              priorityWeight(b) - priorityWeight(a) || b.updatedAt - a.updatedAt,
          ),
      }))
      .filter((g) => g.items.length > 0);
  }, [orderedCatIds, notes]);

  // ── Done groups: completed notes separated into their own section ─────────
  const doneGroups = useMemo(() => {
    return orderedCatIds
      .map((id) => ({
        id,
        items: notes
          .filter((n) => n.category === id && n.done)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      }))
      .filter((g) => g.items.length > 0);
  }, [orderedCatIds, notes]);

  const totalDone = doneGroups.reduce((s, g) => s + g.items.length, 0);
  const isEmpty = groups.length === 0 && doneGroups.length === 0;

  const catLabel = (id: string) =>
    CATEGORIES[id]
      ? t(`cat.${id}`)
      : customCategories.find((c) => c.id === id)?.label ?? t("cat.notlar");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("organize.title")}
        </Text>
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
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.empty} testID="organize-empty">
            <Feather name="inbox" size={26} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {t("organize.empty")}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {t("organize.emptySub")}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Active category groups ─────────────────────────────────── */}
            {groups.map((group) => {
              const meta = resolveCategory(group.id, customCategories);
              const isOpen = !collapsed[group.id];
              return (
                <View key={group.id} style={styles.section}>
                  <Pressable
                    testID={`cat-header-${group.id}`}
                    style={styles.sectionHeader}
                    onPress={() =>
                      setCollapsed((c) => ({ ...c, [group.id]: !!isOpen }))
                    }
                  >
                    <View
                      style={[
                        styles.iconTile,
                        { backgroundColor: meta.tint[scheme] },
                      ]}
                    >
                      <Icon
                        family={meta.icon.family}
                        name={meta.icon.name}
                        size={15}
                        color={meta.fg[scheme]}
                      />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {catLabel(group.id)}
                    </Text>
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: colors.input },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {group.items.length}
                      </Text>
                    </View>
                    <Feather
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={20}
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
                      {group.items.map((n, i) => (
                        <NoteRow
                          key={n.id}
                          note={n}
                          onEdit={openEdit}
                          variant="organize"
                          isLast={i === group.items.length - 1}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {/* ── Tamamlananlar section ──────────────────────────────────── */}
            {doneGroups.length > 0 && (
              <View style={[styles.section, styles.doneSectionWrap]}>
                {/* Divider */}
                <View
                  style={[
                    styles.doneDivider,
                    { backgroundColor: colors.divider },
                  ]}
                />

                {/* Tamamlananlar collapsible header */}
                <Pressable
                  testID="tamamlananlar-header"
                  style={styles.sectionHeader}
                  onPress={() => setDoneOpen((v) => !v)}
                >
                  <View
                    style={[styles.iconTile, { backgroundColor: colors.input }]}
                  >
                    <Feather
                      name="check-square"
                      size={15}
                      color={colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[styles.sectionTitle, { color: colors.textMuted }]}
                  >
                    {t("organize.completed")}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: colors.input },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: colors.textMuted },
                      ]}
                    >
                      {totalDone}
                    </Text>
                  </View>
                  <Feather
                    name={doneOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>

                {/* Done sub-groups, each collapsible by category */}
                {doneOpen && (
                  <View style={{ gap: 12 }}>
                    {doneGroups.map((group) => {
                      const meta = resolveCategory(group.id, customCategories);
                      const isOpen = !doneCollapsed[group.id];
                      return (
                        <View key={group.id}>
                          <Pressable
                            testID={`done-cat-${group.id}`}
                            style={[styles.sectionHeader, styles.doneSubHeader]}
                            onPress={() =>
                              setDoneCollapsed((c) => ({
                                ...c,
                                [group.id]: !!isOpen,
                              }))
                            }
                          >
                            <View
                              style={[
                                styles.iconTile,
                                { backgroundColor: meta.tint[scheme], opacity: 0.6 },
                              ]}
                            >
                              <Icon
                                family={meta.icon.family}
                                name={meta.icon.name}
                                size={14}
                                color={meta.fg[scheme]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.doneSubTitle,
                                { color: colors.textMuted },
                              ]}
                            >
                              {catLabel(group.id)}
                            </Text>
                            <View
                              style={[
                                styles.countBadge,
                                { backgroundColor: colors.input },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.countText,
                                  { color: colors.textMuted },
                                ]}
                              >
                                {group.items.length}
                              </Text>
                            </View>
                            <Feather
                              name={isOpen ? "chevron-up" : "chevron-down"}
                              size={17}
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
                                  opacity: 0.8,
                                },
                              ]}
                            >
                              {group.items.map((n, i) => (
                                <NoteRow
                                  key={n.id}
                                  note={n}
                                  onEdit={openEdit}
                                  variant="organize"
                                  isLast={i === group.items.length - 1}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginBottom: 22 },
  doneSectionWrap: { marginTop: 4 },
  doneDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  doneSubHeader: {
    marginBottom: 6,
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    flexShrink: 1,
    flex: 1,
  },
  doneSubTitle: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    flex: 1,
  },
  countBadge: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 19,
  },
});
