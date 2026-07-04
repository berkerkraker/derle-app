import { Note, OrganizedItem, Priority, Lang } from "@/src/types";

// Derle Zekâsı — tamamen cihazda çalışan sınıflandırıcı.
// Kullanıcının kelimelerini ASLA değiştirmez: yalnızca açıkça ayrı satırları
// böler, kategori ve öncelik etiketi önerir. Hiçbir metin cihazdan çıkmaz.
// En kötü ihtimalle metnin tamamını tek "notlar" notu olarak döndürür.
//
// Eşleştirme üç seviyede çalışır (yanlış pozitifleri azaltmak için):
//   phrases — çok kelimeli kalıplar, alt-dizi olarak aranır ("son tarih")
//   stems   — ≥4 harfli kökler, kelime başından eşleşir (doktor → doktora)
//   exact   — kısa/riskli kelimeler, yalnızca tam kelime ("al", "ara", "su")

interface Rule {
  phrases?: string[];
  stems?: string[];
  exact?: string[];
}

const RULES: Record<string, Rule> = {
  saglik: {
    phrases: ["göz muayene", "kan tahlili", "check up", "check-up"],
    stems: [
      "doktor", "hastane", "sağlık", "saglik", "eczane", "ilaç", "ilac",
      "vitamin", "takviye", "tahlil", "tansiyon", "şurup", "surup", "ağrı",
      "agri", "krem", "tedavi", "klinik", "muayene", "dişçi", "disci",
      "randevu", "terapi", "psikolog", "egzersiz", "antrenman", "reçete",
      "recete", "health", "doctor", "dentist", "medicine", "clinic",
      "pill", "supplement", "workout", "therapy",
    ],
    exact: ["diş", "dis", "aşı", "asi", "hap", "spor", "gym"],
  },
  para_is: {
    phrases: ["iş görüşmesi", "is gorusmesi", "para çek", "para cek", "para yatır", "para yatir"],
    stems: [
      "fatura", "ödeme", "odeme", "banka", "kredi", "taksit", "borç", "borc",
      "maaş", "maas", "vergi", "kiray", "bütçe", "butce", "dekont", "havale",
      "iban", "dolar", "euro", "sigorta", "abonelik", "toplantı", "toplanti",
      "müşteri", "musteri", "proje", "rapor", "sunum", "mülakat", "mulakat",
      "patron", "şirket", "sirket", "ofis", "mesai", "satış", "satis",
      "invoice", "salary", "bank", "meeting", "client", "tax", "rent",
      "budget", "report", "interview", "office", "business", "money",
    ],
    exact: ["iş", "para", "lira", "tl", "cv", "zam", "kira", "work"],
  },
  alisveris: {
    phrases: [
      "satın al", "satin al", "tuvalet kağıdı", "tuvalet kagidi",
      "zeytin yağı", "zeytin yagi", "sipariş ver", "siparis ver",
    ],
    stems: [
      "market", "alışveriş", "alisveris", "sipariş", "siparis", "kargo",
      "iade", "indirim", "mağaza", "magaza", "bakkal", "manav", "ekmek",
      "yumurta", "peynir", "zeytin", "kahve", "şeker", "seker", "makarna",
      "pirinç", "pirinc", "deterjan", "şampuan", "sampuan", "sabun",
      "domates", "patates", "soğan", "sogan", "tavuk", "kıyma", "kiyma",
      "meyve", "sebze", "dondurma", "çikolata", "cikolata",
      "grocery", "shopping", "order", "store", "cart",
    ],
    exact: ["süt", "sut", "çay", "cay", "un", "su", "tuz", "buy", "al"],
  },
  kisisel: {
    phrases: ["doğum günü", "dogum gunu", "yıl dönümü", "yil donumu"],
    stems: [
      "anne", "baba", "abla", "kardeş", "kardes", "teyze", "hala", "amca",
      "dayı", "dayi", "dede", "babaanne", "anneanne", "sevgili", "arkadaş",
      "arkadas", "yıldönümü", "yildonumu", "hediye", "davet", "düğün",
      "dugun", "ziyaret", "buluş", "bulus", "tatil", "misafir",
      "family", "friend", "birthday", "gift", "visit", "wedding",
    ],
    exact: ["eş", "es", "abi", "dost", "aile", "mom", "dad"],
  },
  fikirler: {
    phrases: ["ne olurdu", "olur mu", "what if"],
    stems: [
      "fikir", "belki", "acaba", "düşünce", "dusunce", "konsept", "hayal",
      "idea", "maybe", "concept", "brainstorm",
    ],
    exact: [],
  },
  gorevler: {
    phrases: ["randevu al", "iptal et", "geri ver", "geri al"],
    stems: [
      "hallet", "gönder", "gonder", "tamamla", "bitir", "hatırla", "hatirla",
      "başla", "basla", "düzenle", "duzenle", "araştır", "arastir",
      "temizle", "yıka", "yika", "ütüle", "utule", "yükle", "yukle",
      "onayla", "imzala", "teslim", "uzat", "değiştir", "degistir",
      "kontrol", "getir", "götür", "gotur", "hazırla", "hazirla", "planla",
      "call", "send", "finish", "fix", "clean", "book", "cancel",
      "submit", "install", "email", "remind",
    ],
    exact: ["yap", "ara", "git", "kur", "yaz", "oku", "sil", "öde", "ode", "indir", "sor", "al", "bak", "task"],
  },
};

