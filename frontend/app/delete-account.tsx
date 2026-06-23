import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useAuth } from "@/src/context/AuthContext";
import { useNotes } from "@/src/context/NotesContext";
import { useToast } from "@/src/components/Toast";
import { haptics } from "@/src/lib/haptics";

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, deleteAccount } = useAuth();
  const { clearLocal } = useNotes();
  const { show } = useToast();

  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    const ok = await deleteAccount();
    if (ok) clearLocal();
    setBusy(false);
    if (ok) {
      haptics.warning();
      show(t("del.done"));
      router.back();
    } else {
      show(t("del.failed"));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable
          testID="delete-back"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.gear, { backgroundColor: colors.card }]}
        >
          <Feather name="chevron-left" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{t("del.title")}</Text>
        <View style={styles.gear} />
      </View>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
          <Feather name="alert-triangle" size={30} color={colors.danger} />
        </View>
        <Text style={[styles.warn, { color: colors.textSecondary }]}>{t("del.warn")}</Text>

        {user ? (
          <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
        ) : (
          <Text style={[styles.email, { color: colors.textMuted }]}>
            {t("settings.notSignedIn")}
          </Text>
        )}

        <Pressable
          testID="confirm-delete-account"
          onPress={onDelete}
          disabled={busy}
          style={[
            styles.deleteBtn,
            { backgroundColor: confirm ? colors.danger : colors.dangerSoft },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[styles.deleteText, { color: confirm ? "#FFFFFF" : colors.danger }]}
            >
              {confirm ? t("del.confirm") : t("settings.deleteAccount")}
            </Text>
          )}
        </Pressable>

        <Pressable testID="cancel-delete" onPress={() => router.back()} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            {t("common.cancel")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: { flex: 1, fontSize: 20, fontWeight: "700", textAlign: "center" },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: 24, alignItems: "center", paddingTop: 30, gap: 18 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  warn: { fontSize: 16, lineHeight: 23, textAlign: "center" },
  email: { fontSize: 14, fontWeight: "600" },
  deleteBtn: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  deleteText: { fontSize: 16, fontWeight: "700" },
  cancel: { padding: 12 },
  cancelText: { fontSize: 15, fontWeight: "600" },
});
