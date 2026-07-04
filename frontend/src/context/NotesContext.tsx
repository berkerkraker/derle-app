import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import {
  organizeLocally,
  tidySuggestions,
  TidyItem,
} from "@/src/lib/localOrganize";
import { CATEGORIES } from "@/src/constants/categories";
import { Note, CustomCategory, Priority, OrganizedItem } from "@/src/types";
import { useI18n } from "@/src/i18n/I18nContext";

const NOTES_KEY = "derle.notes";
const CUSTOM_KEY = "derle.customCategories";

function uid(): string {
  return "n_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface AddResult {
  count: number;
  categories: string[];
}

interface NotesContextValue {
  notes: Note[];
  ready: boolean;
  customCategories: CustomCategory[];
  addManual: (text: string, categoryId?: string) => AddResult;
  previewOrganize: (text: string) => OrganizedItem[];
  addOrganized: (items: OrganizedItem[]) => AddResult;
  tidyInbox: () => TidyItem[];
  applyTidy: (items: TidyItem[]) => number;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleDone: (id: string) => void;
  addCustomCategory: (label: string, color: string) => void;
  removeCustomCategory: (id: string) => void;
  exportJSON: () => string;
  importJSON: (raw: string) => number;
  clearLocal: () => void;
}

const NotesContext = createContext<NotesContextValue>({} as NotesContextValue);
export const useNotes = () => useContext(NotesContext);