// İlk eşleşen kazanır — özelden genele doğru sıralı.
const CATEGORY_PRIORITY = [
  "saglik",
  "para_is",
  "alisveris",
  "kisisel",
  "fikirler",
  "gorevler",
];

// Acil: bugüne/şu ana bağlı, kaçırılırsa bedeli olan işaretler.
const HIGH_RULE: Rule = {
  phrases: [
    "son tarih", "son gün", "son gun", "geç kalma", "gec kalma",
    "bugün bitmeli", "bugun bitmeli", "right now",
  ],
  stems: [
    "acil", "hemen", "kaçırma", "kacirma", "mutlaka", "kritik",
    "urgent", "asap", "deadline", "immediately",
  ],
  exact: ["bugün", "bugun", "şimdi", "simdi", "now", "today"],
};

// Önemli: yakın vadeli ya da vurgulu ama bugünlük değil.
const MEDIUM_RULE: Rule = {
  phrases: ["bu hafta", "this week", "en kısa", "en kisa"],
  stems: [
    "önemli", "onemli", "unutma", "haftaya", "yakında", "yakinda",
    "important", "soon", "tomorrow",
  ],
  exact: ["yarın", "yarin"],
};

// Gün adı ya da saat görülen not en az Önemli sayılır.
const DAY_WORDS = [
  "pazartesi", "salı", "sali", "çarşamba", "carsamba", "perşembe",
  "persembe", "cuma", "cumartesi", "pazar", "monday", "tuesday",
  "wednesday", "thursday", "friday", "saturday", "sunday",
];
const TIME_RE = /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s*'?\s*[dt][ea]\b/;

/** Türkçe-duyarsız karşılaştırma normalizasyonu (arama da bunu kullanır). */
export function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i");
}

function tokensOf(n: string): string[] {
  return n.split(/[^a-zçğıöşü0-9]+/).filter((t) => t.length > 0);
}

function matchRule(n: string, tokens: string[], rule: Rule): boolean {
  if (rule.phrases?.some((p) => n.includes(p))) return true;
  if (rule.exact?.some((w) => tokens.includes(w))) return true;
  if (rule.stems?.some((s) => tokens.some((t) => t.startsWith(s)))) return true;
  return false;
}

function categorize(n: string, tokens: string[]): string {
  for (const cat of CATEGORY_PRIORITY) {
    if (matchRule(n, tokens, RULES[cat])) return cat;
  }
  return "notlar";
}

function prioritize(n: string, tokens: string[], category: string): Priority {
  if (/!{2,}/.test(n) || matchRule(n, tokens, HIGH_RULE)) return "high";
  if (
    n.includes("!") ||
    matchRule(n, tokens, MEDIUM_RULE) ||
    TIME_RE.test(n) ||
    tokens.some((t) => DAY_WORDS.includes(t)) ||
    category === "gorevler" ||
    // Eylem fiili içeren not yapılacak iştir — ama bir fikir ("belki…") değilse.
    (category !== "fikirler" && matchRule(n, tokens, RULES.gorevler))
  ) {
    return "medium";
  }
  return "low";
}

/** Tek satır için kategori + öncelik önerisi. */
export function classifyLine(line: string): { category: string; priority: Priority } {
  const n = normalizeTr(line);
  const tokens = tokensOf(n);
  const category = categorize(n, tokens);
  return { category, priority: prioritize(n, tokens, category) };
}

function splitLines(text: string): string[] {
  const parts = text
    .split(/\r?\n+/)
    .flatMap((l) => {
      // Virgül/noktalı virgül listesi: yalnızca her parça kısaysa böl
      // ("süt, yumurta, ekmek" bölünür; virgüllü uzun cümle bütün kalır).
      const byComma = l
        .split(/[,;]\s+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      if (byComma.length > 1 && byComma.every((p) => p.split(/\s+/).length <= 5)) {
        return byComma;
      }
      return [l];
    })
    .flatMap((l) => l.split(/(?:^|\s)[•·]\s+/))
    .map((l) => l.replace(/^\s*(?:[-*]|\d+[.)])\s+/, "").trim())
    .filter((l) => l.length > 0);
  return parts.length > 0 ? parts : [text.trim()];
}

export function organizeLocally(
  text: string,
  _lang: Lang = "tr",
): OrganizedItem[] {
  const clean = (text || "").trim();
  if (!clean) return [];
  return splitLines(clean).map((line) => ({ text: line, ...classifyLine(line) }));
}

export interface TidyItem extends OrganizedItem {
  id: string;
}

const WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

// "Boşken Derle": kategorisiz ("notlar") bekleyen notları uygun kategoriye
// taşımayı önerir. Yalnızca öneri üretir — uygulamak kullanıcının onayına bağlı.
// Öncelik sadece yukarı yönlü değişir (Acil bir not asla Normal'e düşmez).
export function tidySuggestions(notes: Note[]): TidyItem[] {
  const out: TidyItem[] = [];
  for (const n of notes) {
    if (n.done || n.category !== "notlar") continue;
    const { category, priority } = classifyLine(n.text);
    if (category === "notlar") continue;
    out.push({
      id: n.id,
      text: n.text,
      category,
      priority: WEIGHT[priority] > WEIGHT[n.priority] ? priority : n.priority,
    });
  }
  return out;
}
