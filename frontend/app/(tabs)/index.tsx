import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import { Icon } from "@/src/components/Icon";
import { NoteRow } from "@/src/components/NoteRow";
import { DerlePreview } from "@/src/components/DerlePreview";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes, selectPriorityNotes } from "@/src/context/NotesContext";
import { useToast } from "@/src/components/Toast";
import { useEditSheet } from "@/src/context/EditSheetContext";
import { CATEGORIES, CATEGORY_ORDER, resolveCategory } from "@/src/constants/categories";
import { OrganizedItem } from "@/src/types";
import { TidyItem } from "@/src/lib/localOrganize";
import { headerDate } from "@/src/lib/format";
import { haptics } from "@/src/lib/haptics";
import { storage } from "@/src/utils/storage";

const RECENT_KEY = "derle.recentCats";

type PreviewState =
  | { mode: "split"; items: OrganizedItem[] }
  | { mode: "tidy"; items: TidyItem[] };

export default function CaptureScreen() {
  const { colors, scheme } = useTheme();
  const { t, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    notes,
    addManual,
    previewOrganize,
    addOrganized,
    tidyInbox,
    applyTidy,
    customCategories,
  } = useNotes();
  const { show } = useToast();
  const { openEdit } = useEditSheet();

  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    storage.getItem(RECENT_KEY, "").then((raw) => {
      try {
        const parsed = JSON.parse(raw as string);
        if (Array.isArray(parsed)) {
          setRecent(parsed.filter((x) => typeof x === "string"));
        }
      } catch {
        /* ignore */
      }
    });
  }, []);

  // Açılış = direkt yazmaya hazır: autoFocus bazı cihazlarda tutmazsa emniyet odağı.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputRef.current?.isFocused()) inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const bumpRecent = (id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      storage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Chip order: last-used categories first, then the canonical order.
  const chipOrder = useMemo(() => {
    const base = [...CATEGORY_ORDER, ...customCategories.map((c) => c.id)];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of [...recent, ...base]) {
      if (base.includes(id) && !seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    return out;
  }, [recent, customCategories]);

  // Vitrin: bitmemiş Acil + Önemli notlar, acilden başlayarak.
  // Normal notlar ana ekranı doldurmaz; onlar Düzen'de yaşar.
  const focusList = useMemo(() => selectPriorityNotes(notes), [notes]);

  const canAdd = text.trim().length > 0;

  const catLabel = (id: string) =>
    CATEGORIES[id]
      ? t(`cat.${id}`)
      : customCategories.find((c) => c.id === id)?.label ?? t("cat.notlar");

  const onAdd = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    haptics.light();
    const res = addManual(value, selectedCat ?? undefined);
    if (res.count > 0) {
      show(t("capture.addedOne", { cat: catLabel(res.categories[0]) }));
      if (selectedCat) bumpRecent(selectedCat);
    }
  };

  // ✨ Derle: metin varsa böl + kategorile; kutu boşken bekleyen kategorisiz
  // notları toparlamayı önerir. İki yolda da onaysız hiçbir şey değişmez.
  const onDerle = () => {
    haptics.light();
    const value = text.trim();
    if (value) {
      const items = previewOrganize(value);
      if (!items.length) {
        show(t("capture.derleFail"));
        return;
      }
      setPreview({ mode: "split", items });
      return;
    }
    const tidy = tidyInbox();
    if (!tidy.length) {
      show(t("capture.tidyNone"));
      return;
    }
    setPreview({ mode: "tidy", items: tidy });
  };

  const onPreviewConfirm = () => {
    if (!preview) return;
    if (preview.mode === "split") {
      const res = addOrganized(preview.items);
      setText("");
      if (res.count === 1)
        show(t("capture.addedOne", { cat: catLabel(res.categories[0]) }));
      else show(t("capture.addedMany", { n: res.count }));
    } else {
      const moved = applyTidy(preview.items);
      show(t("capture.tidied", { n: moved }));
    }
    setPreview(null);
    haptics.success();
  };

  const onPreviewSingle = () => {
    setPreview(null);
    onAdd();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      {/* top bar */}
      <View style={styles.topBar}>
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
          ref={inputRef}
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

        {/* category chips — user picks where the note goes; none = Notlar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {chipOrder.map((id) => {
            const meta = resolveCategory(id, customCategories);
            const sel = selectedCat === id;
            return (
              <Pressable
                key={id}
                testID={`capture-cat-${id}`}
                onPress={() => {
                  haptics.light();
                  setSelectedCat(sel ? null : id);
                }}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: sel ? meta.tint[scheme] : colors.card,
                    borderColor: sel ? meta.fg[scheme] : colors.cardBorder,
                  },
                ]}
              >
                <Icon
                  family={meta.icon.family}
                  name={meta.icon.name}
                  size={13}
                  color={sel ? meta.fg[scheme] : colors.textMuted}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: sel ? meta.fg[scheme] : colors.textSecondary },
                  ]}
                >
                  {catLabel(id)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {t("capture.priority")}
          </Text>
          {focusList.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.input }]}>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                {focusList.length}
              </Text>
            </View>
          )}
        </View>

        {focusList.length === 0 ? (
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
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {focusList.map((n, i) => (
              <Animated.View
                key={n.id}
                layout={LinearTransition.springify().damping(18)}
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(160)}
              >
                <NoteRow
                  note={n}
                  onEdit={openEdit}
                  variant="capture"
                  isLast={i === focusList.length - 1}
                />
              </Animated.View>
            ))}
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
          <View style={styles.btnRow}>
            <Pressable
              testID="derle-button"
              onPress={onDerle}
              style={[
                styles.derleBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.brand,
                },
              ]}
            >
              <Icon
                family="ionicons"
                name="sparkles-outline"
                size={16}
                color={colors.brand}
              />
              <Text style={[styles.derleText, { color: colors.brand }]}>
                {t("capture.derle")}
              </Text>
            </Pressable>
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
                {selectedCat ? ` · ${catLabel(selectedCat)}` : ""}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>

      <DerlePreview
        visible={preview !== null}
        items={preview?.items ?? []}
        mode={preview?.mode ?? "split"}
        onConfirm={onPreviewConfirm}
        onSingle={onPreviewSingle}
        onCancel={() => setPreview(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    height: 44,
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
  chipRow: {
    marginTop: 12,
    flexGrow: 0,
  },
  chipRowContent: {
    gap: 8,
    paddingRight: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13.5,
    fontWeight: "600",
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
  countBadge: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
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
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  derleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    minWidth: 108,
  },
  derleText: {
    fontSize: 15.5,
    fontWeight: "700",
  },
  addBtn: {
    flex: 1,
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
