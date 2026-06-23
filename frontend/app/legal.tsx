import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useI18n } from "@/src/i18n/I18nContext";

const CONTENT: Record<string, { tr: { title: string; body: string }; en: { title: string; body: string } }> = {
  privacy: {
    tr: {
      title: "Gizlilik Politikası",
      body: `Derle, notlarını düzenlemen için tasarlanmış bir uygulamadır. Gizliliğine önem veriyoruz.

TOPLANAN VERİLER
• Notların: Yazdığın notlar cihazında saklanır. Google ile giriş yaparsan, yedekleme ve senkronizasyon için notların sana özel olarak güvenli bir sunucu veritabanında tutulur.
• Hesap bilgisi: Google ile giriş yaparsan yalnızca e-posta adresin, adın ve profil resmin kimlik doğrulama amacıyla alınır. Notların Gmail'e veya Google hizmetlerine kaydedilmez.

YAPAY ZEKA
• Bir not eklediğinde, metni düzenlemek (yazım düzeltme ve uygun kategoriye ayırma) için güvenli sunucumuza gönderilir; sunucu bu metni OpenAI API'sine iletir. Metin yalnızca bu işlem için kullanılır, reklam için kullanılmaz. Yapay zeka kullanılamazsa not cihazında düzenlenir ve asla kaybolmaz.

VERİLERİN PAYLAŞIMI
• Verilerin üçüncü taraflara satılmaz. Yalnızca yukarıda belirtilen işlevler için kullanılır.

VERİLERİN SİLİNMESİ
• Uygulama içinden "Hesabı ve verileri sil" seçeneğiyle hesabını ve buluttaki tüm notlarını kalıcı olarak silebilirsin.

İLETİŞİM
• support@yamanlabs.app
• https://yamanlabs.app/privacy`,
    },
    en: {
      title: "Privacy Policy",
      body: `Derle is an app designed to help you organize your notes. We care about your privacy.

DATA WE COLLECT
• Your notes: Notes are stored on your device. If you sign in with Google, your notes are kept privately in a secure server database for backup and sync.
• Account info: If you sign in with Google, we only use your email, name and profile picture for authentication. Your notes are NOT saved to Gmail or Google services.

AI
• When you add a note, the text is sent to our secure server to be tidied (spelling fixes and category sorting); the server forwards it to the OpenAI API. The text is used only for this purpose, never for ads. If AI is unavailable, the note is organized on your device and is never lost.

DATA SHARING
• Your data is never sold to third parties. It is used only for the features described above.

DATA DELETION
• You can permanently delete your account and all cloud notes from inside the app via "Delete account & data".

CONTACT
• support@yamanlabs.app
• https://yamanlabs.app/privacy`,
    },
  },
  terms: {
    tr: {
      title: "Kullanım Koşulları",
      body: `Derle'yi kullanarak aşağıdaki koşulları kabul edersin.

• Derle kişisel not alma amaçlıdır. Uygulamayı yasalara uygun şekilde kullanmalısın.
• Notlarının içeriğinden sen sorumlusun.
• Uygulama "olduğu gibi" sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez.
• Yapay zeka özelliği yardımcı niteliktedir; sonuçların doğruluğu garanti edilmez.
• Bu koşullar zaman zaman güncellenebilir.

İletişim: support@yamanlabs.app`,
    },
    en: {
      title: "Terms of Use",
      body: `By using Derle you accept the following terms.

• Derle is intended for personal note-taking. You must use it lawfully.
• You are responsible for the content of your notes.
• The app is provided "as is"; we do not guarantee uninterrupted or error-free operation.
• The AI feature is assistive; the accuracy of results is not guaranteed.
• These terms may be updated from time to time.

Contact: support@yamanlabs.app`,
    },
  },
  support: {
    tr: {
      title: "Destek",
      body: `Sorularını, geri bildirimlerini ve hata bildirimlerini bekliyoruz.

E-posta: support@yamanlabs.app
Web: https://yamanlabs.app/support

Sık sorulanlar:
• Notlarım nerede saklanıyor? Cihazında; Google ile giriş yaparsan ayrıca buluta yedeklenir.
• İnternet yokken çalışır mı? Evet, çevrimdışı çalışır; internet gelince senkronize olur.
• Yapay zeka çalışmazsa? Notun yine kaydolur, cihazında düzenlenir.`,
    },
    en: {
      title: "Support",
      body: `We welcome your questions, feedback and bug reports.

Email: support@yamanlabs.app
Web: https://yamanlabs.app/support

FAQ:
• Where are my notes stored? On your device; if you sign in with Google they are also backed up to the cloud.
• Does it work offline? Yes, it works offline and syncs when you reconnect.
• What if AI fails? Your note is still saved and organized on your device.`,
    },
  },
};

export default function LegalScreen() {
  const { colors } = useTheme();
  const { lang } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc?: string }>();

  const key = doc && CONTENT[doc] ? doc : "privacy";
  const data = CONTENT[key][lang];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable
          testID="legal-back"
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.gear, { backgroundColor: colors.card }]}
        >
          <Feather name="chevron-left" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {data.title}
        </Text>
        <View style={styles.gear} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.body, { color: colors.textSecondary }]}>{data.body}</Text>
      </ScrollView>
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
  body: { fontSize: 15, lineHeight: 23 },
});
