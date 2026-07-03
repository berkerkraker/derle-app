import { Lang } from "@/src/types";

type Dict = Record<string, string>;

const tr: Dict = {
  appName: "Derle",
  "tab.capture": "Yakala",
  "tab.organize": "Düzen",

  "capture.title": "Aklında ne var?",
  "capture.placeholder": "Aklına ne geldiyse yaz…",
  "capture.priority": "YILDIZLI",
  "capture.emptyTitle": "Yıldızlı not yok",
  "capture.emptySub": "Bir nota yıldız koy — en önemlilerin burada öncelik sırasına göre dizilir.",
  "capture.add": "Ekle",
  "capture.adding": "Düzenleniyor…",
  "capture.addedOne": "Eklendi · {cat}",
  "capture.addedMany": "{n} not eklendi",
  "capture.derle": "Derle",
  "capture.derleFail": "Şu an derlenemedi. Tek not olarak ekleyebilirsin.",

  "preview.title": "Derle önerisi",
  "preview.sub": "Metnin {n} parçaya ayrıldı · onaylamadan kaydedilmez",
  "preview.confirm": "Ekle · {n} not",
  "preview.single": "Tek not olarak ekle",

  "organize.title": "Düzen",
  "organize.completed": "Tamamlananlar",
  "organize.empty": "Henüz düzenlenecek not yok",
  "organize.emptySub": "Yakala ekranından kafanı boşalt; notların burada kategorilere ayrılır.",
  "organize.count": "{n}",

  "settings.title": "Ayarlar",
  "settings.theme": "TEMA",
  "settings.themeSystem": "Sistem",
  "settings.themeLight": "Açık",
  "settings.themeDark": "Koyu",
  "settings.language": "DİL",
  "settings.account": "HESAP",
  "settings.signIn": "Google ile devam et",
  "settings.signInSub": "Notlarını buluta yedekle, cihazlar arası senkronize et.",
  "settings.signOut": "Çıkış yap",
  "settings.backupOn": "Notların Google hesabınla buluta yedekleniyor",
  "settings.syncing": "Senkronize ediliyor…",
  "settings.signInFailed": "Giriş tamamlanamadı. Tekrar dene.",
  "settings.customCategories": "Özel kategoriler",
  "settings.data": "Veri",
  "settings.privacy": "Gizlilik",
  "settings.export": "Notları dışa aktar (kopyala)",
  "settings.import": "Panodan içe aktar",
  "settings.exported": "{n} not panoya kopyalandı",
  "settings.imported": "{n} not içe aktarıldı",
  "settings.importFailed": "İçe aktarılamadı. Geçersiz veri.",
  "settings.deleteAccount": "Hesabı ve verileri sil",
  "settings.clearLocal": "Bu cihazdaki notları sil",
  "settings.privacyPolicy": "Gizlilik Politikası",
  "settings.terms": "Kullanım Koşulları",
  "settings.support": "Destek",
  "settings.version": "Sürüm",
  "settings.addCategory": "Kategori ekle",
  "settings.categoryName": "Kategori adı",
  "settings.noCustom": "Henüz özel kategori yok.",
  "settings.notSignedIn": "Giriş yapılmadı · notlar yalnızca bu cihazda",

  "edit.title": "Notu düzenle",
  "edit.category": "Kategori",
  "edit.priority": "Öncelik",
  "edit.star": "Yıldızla — Yakala ekranında öne çıkar",
  "edit.starred": "Yıldızlı — Yakala ekranında görünüyor",
  "edit.save": "Kaydet",
  "edit.delete": "Sil",
  "edit.deleteConfirm": "Bu not silinsin mi?",
  "edit.deleteConfirmSub": "Bu işlem geri alınamaz.",
  "edit.cancel": "Vazgeç",

  "priority.high": "Acil",
  "priority.medium": "Önemli",
  "priority.low": "Normal",

  "ai.localUsed": "AI'a ulaşılamadı · öneri cihazında hazırlandı",
  "note.done": "Tamamlandı ✓",

  "del.title": "Hesabı sil",
  "del.warn": "Hesabın ve buluttaki tüm notların kalıcı olarak silinir. Bu işlem geri alınamaz.",
  "del.confirm": "Evet, hesabımı ve tüm verilerimi sil",
  "del.deleting": "Siliniyor…",
  "del.done": "Hesabın ve verilerin silindi.",
  "del.failed": "Silme başarısız. İnternet bağlantını kontrol et.",

  "date.today": "Bugün",
  "date.yesterday": "Dün",

  "cat.gorevler": "Yapılacak",
  "cat.fikirler": "Fikirler",
  "cat.kisisel": "Kişisel",
  "cat.alisveris": "Alışveriş",
  "cat.saglik": "Sağlık",
  "cat.para_is": "Para/İş",
  "cat.notlar": "Notlar",

  "welcome.tagline": "Aklındakini yaz, gerisini Derle düşünsün.",
  "welcome.continueGoogle": "Google ile devam et",
  "welcome.skip": "Şimdilik giriş yapmadan devam et",
  "welcome.backupNote": "Notların bu cihazda saklanır. İstersen sonra Ayarlar'dan buluta yedekleyebilirsin.",

  "settings.general": "GENEL",
  "settings.haptics": "Titreşim",
  "settings.hapticsSub": "Dokunuşlarda hafif titreşimli geri bildirim",

  "common.cancel": "Vazgeç",
  "common.close": "Kapat",
  "common.delete": "Sil",
};

