import React, { useEffect, useState } from "react";
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

  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(CUSTOM_COLOR_CHOICES[0]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    storage.getItem<string>(HAPTICS_KEY, "1").then((v) => setHapticsOn(v !== "0"));
  }, []);

  // Silme onayı askıda kalmasın: birkaç saniye içinde ikinci dokunuş gelmezse sıfırla.
  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const onToggleHaptics = (v: boolean) => {
    setHapticsOn(v);
    setHapticsEnabled(v);
    storage.setItem(HAPTICS_KEY, v ? "1" : "0");
    if (v) haptics.light();
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
      haptics.warning();
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
        {/* GÖRÜNÜM */}
        <SectionLabel colors={colors} text={t("settings.secLook")} first />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 10 }]}>
            {t("settings.rowTheme")}
          </Text>
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

          <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.compactRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("settings.rowLang")}
            </Text>
            <View style={styles.langToggle}>
              {(["tr", "en"] as const).map((v) => (
                <Pressable
                  key={v}
                  testID={`lang-${v}`}
                  onPress={() => setLang(v)}
                  style={[
                    styles.langPill,
                    { backgroundColor: lang === v ? colors.brand : colors.input },
                  ]}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      { color: lang === v ? colors.brandText : colors.textSecondary },
                    ]}
                  >
                    {v === "tr" ? "TR" : "EN"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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

        {/* KATEGORİLER */}
        <SectionLabel colors={colors} text={t("settings.secCats")} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
        </View>

        {/* YEDEK */}
        <SectionLabel colors={colors} text={t("settings.secBackup")} />
        <View style={[styles.card, styles.cardTight, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ActionRow icon="share" label={t("settings.export")} onPress={onExport} colors={colors} testID="export-notes" />
          <RowDivider colors={colors} />
          <ActionRow icon="copy" label={t("settings.copy")} onPress={onCopy} colors={colors} testID="copy-notes" />
          <RowDivider colors={colors} />
          <ActionRow icon="download" label={t("settings.import")} onPress={onImport} colors={colors} testID="import-notes" />
        </View>
        <Text style={[styles.caption, { color: colors.textMuted }]}>
          {t("settings.localInfo")}
        </Text>

        {/* VERİ */}
        <SectionLabel colors={colors} text={t("settings.secData")} />
        <View style={[styles.card, styles.cardTight, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ActionRow
            icon="trash-2"
            label={confirmClear ? t("settings.clearConfirm") : t("settings.clearLocal")}
            onPress={onClear}
            colors={colors}
            danger
            testID="clear-local"
          />
        </View>

        {/* HAKKINDA */}
        <SectionLabel colors={colors} text={t("settings.secAbout")} />
        <View style={[styles.card, styles.cardTight, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ActionRow
            icon="shield"
            label={t("settings.privacyPolicy")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "privacy" } })}
            colors={colors}
            chevron
            testID="open-privacy"
          />
          <RowDivider colors={colors} />
          <ActionRow
            icon="file-text"
            label={t("settings.terms")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "terms" } })}
            colors={colors}
            chevron
            testID="open-terms"
          />
          <RowDivider colors={colors} />
          <ActionRow
            icon="help-circle"
            label={t("settings.support")}
            onPress={() => router.push({ pathname: "/legal", params: { doc: "support" } })}
            colors={colors}
            chevron
            testID="open-support"
          />
          <RowDivider colors={colors} />
          <View style={styles.actionRow}>
            <IconTile icon="info" colors={colors} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              {t("settings.version")}
            </Text>
            <Text style={[styles.rowValue, { color: colors.textMuted }]}>
              {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function SectionLabel({ colors, text, first }: any) {
  return (
    <Text
      style={[
        styles.sectionLabel,
        { color: colors.textMuted, marginTop: first ? 4 : 26 },
      ]}
    >
      {text}
    </Text>
  );
}

function IconTile({ icon, colors, danger }: any) {
  return (
    <View
      style={[
        styles.iconTile,
        { backgroundColor: danger ? colors.danger + "1A" : colors.input },
      ]}
    >
      <Feather
        name={icon}
        size={15}
        color={danger ? colors.danger : colors.textSecondary}
      />
    </View>
  );
}

function RowDivider({ colors }: any) {
  return (
    <View
      style={[styles.rowDivider, { backgroundColor: colors.divider }]}
    />
  );
}

function ActionRow({ icon, label, onPress, colors, danger, chevron, testID }: any) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.55 }]}
      onPress={onPress}
      testID={testID}
    >
      <IconTile icon={icon} colors={colors} danger={danger} />
      <Text style={[styles.actionLabel, { color: danger ? colors.danger : colors.text }]}>
        {label}
      </Text>
      {chevron && <Feather name="chevron-right" size={18} color={colors.textMuted} />}
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  cardTight: {
    paddingVertical: 4,
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
  rowValue: {
    fontSize: 14.5,
    fontWeight: "500",
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
  caption: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 8,
    marginHorizontal: 6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  actionLabel: { flex: 1, fontSize: 15.5, fontWeight: "500" },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
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
});
