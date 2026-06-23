import { Lang } from "@/src/types";

const MONTHS: Record<Lang, string[]> = {
  tr: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

const MONTHS_SHORT: Record<Lang, string[]> = {
  tr: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// JS getDay(): 0 = Sunday
const WEEKDAYS: Record<Lang, string[]> = {
  tr: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** Header label like "23 Haziran Salı" / "June 23, Tuesday". */
export function headerDate(lang: Lang, d: Date = new Date()): string {
  const day = d.getDate();
  const month = MONTHS[lang][d.getMonth()];
  const wd = WEEKDAYS[lang][d.getDay()];
  if (lang === "tr") return `${day} ${month} ${wd}`;
  return `${month} ${day}, ${wd}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Relative date for note rows: Today / Yesterday / weekday / "23 Haz". */
export function relativeDate(
  ts: number,
  lang: Lang,
  todayLabel: string,
  yesterdayLabel: string,
): string {
  const d = new Date(ts);
  const today = startOfDay(new Date());
  const that = startOfDay(d);
  const diffDays = Math.round((today - that) / 86400000);
  if (diffDays <= 0) return todayLabel;
  if (diffDays === 1) return yesterdayLabel;
  if (diffDays < 7) return WEEKDAYS[lang][d.getDay()];
  return `${d.getDate()} ${MONTHS_SHORT[lang][d.getMonth()]}`;
}
