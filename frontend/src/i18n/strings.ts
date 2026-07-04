import { Lang } from "@/src/types";

type Dict = Record<string, string>;

const tr: Dict = {
  appName: "Derle",
  "tab.capture": "Yakala",
  "tab.organize": "Düzen",

  "capture.title": "Aklında ne var?",
  "capture.placeholder": "Aklına ne geldiyse yaz…",
  "capture.priority": "ACİL & ÖNEMLİ",
  "capture.emptyTitle": "Şimdilik sakin",
  "capture.emptySub":
    "Acil veya Önemli olarak işaretlediğin notlar burada öne çıkar; Normal notlar Düzen'de durur.",
  "capture.demoTitle": "Derle'yi dene",
  "capture.demoSub":
    "Aklındakileri alt alta dök, ✨ Derle'ye bas — her satırı yerine koysun.",
  "capture.demoBtn": "Örnekle göster",
  "capture.demoSample":
    "yarın 15:00 dişçi randevusu\nsüt, yumurta, ekmek\nelektrik faturasını öde!!\nfikir: balkona küçük bahçe",
  "capture.add": "Ekle",
  "capture.addedOne": "Eklendi · {cat}",
  "capture.addedMany": "{n} not eklendi",
  "capture.derle": "Derle",
  "capture.derleFail": "Şu an derlenemedi. Tek not olarak ekleyebilirsin.",
  "capture.tidyNone": "Taşınacak not yok — her şey yerli yerinde ✨",
  "capture.tidied": "{n} not kategorisine taşındı",

  "preview.title": "Derle önerisi",
  "preview.sub": "Metnin {n} parçaya ayrıldı · onaylamadan kaydedilmez",
  "preview.confirm": "Ekle · {n} not",
  "preview.single": "Tek not olarak ekle",
  "preview.tidyTitle": "Derle · Toparla",
  "preview.tidySub":
    "Notlar'da bekleyen {n} not kategorisine taşınacak · onaylamadan değişmez",
  "preview.tidyConfirm": "Taşı · {n} not",

  "organize.title": "Düzen",
  "organize.completed": "Tamamlananlar",
  "organize.empty": "Henüz düzenlenecek not yok",
  "organize.emptySub": "Yakala ekranından kafanı boşalt; notların burada kategorilere ayrılır.",
  "organize.search": "Notlarda ara…",
  "organize.noResults": "Eşleşen not yok",

  "settings.title": "Ayarlar",
  "settings.secLook": "GÖRÜNÜM",
  "settings.rowTheme": "Tema",
  "settings.rowLang": "Dil / Language",
  "settings.themeSystem": "Sistem",
  "settings.themeLight": "Açık",
  "settings.themeDark": "Koyu",
  "settings.language": "DİL",
  "settings.haptics": "Titreşim",
  "settings.secCats": "KATEGORİLER",
  "settings.secBackup": "YEDEK",
  "settings.secData": "VERİ",
  "settings.secAbout": "HAKKINDA",
  "settings.export": "Yedeği paylaş / kaydet",
  "settings.copy": "Panoya kopyala",
  "settings.import": "Panodan içe aktar",
  "settings.exported": "{n} not panoya kopyalandı",
  "settings.imported": "{n} not içe aktarıldı",
  "settings.importFailed": "İçe aktarılamadı. Geçersiz veri.",
  "settings.clearLocal": "Bu cihazdaki notları sil",
  "settings.clearConfirm": "Emin misin? Tüm notlar silinir",
  "settings.cleared": "Tüm notlar silindi",
  "settings.localInfo":
    "Notların yalnızca bu cihazda durur; hesap ve bulut yoktur. Cihaz değiştirirken yedeği paylaş, yeni cihazda panodan içe aktar.",
  "settings.privacyPolicy": "Gizlilik Politikası",
  "settings.terms": "Kullanım Koşulları",
  "settings.support": "Destek",
  "settings.version": "Sürüm",
  "settings.addCategory": "Kategori ekle",
  "settings.categoryName": "Kategori adı",
  "settings.noCustom": "Henüz özel kategori yok.",

  "edit.title": "Notu düzenle",
  "edit.category": "Kategori",
  "edit.priority": "Öncelik",
  "edit.save": "Kaydet",
  "edit.delete": "Sil",
  "edit.deleteConfirm": "Bu not silinsin mi?",
  "edit.deleteConfirmSub": "Bu işlem geri alınamaz.",
  "edit.cancel": "Vazgeç",

  "priority.high": "Acil",
  "priority.medium": "Önemli",
  "priority.low": "Normal",

  "note.done": "Tamamlandı ✓",
  "note.deleted": "Not silindi",

  "date.today": "Bugün",
  "date.yesterday": "Dün",

  "cat.gorevler": "Yapılacak",
  "cat.fikirler": "Fikirler",
  "cat.kisisel": "Kişisel",
  "cat.alisveris": "Alışveriş",
  "cat.saglik": "Sağlık",
  "cat.para_is": "Para/İş",
  "cat.notlar": "Notlar",

  "common.cancel": "Vazgeç",
  "common.close": "Kapat",
  "common.delete": "Sil",
  "common.undo": "Geri al",
};

