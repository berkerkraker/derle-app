import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Switch,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Clipboard from "expo-clipboard";

import { Icon } from "@/src/components/Icon";
import { SegmentedControl } from "@/src/components/SegmentedControl";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useNotes } from "@/src/context/NotesContext";
import { useToast } from "@/src/components/Toast";
import { storage } from "@/src/utils/storage";
import { haptics, setHapticsEnabled } from "@/src/lib/haptics";
import { CUSTOM_COLOR_CHOICES } from "@/src/constants/categories";
import Constants from "expo-constants";

const HAPTICS_KEY = "derle.haptics";

type SectionKey = "cats" | "data" | "about" | null;

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    customCategories,
    addCustomCategory,
    removeCustomCategory,
    exportJSON,
    importJSON,
    clearLocal,
  } = useNotes();
  const { show } = useToast();

  const [open, setOpen] = useState<SectionKey>(null);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(CUSTOM_COLOR_CHOICES[0]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    storage.getItem<string>(HAPTICS_KEY, "1").then((v) => setHapticsOn(v !== "0"));
  }, []);

  // bölüm kapanınca yarım kalmış silme onayı sıfırlanır
  useEffect(() => {
    if (open !== "data") setConfirmClear(false);
  }, [open]);

  const onToggleHaptics = (v: boolean) => {
    setHapticsOn(v);
    setHapticsEnabled(v);
    storage.setItem(HAPTICS_KEY, v ? "1" : "0");
    if (v) haptics.light();
  };

  const toggle = (k: SectionKey) => {
    setOpen((cur) => (cur === k ? null : k));
  };

  // Dışa aktarma paylaşım sayfasından: kullanıcı Drive/e-posta/dosya seçer.
  const onExport = async () => {
    const json = exportJSON();
    try {
      await Share.share({ title: "Derle yedek", message: json });
    } catch {
      /* kullanıcı vazgeçti */
    }
  };

  const onCopy = async () => {
    const json = exportJSON();
    await Clipboard.setStringAsync(json);
    let count = 0;
    try {
      count = JSON.parse(json).length;
    } catch {
      count = 0;
    }
    show(t("settings.exported", { n: count }));
  };

  const onImport = async () => {
    try {
      const raw = await Clipboard.getStringAsync();
      const added = importJSON(raw);
      show(t("settings.imported", { n: added }));
    } catch {
      show(t("settings.importFailed"));
    }
  };

  const onClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearLocal();
    setConfirmClear(false);
    haptics.warning();
    show(t("settings.cleared"));
  };

  const onAddCat = () => {
    if (!catName.trim()) return;
    addCustomCategory(catName.trim(), catColor);
    setCatName("");
    setCatColor(CUSTOM_COLOR_CHOICES[0]);
    haptics.success();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("settings.title")}</Text>
        <Pressable
          testID="settings-close"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.gear, { backgroundColor: colors.card }]}
        >
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        {/* TEMA */}
        <Text style={[styles.label, { color: colors.textMuted }]}>{t("settings.theme")}</Text>
        <SegmentedControl
          testIDPrefix="theme"
          value={mode}
          onChange={(v) => setMode(v as any)}
          options={[
            { label: t("settings.themeSystem"), value: "system" },
            { label: t("settings.themeLight"), value: "light" },
            { label: t("settings.themeDark"), value: "dark" },
          ]}
        />

        {/* DİL + Titreşim */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 14 }]}>
          <View style={styles.compactRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("settings.language")} / Language
            </Text>
            <View style={styles.langToggle}>
              {(["tr", "en"] as const).map((v) => (
                <Pressable
                  key={v}
                  testID={`lang-${v}`}
                  onPress={() => setLang(v)}
                  style={[
                    styles.langPill,
                    {
                      backgroundColor:
                        lang === v ? colors.brand : colors.input,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      {
                        color:
                          lang === v ? colors.brandText : colors.textSecondary,
                      },
                    ]}
                  >
                    {v === "tr" ? "TR" : "EN"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Titreşim: önemli bir ayar değil — dil satırının altında sessiz bir satır */}
          <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.compactRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("settings.haptics")}
            </Text>
            <Switch
              testID="haptics-toggle"
              value={hapticsOn}
              onValueChange={onToggleHaptics}
              trackColor={{ false: colors.input, true: colors.brand }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={{ height: 22 }} />

        {/* ÖZEL KATEGORİLER */}
        <CollapsibleCard
          colors={colors}
          iconFamily="feather"
          iconName="tag"
          title={t("settings.customCategories")}
          open={open === "cats"}
          onToggle={() => toggle("cats")}
          testID="section-cats"
        >
          {customCategories.length === 0 ? (
            <Text style={[styles.subText, { color: colors.textMuted }]}>
              {t("settings.noCustom")}
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {customCategories.map((c) => (
                <View key={c.id} style={styles.customRow}>
                  <View style={[styles.dot, { backgroundColor: c.color }]} />
                  <Text style={[styles.customLabel, { color: colors.text }]} numberOfLines={1}>
                    {c.label}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      haptics.warning();
                      removeCustomCategory(c.id);
                    }}
                    testID={`remove-cat-${c.id}`}
                  >
                    <Feather name="trash-2" size={17} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={styles.addCatWrap}>
            <TextInput
              testID="custom-cat-input"
              value={catName}
              onChangeText={setCatName}
              placeholder={t("settings.categoryName")}
              placeholderTextColor={colors.textMuted}
              style={[styles.catInput, { backgroundColor: colors.input, color: colors.inputText }]}
            />
            <View style={styles.colorRow}>
              {CUSTOM_COLOR_CHOICES.map((c) => (
                <Pressable
                  key={c}
                  testID={`cat-color-${c}`}
                  onPress={() => {
                    haptics.selection();
                    setCatColor(c);
                  }}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c,
                      borderColor: catColor === c ? colors.text : "transparent",
                    },
                  ]}
                />
              ))}
            </View>
            <Pressable
              testID="add-cat-button"
              onPress={onAddCat}
              style={[styles.smallBtn, { backgroundColor: colors.brand }]}
            >
              <Feather name="plus" size={16} color={colors.brandText} />
              <Text style={[styles.smallBtnText, { color: colors.brandText }]}>
                {t("settings.addCategory")}
              </Text>
            </Pressable>
          </View>
        </CollapsibleCard>

        {/* YEDEK & VERİ */}
        <CollapsibleCard
          colors={colors}
          iconFamily="feather"
          iconName="database"
          title={t("settings.data")}
          open={open === "data"}
          onToggle={() => toggle("data")}
          testID="section-data"
        >
          <ActionRow icon="share" label={t("settings.export")} onPress={onExport} colors={colors} testID="export-notes" />
          <ActionRow icon="copy" label={t("settings.copy")} onPress={onCopy} colors={colors} testID="copy-notes" />
          <ActionRow icon="download" label={t("settings.import")} onPress={onImport} colors={colors} testID="import-notes" />
          <ActionRow
            icon="trash-2"
            label={confirmClear ? t("settings.clearConfirm") : t("settings.clearLocal")}
            onPress={onClear}
            colors={colors}
            danger
            testID="clear-local"
          />
          <Text style={[styles.subText, { color: colors.textMuted, marginTop: 6 }]}>
            {t("settings.localInfo")}
          </Text>
        </CollapsibleCard>

        {/* GİZLİLİK & HAKKINDA */}
        <CollapsibleCard
          colors={colors}
          iconFamily="feather"
          iconName="lock"
          title={t("settings.privacy")}
          open={open === "about"}
          onToggle={() => toggle("about")}
          testID="section-privacy"
        >
          <ActionRow
            icon="shield"
            label={t("settings.privacyPolicy")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "privacy" } })}
            colors={colors}
            testID="open-privacy"
          />
          <ActionRow
            icon="file-text"
            label={t("settings.terms")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "terms" } })}
            colors={colors}
            testID="open-terms"
          />
          <ActionRow
            icon="help-circle"
            label={t("settings.support")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "support" } })}
            colors={colors}
            testID="open-support"
          />
        </CollapsibleCard>

        <Text style={[styles.version, { color: colors.textMuted }]}>
          {t("settings.version")} {Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}

