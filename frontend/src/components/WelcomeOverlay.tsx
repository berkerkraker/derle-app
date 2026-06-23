import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import { storage } from "@/src/utils/storage";
import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";
import { useAuth } from "@/src/context/AuthContext";

const ONBOARDED_KEY = "derle.onboarded";

/**
 * First-launch welcome / backup gate. Shown once, only when the user has not
 * onboarded AND is not already signed in. Never blocks note-taking: the user
 * can dismiss with "continue without signing in" and start immediately.
 */
export function WelcomeOverlay() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { token, loading, signInWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  const [checked, setChecked] = useState(false);
  const [onboarded, setOnboarded] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await storage.getItem(ONBOARDED_KEY, "");
      setOnboarded(v === "1");
      setChecked(true);
    })();
  }, []);

  const finish = async () => {
    await storage.setItem(ONBOARDED_KEY, "1");
    setOnboarded(true);
  };

  const onGoogle = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    setSigningIn(false);
    finish();
  };

  if (!checked || loading || token || onboarded) return null;

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: colors.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 },
      ]}
      testID="welcome-overlay"
    >
      <View style={styles.top}>
        <View style={[styles.logo, { backgroundColor: colors.brand }]}>
          <Ionicons name="flash" size={36} color={colors.brandText} />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>{t("appName")}</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {t("welcome.tagline")}
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          testID="welcome-google"
          onPress={onGoogle}
          disabled={signingIn}
          style={[styles.googleBtn, { backgroundColor: colors.brand }]}
        >
          {signingIn ? (
            <ActivityIndicator color={colors.brandText} />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color={colors.brandText} />
              <Text style={[styles.googleText, { color: colors.brandText }]}>
                {t("welcome.continueGoogle")}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable testID="welcome-skip" onPress={finish} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {t("welcome.skip")}
          </Text>
        </Pressable>

        <View style={styles.noteRow}>
          <Feather name="shield" size={13} color={colors.textMuted} />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            {t("welcome.backupNote")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  logo: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 34, fontWeight: "800", letterSpacing: -0.5 },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 12,
  },
  bottom: { gap: 14 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
  },
  googleText: { fontSize: 16, fontWeight: "700" },
  skipBtn: { height: 44, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 15, fontWeight: "600" },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  note: { fontSize: 12.5, textAlign: "center", lineHeight: 18, flexShrink: 1 },
});
