import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "@/src/components/Icon";
import { CATEGORIES, resolveCategory } from "@/src/constants/categories";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes } from "@/src/context/NotesContext";

export function CategoryChip({ categoryId }: { categoryId: string }) {
  const { scheme } = useTheme();
  const { t } = useI18n();
  const { customCategories } = useNotes();

  const meta = resolveCategory(categoryId, customCategories);
  const bg = meta.tint[scheme];
  const fg = meta.fg[scheme];
  const label = CATEGORIES[categoryId]
    ? t(`cat.${categoryId}`)
    : customCategories.find((c) => c.id === categoryId)?.label ?? t("cat.notlar");

  return (
    <View style={[styles.chip, { backgroundColor: bg }]} testID={`chip-${categoryId}`}>
      <Icon family={meta.icon.family} name={meta.icon.name} size={12} color={fg} />
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    maxWidth: 200,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