function CollapsibleCard({
  colors,
  iconFamily,
  iconName,
  title,
  open,
  onToggle,
  children,
  testID,
}: any) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginBottom: 12 }]}>
      <Pressable style={styles.collapseHeader} onPress={onToggle} testID={testID}>
        <Icon family={iconFamily} name={iconName} size={19} color={colors.textSecondary} />
        <Text style={[styles.collapseTitle, { color: colors.text }]}>{title}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
      </Pressable>
      {open && <View style={styles.collapseBody}>{children}</View>}
    </View>
  );
}

function ActionRow({ icon, label, onPress, colors, danger, testID }: any) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress} testID={testID}>
      <Feather name={icon} size={18} color={danger ? colors.danger : colors.textSecondary} />
      <Text style={[styles.actionLabel, { color: danger ? colors.danger : colors.text }]}>
        {label}
      </Text>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 13,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  langToggle: {
    flexDirection: "row",
    gap: 6,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  subText: { fontSize: 13.5, lineHeight: 19 },
  collapseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  collapseTitle: { flex: 1, fontSize: 17, fontWeight: "600" },
  collapseBody: {
    marginTop: 14,
    gap: 6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  actionLabel: { flex: 1, fontSize: 15.5, fontWeight: "500" },
  customRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  customLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  addCatWrap: { marginTop: 10, gap: 10 },
  catInput: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 12,
  },
  smallBtnText: { fontSize: 15, fontWeight: "700" },
  version: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 18,
  },
});
