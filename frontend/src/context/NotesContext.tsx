import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { storage } from "@/src/utils/storage";
import { api } from "@/src/lib/api";
import { organizeLocally } from "@/src/lib/localOrganize";
import { CATEGORIES } from "@/src/constants/categories";
import { Note, CustomCategory, Priority, OrganizedItem } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";
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

export interface OrganizePreview {
  source: "ai" | "local";
  items: OrganizedItem[];
}

interface NotesContextValue {
  notes: Note[];
  ready: boolean;
  processing: boolean;
  syncing: boolean;
  customCategories: CustomCategory[];
  addManual: (text: string, categoryId?: string) => AddResult;
  previewOrganize: (text: string) => Promise<OrganizePreview>;
  addOrganized: (items: OrganizedItem[]) => AddResult;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleDone: (id: string) => void;
  togglePinned: (id: string) => void;
  addCustomCategory: (label: string, color: string) => void;
  removeCustomCategory: (id: string) => void;
  exportJSON: () => string;
  importJSON: (raw: string) => number;
  clearLocal: () => void;
}

const NotesContext = createContext<NotesContextValue>({} as NotesContextValue);
export const useNotes = () => useContext(NotesContext);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { lang } = useI18n();

  const [all, setAll] = useState<Note[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const allRef = useRef<Note[]>([]);
  const tokenRef = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  allRef.current = all;
  tokenRef.current = token;

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
            setAll(parsed);
            allRef.current = parsed;
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

  // ---- cloud sync ----------------------------------------------------------
  const pushSync = useCallback(async () => {
    const tk = tokenRef.current;
    if (!tk) return;
    setSyncing(true);
    try {
      const res = await api.syncNotes(tk, allRef.current);
      if (res?.notes && Array.isArray(res.notes)) {
        allRef.current = res.notes;
        setAll(res.notes);
        storage.setItem(NOTES_KEY, JSON.stringify(res.notes));
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  const scheduleSync = useCallback(() => {
    if (!tokenRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => pushSync(), 1200);
  }, [pushSync]);

  // pull + merge when the user signs in (or token changes)
  useEffect(() => {
    if (token) pushSync();
  }, [token, pushSync]);

  // sync when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && tokenRef.current) pushSync();
    });
    return () => sub.remove();
  }, [pushSync]);

  // ---- mutations -----------------------------------------------------------
  const persistCustom = useCallback((next: CustomCategory[]) => {
    setCustomCategories(next);
    storage.setItem(CUSTOM_KEY, JSON.stringify(next));
  }, []);

  // Not ekleme = anında ve öngörülebilir: kullanıcının seçtiği kategoriye tek
  // not olarak kaydedilir. AI hiçbir zaman kendiliğinden bölmez/taşımaz.
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
        pinned: false, // kullanıcı manuel yıldızlayana kadar hiç bir not yıldızlı olmaz
        done: false,
        createdAt: now,
        updatedAt: now,
        deleted: false,
        source: "local",
      };

      persist([note, ...allRef.current]);
      scheduleSync();
      return { count: 1, categories: [category] };
    },
    [persist, scheduleSync],
  );

  // "✨ Derle" butonu: AI'dan bölme ÖNERİSİ alır, hiçbir şey kaydetmez.
  // Kullanıcı önizlemeyi onaylamadan not oluşmaz. AI yoksa cihazdaki kurallı
  // motor öneri üretir — buton asla ölü kalmaz, metin asla kaybolmaz.
  const previewOrganize = useCallback(
    async (text: string): Promise<OrganizePreview> => {
      const clean = (text || "").trim();
      if (!clean) return { source: "local", items: [] };

      setProcessing(true);
      try {
        const res = await api.organize(clean, lang);
        if (res.source === "ai" && res.items?.length) {
          return { source: "ai", items: res.items };
        }
      } catch {
        /* fall through to local */
      } finally {
        setProcessing(false);
      }

      let local = organizeLocally(clean, lang);
      if (!local || local.length === 0) {
        local = [{ text: clean, category: "notlar", priority: "low" as Priority }];
      }
      return { source: "local", items: local };
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
        pinned: false, // kullanıcı manuel yıldızlayana kadar hiç bir not yıldızlı olmaz
        done: false,
        createdAt: now + idx,
        updatedAt: now + idx,
        deleted: false,
        source: "ai",
      }));

      persist([...created, ...allRef.current]);
      scheduleSync();
      return {
        count: created.length,
        categories: Array.from(new Set(created.map((n) => n.category))),
      };
    },
    [customCategories, persist, scheduleSync],
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      );
      persist(next);
      scheduleSync();
    },
    [persist, scheduleSync],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, deleted: true, updatedAt: Date.now() } : n,
      );
      persist(next);
      scheduleSync();
    },
    [persist, scheduleSync],
  );

  const toggleDone = useCallback(
    (id: string) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, done: !n.done, updatedAt: Date.now() } : n,
      );
      persist(next);
      scheduleSync();
    },
    [persist, scheduleSync],
  );

  const togglePinned = useCallback(
    (id: string) => {
      const next = allRef.current.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n,
      );
      persist(next);
      scheduleSync();
    },
    [persist, scheduleSync],
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
      scheduleSync();
    },
    [customCategories, persistCustom, persist, scheduleSync],
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
          pinned: !!n.pinned,
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
      scheduleSync();
      return added;
    },
    [persist, scheduleSync],
  );

  const clearLocal = useCallback(() => {
    const next = allRef.current.map((n) => ({
      ...n,
      deleted: true,
      updatedAt: Date.now(),
    }));
    persist(next);
    scheduleSync();
  }, [persist, scheduleSync]);

  const notes = useMemo(() => all.filter((n) => !n.deleted), [all]);

  const value = useMemo(
    () => ({
      notes,
      ready,
      processing,
      syncing,
      customCategories,
      addManual,
      previewOrganize,
      addOrganized,
      updateNote,
      deleteNote,
      toggleDone,
      togglePinned,
      addCustomCategory,
      removeCustomCategory,
      exportJSON,
      importJSON,
      clearLocal,
    }),
    [
      notes,
      ready,
      processing,
      syncing,
      customCategories,
      addManual,
      previewOrganize,
      addOrganized,
      updateNote,
      deleteNote,
      toggleDone,
      togglePinned,
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

/** Capture-screen list: notes pinned to priority, not done, sorted by urgency. */
export function selectPriorityNotes(notes: Note[]): Note[] {
  return notes
    .filter((n) => !n.done && n.pinned)
    .sort((a, b) => {
      const w = priorityWeight(b) - priorityWeight(a);
      if (w !== 0) return w;
      return b.updatedAt - a.updatedAt;
    });
}