// v1.2 → v1.3: yıldız kavramı kalktı. Yıldızlanmış Normal notlar Önemli'ye
// yükseltilir ki ana ekrandan sessizce kaybolmasınlar. İkinci çalıştırma
// hiçbir şey değiştirmez (pinned kalmayınca dokunulmaz).
function migrateStars(parsed: Note[]): { notes: Note[]; changed: boolean } {
  let changed = false;
  const notes = parsed.map((n) => {
    if (!n.pinned) return n;
    changed = true;
    return {
      ...n,
      pinned: false,
      priority:
        n.priority === "low" && !n.done ? ("medium" as Priority) : n.priority,
    };
  });
  return { notes, changed };
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();

  const [all, setAll] = useState<Note[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [ready, setReady] = useState(false);

  const allRef = useRef<Note[]>([]);
  allRef.current = all;

  // ---- persistence ---------------------------------------------------------
  const persist = useCallback((next: Note[]) => {
    allRef.current = next;
    setAll(next);
    storage.setItem(NOTES_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await storage.getItem(NOTES_KEY, "");
      if (raw) {
        try {
          const parsed = JSON.parse(raw as string) as Note[];
          if (Array.isArray(parsed)) {
            const { notes: migrated, changed } = migrateStars(parsed);
            setAll(migrated);
            allRef.current = migrated;
            if (changed) storage.setItem(NOTES_KEY, JSON.stringify(migrated));
          }
        } catch {
          /* ignore corrupt */
        }
      }
      const cRaw = await storage.getItem(CUSTOM_KEY, "");
      if (cRaw) {
        try {
          const parsed = JSON.parse(cRaw as string) as CustomCategory[];
          if (Array.isArray(parsed)) setCustomCategories(parsed);
        } catch {
          /* ignore */
        }
      }
      setReady(true);
    })();
  }, []);

  // ---- mutations -----------------------------------------------------------
  const persistCustom = useCallback((next: CustomCategory[]) => {
    setCustomCategories(next);
    storage.setItem(CUSTOM_KEY, JSON.stringify(next));
  }, []);

  // Not ekleme = anında ve öngörülebilir: kullanıcının seçtiği kategoriye tek
  // not olarak kaydedilir. Motor hiçbir zaman kendiliğinden bölmez/taşımaz.
  const addManual = useCallback(
    (text: string, categoryId?: string): AddResult => {
      const clean = (text || "").trim();
      if (!clean) return { count: 0, categories: [] };

      const category = categoryId || "notlar";
      const now = Date.now();
      const note: Note = {
        id: uid(),
        text: clean,
        category,
        priority: "low",
        pinned: false,
        done: false,
        createdAt: now,
        updatedAt: now,
        deleted: false,
        source: "local",
      };

      persist([note, ...allRef.current]);
      return { count: 1, categories: [category] };
    },
    [persist],
  );

  // "✨ Derle" (metinle): cihazdaki motordan bölme ÖNERİSİ alır, hiçbir şey
  // kaydetmez. Kullanıcı önizlemeyi onaylamadan not oluşmaz.
  const previewOrganize = useCallback(
    (text: string): OrganizedItem[] => {
      const clean = (text || "").trim();
      if (!clean) return [];
      const items = organizeLocally(clean, lang);
      return items.length
        ? items
        : [{ text: clean, category: "notlar", priority: "low" as Priority }];
    },
    [lang],
  );

  // Önizleme onaylanınca çağrılır: önerilen parçaları toplu kaydeder.
  const addOrganized = useCallback(
    (items: OrganizedItem[]): AddResult => {
      const valid = (items || []).filter(
        (it) => it && typeof it.text === "string" && it.text.trim().length > 0,
      );
      if (valid.length === 0) return { count: 0, categories: [] };

      const known = new Set([
        ...Object.keys(CATEGORIES),
        ...customCategories.map((c) => c.id),
      ]);
      const now = Date.now();
      const created: Note[] = valid.map((it, idx) => ({
        id: uid(),
        text: it.text.trim(),
        category: known.has(it.category) ? it.category : "notlar",
        priority: (it.priority as Priority) || "low",
        pinned: false,
        done: false,
        createdAt: now + idx,
        updatedAt: now + idx,
        deleted: false,
        source: "local",
      }));

      persist([...created, ...allRef.current]);
      return {
        count: created.length,
        categories: Array.from(new Set(created.map((n) => n.category))),
      };
    },
    [customCategories, persist],
  );

  // "✨ Derle" (kutu boşken): Notlar'da bekleyen kategorisiz notlar için
  // taşıma önerileri. Uygulamak applyTidy + kullanıcı onayı ister.
  const tidyInbox = useCallback(
    (): TidyItem[] => tidySuggestions(allRef.current.filter((n) => !n.deleted)),
    [],
  );

  const applyTidy = useCallback(
    (items: TidyItem[]): number => {
      if (!items.length) return 0;
      const byId = new Map(items.map((i) => [i.id, i]));
      const now = Date.now();
      let moved = 0;
      const next = allRef.current.map((n) => {
        const s = byId.get(n.id);
        if (!s) return n;
        moved += 1;
        return { ...n, category: s.category, priority: s.priority, updatedAt: now };
      });
      persist(next);
      return moved;
    },
    [persist],
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      );
      persist(next);
    },
    [persist],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, deleted: true, updatedAt: Date.now() } : n,
      );
      persist(next);
    },
    [persist],
  );

  const toggleDone = useCallback(
    (id: string) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, done: !n.done, updatedAt: Date.now() } : n,
      );
      persist(next);
    },
    [persist],
  );

  const addCustomCategory = useCallback(
    (label: string, color: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const cat: CustomCategory = {
        id: "c_" + Date.now().toString(36),
        label: trimmed,
        color,
      };
      persistCustom([...customCategories, cat]);
    },
    [customCategories, persistCustom],
  );

  const removeCustomCategory = useCallback(
    (id: string) => {
      persistCustom(customCategories.filter((c) => c.id !== id));
      // reassign notes of this category back to general notes
      const next = allRef.current.map((n) =>
        n.category === id ? { ...n, category: "notlar", updatedAt: Date.now() } : n,
      );
      persist(next);
    },
    [customCategories, persistCustom, persist],
  );

  const exportJSON = useCallback(() => {
    const active = allRef.current.filter((n) => !n.deleted);
    return JSON.stringify(active, null, 2);
  }, []);

  const importJSON = useCallback(
    (raw: string): number => {
      const parsed = JSON.parse(raw) as Note[];
      if (!Array.isArray(parsed)) throw new Error("invalid");
      const map = new Map<string, Note>();
      for (const n of allRef.current) map.set(n.id, n);
      let added = 0;
      for (const n of parsed) {
        if (!n || typeof n.text !== "string") continue;
        const id = typeof n.id === "string" ? n.id : uid();
        const existing = map.get(id);
        const note: Note = {
          id,
          text: n.text,
          category: n.category || "notlar",
          priority: (n.priority as Priority) || "low",
          pinned: false,
          done: !!n.done,
          createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
          updatedAt: Date.now(),
          deleted: false,
          source: n.source,
        };
        if (!existing) added += 1;
        map.set(id, note);
      }
      persist(Array.from(map.values()));
      return added;
    },
    [persist],
  );

  const clearLocal = useCallback(() => {
    const next = allRef.current.map((n) => ({
      ...n,
      deleted: true,
      updatedAt: Date.now(),
    }));
    persist(next);
  }, [persist]);

  const notes = useMemo(() => all.filter((n) => !n.deleted), [all]);

  const value = useMemo(
    () => ({
      notes,
      ready,
      customCategories,
      addManual,
      previewOrganize,
      addOrganized,
      tidyInbox,
      applyTidy,
      updateNote,
      deleteNote,
      toggleDone,
      addCustomCategory,
      removeCustomCategory,
      exportJSON,
      importJSON,
      clearLocal,
    }),
    [
      notes,
      ready,
      customCategories,
      addManual,
      previewOrganize,
      addOrganized,
      tidyInbox,
      applyTidy,
      updateNote,
      deleteNote,
      toggleDone,
      addCustomCategory,
      removeCustomCategory,
      exportJSON,
      importJSON,
      clearLocal,
    ],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

// ---- selectors (pure, reused by screens) -----------------------------------
const WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

export function priorityWeight(n: Note): number {
  return WEIGHT[n.priority] ?? 1;
}

/** Yakala vitrini: bitmemiş Acil + Önemli notlar, acilden başlayarak. */
export function selectPriorityNotes(notes: Note[]): Note[] {
  return notes
    .filter((n) => !n.done && (n.priority === "high" || n.priority === "medium"))
    .sort((a, b) => {
      const w = priorityWeight(b) - priorityWeight(a);
      if (w !== 0) return w;
      return b.updatedAt - a.updatedAt;
    });
}
