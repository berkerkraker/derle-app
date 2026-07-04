import React from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { CategoryChip } from "@/src/components/CategoryChip";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { OrganizedItem } from "@/src/types";

interface Props {
  visible: boolean;
  items: OrganizedItem[];
  /** split = yazılan metni böl; tidy = bekleyen notları kategorisine taşı */
  mode: "split" | "tidy";
  onConfirm: () => void;
  onSingle: () => void;
  onCancel: () => void;
}

// "✨ Derle" önizlemesi: motorun önerisi kaydedilmeden ÖNCE gösterilir.
// Kullanıcı onaylamadan hiçbir not oluşmaz/taşınmaz — kontrol her zaman kullanıcıda.
export function DerlePreview({ visible, items, mode, onConfirm, onSingle, onCancel }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const tidy = mode === "tidy";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.sheet,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.sheetHandle }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t(tidy ? "preview.tidyTitle" : "preview.title")}
            </Text>
            <Pressable hitSlop={8} onPress={onCancel} testID="preview-close">
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            {t(tidy ? "preview.tidySub" : "preview.sub", { n: items.length })}
          </Text>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {items.map((it, i) => (
              <View
                key={i}
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
                testID={`preview-item-${i}`}
              >
                <CategoryChip categoryId={it.category} />
                <Text style={[styles.itemText, { color: colors.text }]}>
                  {it.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Pressable
            testID="preview-confirm"
            onPress={onConfirm}
            style={[styles.confirmBtn, { backgroundColor: colors.brand }]}
          >
            <Feather name="check" size={19} color={colors.brandText} />
            <Text style={[styles.confirmText, { color: colors.brandText }]}>
              {t(tidy ? "preview.tidyConfirm" : "preview.confirm", { n: items.length })}
            </Text>
          </Pressable>

          {!tidy && (
            <Pressable
              testID="preview-single"
              onPress={onSingle}
              style={[styles.singleBtn, { borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.singleText, { color: colors.textSecondary }]}>
                {t("preview.single")}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: "80%",
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 13.5,
    marginTop: 3,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
    marginBottom: 14,
  },
  item: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
    gap: 7,
  },
  itemText: {
    fontSize: 15.5,
    lineHeight: 21,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 15,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
  },
  singleBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 8,
  },
  singleText: {
    fontSize: 14.5,
    fontWeight: "600",
  },
});