const en: Dict = {
  appName: "Derle",
  "tab.capture": "Capture",
  "tab.organize": "Organize",

  "capture.title": "What's on your mind?",
  "capture.placeholder": "Write whatever comes to mind…",
  "capture.priority": "URGENT & IMPORTANT",
  "capture.emptyTitle": "All calm for now",
  "capture.emptySub":
    "Notes you mark Urgent or Important surface here; Normal notes live in Organize.",
  "capture.demoTitle": "Try Derle",
  "capture.demoSub":
    "Dump your thoughts line by line, tap ✨ Derle — it files each one for you.",
  "capture.demoBtn": "Show me an example",
  "capture.demoSample":
    "dentist tomorrow 15:00\nmilk, eggs, bread\npay the electricity bill!!\nidea: small balcony garden",
  "capture.add": "Add",
  "capture.addedOne": "Added · {cat}",
  "capture.addedMany": "{n} notes added",
  "capture.derle": "Derle",
  "capture.derleFail": "Couldn't organize right now. You can add it as one note.",
  "capture.tidyNone": "Nothing to move — everything is in its place ✨",
  "capture.tidied": "{n} notes moved to their categories",

  "preview.title": "Derle suggestion",
  "preview.sub": "Split into {n} parts · nothing is saved until you confirm",
  "preview.confirm": "Add · {n} notes",
  "preview.single": "Add as one note",
  "preview.tidyTitle": "Derle · Tidy up",
  "preview.tidySub":
    "{n} notes waiting in Notes will move to their categories · nothing changes until you confirm",
  "preview.tidyConfirm": "Move · {n} notes",

  "organize.title": "Organize",
  "organize.completed": "Completed",
  "organize.empty": "No notes to organize yet",
  "organize.emptySub": "Empty your mind from Capture; your notes get grouped here.",
  "organize.search": "Search notes…",
  "organize.noResults": "No matching notes",

  "settings.title": "Settings",
  "settings.secLook": "APPEARANCE",
  "settings.rowTheme": "Theme",
  "settings.rowLang": "Language",
  "settings.themeSystem": "System",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.language": "LANGUAGE",
  "settings.haptics": "Haptics",
  "settings.secCats": "CATEGORIES",
  "settings.secBackup": "BACKUP",
  "settings.secData": "DATA",
  "settings.secAbout": "ABOUT",
  "settings.export": "Share / save backup",
  "settings.copy": "Copy to clipboard",
  "settings.import": "Import from clipboard",
  "settings.exported": "{n} notes copied to clipboard",
  "settings.imported": "{n} notes imported",
  "settings.importFailed": "Import failed. Invalid data.",
  "settings.clearLocal": "Delete notes on this device",
  "settings.clearConfirm": "Are you sure? All notes will be deleted",
  "settings.cleared": "All notes deleted",
  "settings.localInfo":
    "Your notes live only on this device; there is no account or cloud. To move devices, share a backup and import it from the clipboard on the new one.",
  "settings.privacyPolicy": "Privacy Policy",
  "settings.terms": "Terms of Use",
  "settings.support": "Support",
  "settings.version": "Version",
  "settings.addCategory": "Add category",
  "settings.categoryName": "Category name",
  "settings.noCustom": "No custom categories yet.",

  "edit.title": "Edit note",
  "edit.category": "Category",
  "edit.priority": "Priority",
  "edit.save": "Save",
  "edit.delete": "Delete",
  "edit.deleteConfirm": "Delete this note?",
  "edit.deleteConfirmSub": "This cannot be undone.",
  "edit.cancel": "Cancel",

  "priority.high": "Urgent",
  "priority.medium": "Important",
  "priority.low": "Normal",

  "note.done": "Done ✓",
  "note.deleted": "Note deleted",

  "date.today": "Today",
  "date.yesterday": "Yesterday",

  "cat.gorevler": "To-do",
  "cat.fikirler": "Ideas",
  "cat.kisisel": "Personal",
  "cat.alisveris": "Shopping",
  "cat.saglik": "Health",
  "cat.para_is": "Money/Work",
  "cat.notlar": "Notes",

  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.delete": "Delete",
  "common.undo": "Undo",
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
