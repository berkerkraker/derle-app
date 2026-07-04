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
      body: `Derle, aklındakileri hızla not alıp düzenlemen için tasarlandı. Gizlilik ilkemiz basit: verin bizde değil, sende.

TOPLANAN VERİLER
• Hiçbir veri toplamıyoruz. Derle hesap istemez, sunucuya bağlanmaz, analitik veya reklam kimliği kullanmaz.
• Notların yalnızca cihazının uygulama deposunda saklanır.

DERLE MOTORU
• "Derle" özelliği tamamen cihazında çalışır; metnin internete gönderilmez. İnternet yokken de aynı şekilde çalışır.

YEDEKLEME
• Android, uygulama verini cihaz yedeğine (Google hesabındaki standart cihaz yedeklemesi) dahil edebilir. Bu yedek Google'ın sistemidir; bizim erişimimiz yoktur.
• Ayarlar'dan notlarını istediğin an dosya olarak dışa aktarabilirsin.

VERİLERİN SİLİNMESİ
• Ayarlar → "Bu cihazdaki notları sil" ile tüm notlarını silebilirsin. Uygulamayı kaldırmak da tüm veriyi kaldırır.

İLETİŞİM
• m.canyaman1241@gmail.com
• https://berkerkraker.github.io/derle-app/privacy.html`,
    },
    en: {
      title: "Privacy Policy",
      body: `Derle is designed for quickly capturing and organizing what's on your mind. Our privacy principle is simple: your data stays with you, not with us.

DATA WE COLLECT
• We collect nothing. Derle requires no account, connects to no server, and uses no analytics or advertising identifiers.
• Your notes are stored only in the app storage on your device.

THE DERLE ENGINE
• The "Derle" feature runs entirely on your device; your text is never sent to the internet. It works the same offline.

BACKUP
• Android may include app data in your device backup (the standard device backup on your Google account). That backup belongs to Google's system; we have no access to it.
• You can export your notes as a file anytime from Settings.

DATA DELETION
• Settings → "Delete notes on this device" removes all your notes. Uninstalling the app also removes all data.

CONTACT
• m.canyaman1241@gmail.com
• https://berkerkraker.github.io/derle-app/privacy.html`,
    },
  },
  terms: {
    tr: {
      title: "Kullanım Koşulları",
      body: `Derle'yi kullanarak aşağıdaki koşulları kabul edersin.

• Derle kişisel not alma amaçlıdır. Uygulamayı yasalara uygun şekilde kullanmalısın.
• Notlarının içeriğinden sen sorumlusun.
• Uygulama "olduğu gibi" sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez.
• Derle motoru yardımcı niteliktedir; kategori ve öncelik önerilerinin doğruluğu garanti edilmez.
• Notlar cihazında saklanır; cihazın kaybı/sıfırlanması durumunda yedeğin yoksa notlar geri getirilemez.
• Bu koşullar zaman zaman güncellenebilir.

İletişim: m.canyaman1241@gmail.com`,
    },
    en: {
      title: "Terms of Use",
      body: `By using Derle you accept the following terms.

• Derle is intended for personal note-taking. You must use it lawfully.
• You are responsible for the content of your notes.
• The app is provided "as is"; we do not guarantee uninterrupted or error-free operation.
• The Derle engine is assistive; the accuracy of category and priority suggestions is not guaranteed.
• Notes are stored on your device; if the device is lost or reset and you have no backup, notes cannot be recovered.
• These terms may be updated from time to time.

Contact: m.canyaman1241@gmail.com`,
    },
  },
  support: {
    tr: {
      title: "Destek",
      body: `Sorularını, geri bildirimlerini ve hata bildirimlerini bekliyoruz.

E-posta: m.canyaman1241@gmail.com
Web: https://berkerkraker.github.io/derle-app/destek.html

Sık sorulanlar:
• Notlarım nerede saklanıyor? Yalnızca cihazında. Hesap ve bulut yoktur.
• İnternet yokken çalışır mı? Evet — Derle tamamen çevrimdışı çalışır.
• Telefon değiştirirsem? Ayarlar → "Yedeği paylaş / kaydet" ile yedeğini al; yeni cihazda "Panodan içe aktar" ile geri yükle.
• Derle butonu ne yapar? Metin varken yazdıklarını ayrı notlara böler ve kategorilere dağıtır; kutu boşken Notlar'da bekleyenleri toparlamayı önerir. Onay vermeden hiçbir şey değişmez.`,
    },
    en: {
      title: "Support",
      body: `We welcome your questions, feedback and bug reports.

Email: m.canyaman1241@gmail.com
Web: https://berkerkraker.github.io/derle-app/destek.html

FAQ:
• Where are my notes stored? Only on your device. There is no account or cloud.
• Does it work offline? Yes — Derle works fully offline.
• Switching phones? Settings → "Share / save backup" to export; restore with "Import from clipboard" on the new device.
• What does the Derle button do? With text, it splits what you wrote into separate notes and files them into categories; with the box empty, it offers to tidy notes waiting in Notes. Nothing changes until you confirm.`,
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
