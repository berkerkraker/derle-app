import { OrganizedItem, Priority, Lang } from "@/src/types";

// On-device fallback engine. Runs when the AI proxy is unreachable / the
// budget is exhausted / there is no network. It NEVER rewrites the user's
// words — it only splits clearly-separate lines and tags category + priority
// by keyword. Worst case it returns the whole text as a single "notlar" note.

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

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i");
}

function categorize(line: string): string {
  const n = normalize(line);
  for (const cat of CATEGORY_PRIORITY) {
    if (KEYWORDS[cat].some((w) => n.includes(w))) return cat;
  }
  return "notlar";
}

function prioritize(line: string, category: string): Priority {
  const n = normalize(line);
  if (HIGH_WORDS.some((w) => n.includes(w))) return "high";
  if (category === "gorevler") return "medium";
  return "low";
}

function splitLines(text: string): string[] {
  // Split only on clear separators: new lines and bullet markers.
  const parts = text
    .split(/\r?\n+/)
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
  const lines = splitLines(clean);
  return lines.map((line) => {
    const category = categorize(line);
    return { text: line, category, priority: prioritize(line, category) };
  });
}
