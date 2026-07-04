import { Note, OrganizedItem, Priority, Lang } from "@/src/types";

// Derle motoru — tamamen cihazda çalışan kurallı sınıflandırıcı.
// Kullanıcının kelimelerini ASLA değiştirmez: yalnızca açıkça ayrı satırları
// böler, kategori ve öncelik etiketi önerir. Hiçbir metin cihazdan çıkmaz.
// En kötü ihtimalle metnin tamamını tek "notlar" notu olarak döndürür.

const KEYWORDS: Record<string, string[]> = {
  saglik: [
    "ilaç", "ilac", "doktor", "hastane", "sağlık", "saglik", "takviye", "vitamin",
    "diş", "dis", "randevu", "tedavi", "krem", "yara", "ağrı", "agri", "aşı", "asi",
    "tahlil", "kan", "klinik", "hap", "health", "doctor", "medicine", "clinic",
    "pill", "dentist", "supplement", "vitamin",
  ],
  para_is: [
    "para", "maaş", "maas", "fatura", "ödeme", "odeme", "banka", "döviz", "doviz",
    "lira", "dolar", "euro", "toplantı", "toplanti", "müşteri", "musteri", "proje",
    "vergi", "kira", "bütçe", "butce", "satış", "satis", "iş ", "işe", "fatura",
    "work", "money", "invoice", "salary", "bank", "meeting", "client", "tax",
    "rent", "budget", "project", "business",
  ],
  alisveris: [
    "satın al", "satin al", "market", "alışveriş", "alisveris", "sipariş", "siparis",
    "ekmek", "süt ", "sut ", "marketten", "bakkal", "buy", "grocery", "shopping",
    "order", "cart",
  ],
  kisisel: [
    "annem", "babam", "eşim", "esim", "arkadaş", "arkadas", "sevgili", "doğum günü",
    "dogum gunu", "aile", "ziyaret", "abla", "abi", "kardeş", "kardes",
    "personal", "family", "friend", "birthday", "mom", "dad", "sister", "brother",
  ],
  fikirler: [
    "fikir", "belki", "acaba", "düşün", "dusun", "olabilir", "olsa", "idea",
    "maybe", "what if", "concept",
  ],
  gorevler: [
    "yap", "hallet", "gönder", "gonder", "ara", "tamamla", "bitir", "hatırlat",
    "hatirlat", "öde", "git", "başla", "basla", "düzenle", "duzenle", "araştır",
    "arastir", "kur", "task", "call", "send", "finish", "complete", "remind",
  ],
};

const CATEGORY_PRIORITY = [
  "saglik",
  "para_is",
  "alisveris",
  "kisisel",
  "fikirler",
  "gorevler",
];

const HIGH_WORDS = [
  "acil", "hemen", "bugün", "bugun", "şimdi", "simdi", "önemli", "onemli",
  "son tarih", "deadline", "yarın", "yarin", "geç kalma", "kaçırma", "kacirma",
  "urgent", "today", "now", "important", "asap",
];

/** Türkçe-duyarsız karşılaştırma normalizasyonu (arama da bunu kullanır). */
export function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i");
}

function categorize(line: string): string {
  const n = normalizeTr(line);
  for (const cat of CATEGORY_PRIORITY) {
    if (KEYWORDS[cat].some((w) => n.includes(w))) return cat;
  }
  return "notlar";
}

function prioritize(line: string, category: string): Priority {
  const n = normalizeTr(line);
  if (HIGH_WORDS.some((w) => n.includes(w))) return "high";
  if (category === "gorevler") return "medium";
  return "low";
}

/** Tek satır için kategori + öncelik önerisi. */
export function classifyLine(line: string): { category: string; priority: Priority } {
  const category = categorize(line);
  return { category, priority: prioritize(line, category) };
}

function splitLines(text: string): string[] {
  // Split on newlines first, then commas/semicolons (list heuristic), then bullets.
  const parts = text
    .split(/\r?\n+/)
    .flatMap((l) => {
      // Split on comma/semicolon separators if it looks like a list
      const byComma = l
        .split(/[,;]\s+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      if (byComma.length > 1) return byComma;
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