const en: Dict = {
  appName: "Derle",
  "tab.capture": "Capture",
  "tab.organize": "Organize",

  "capture.title": "What's on your mind?",
  "capture.placeholder": "Write whatever comes to mind…",
  "capture.priority": "STARRED",
  "capture.emptyTitle": "No starred notes",
  "capture.emptySub": "Star a note — your most important ones line up here by priority.",
  "capture.add": "Add",
  "capture.adding": "Organizing…",
  "capture.addedOne": "Added · {cat}",
  "capture.addedMany": "{n} notes added",
  "capture.derle": "Derle",
  "capture.derleFail": "Couldn't organize right now. You can add it as one note.",

  "preview.title": "Derle suggestion",
  "preview.sub": "Split into {n} parts · nothing is saved until you confirm",
  "preview.confirm": "Add · {n} notes",
  "preview.single": "Add as one note",

  "organize.title": "Organize",
  "organize.completed": "Completed",
  "organize.empty": "No notes to organize yet",
  "organize.emptySub": "Empty your mind from Capture; your notes get grouped here.",
  "organize.count": "{n}",

  "settings.title": "Settings",
  "settings.theme": "THEME",
  "settings.themeSystem": "System",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.language": "LANGUAGE",
  "settings.account": "ACCOUNT",
  "settings.signIn": "Continue with Google",
  "settings.signInSub": "Back up your notes and sync across devices.",
  "settings.signOut": "Sign out",
  "settings.backupOn": "Your notes are backed up with your Google account",
  "settings.syncing": "Syncing…",
  "settings.signInFailed": "Sign-in could not be completed. Try again.",
  "settings.customCategories": "Custom categories",
  "settings.data": "Data",
  "settings.privacy": "Privacy",
  "settings.export": "Export notes (copy)",
  "settings.import": "Import from clipboard",
  "settings.exported": "{n} notes copied to clipboard",
  "settings.imported": "{n} notes imported",
  "settings.importFailed": "Import failed. Invalid data.",
  "settings.deleteAccount": "Delete account & data",
  "settings.clearLocal": "Delete notes on this device",
  "settings.privacyPolicy": "Privacy Policy",
  "settings.terms": "Terms of Use",
  "settings.support": "Support",
  "settings.version": "Version",
  "settings.addCategory": "Add category",
  "settings.categoryName": "Category name",
  "settings.noCustom": "No custom categories yet.",
  "settings.notSignedIn": "Not signed in · notes stay on this device only",

  "edit.title": "Edit note",
  "edit.category": "Category",
  "edit.priority": "Priority",
  "edit.star": "Star — pin to the Capture screen",
  "edit.starred": "Starred — shown on the Capture screen",
  "edit.save": "Save",
  "edit.delete": "Delete",
  "edit.deleteConfirm": "Delete this note?",
  "edit.deleteConfirmSub": "This cannot be undone.",
  "edit.cancel": "Cancel",

  "priority.high": "Urgent",
  "priority.medium": "Important",
  "priority.low": "Normal",

  "ai.localUsed": "AI unavailable · suggestion prepared on your device",
  "note.done": "Done ✓",

  "del.title": "Delete account",
  "del.warn": "Your account and all notes in the cloud are permanently deleted. This cannot be undone.",
  "del.confirm": "Yes, delete my account and all data",
  "del.deleting": "Deleting…",
  "del.done": "Your account and data have been deleted.",
  "del.failed": "Delete failed. Check your connection.",

  "date.today": "Today",
  "date.yesterday": "Yesterday",

  "cat.gorevler": "To-do",
  "cat.fikirler": "Ideas",
  "cat.kisisel": "Personal",
  "cat.alisveris": "Shopping",
  "cat.saglik": "Health",
  "cat.para_is": "Money/Work",
  "cat.notlar": "Notes",

  "welcome.tagline": "Jot down what's on your mind, let Derle organize it.",
  "welcome.continueGoogle": "Continue with Google",
  "welcome.skip": "Continue without signing in",
  "welcome.backupNote": "Notes stay on this device. You can back up to the cloud later from Settings.",

  "settings.general": "GENERAL",
  "settings.haptics": "Haptics",
  "settings.hapticsSub": "Gentle vibration feedback on touch",

  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.delete": "Delete",
};

export const STRINGS: Record<Lang, Dict> = { tr, en };

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  let s = STRINGS[lang][key] ?? STRINGS.tr[key] ?? key;
  if (params) {
    for (const k of Object.keys(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(params[k]));
    }
  }
  return s;
}
