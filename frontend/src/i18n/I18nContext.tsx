import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { storage } from "@/src/utils/storage";
import { Lang } from "@/src/types";
import { translate } from "@/src/i18n/strings";

const LANG_KEY = "derle.lang";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "tr",
  setLang: () => {},
  t: (k) => k,
  ready: false,
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem(LANG_KEY, "tr");
      if (stored === "tr" || stored === "en") setLangState(stored);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, ready }),
    [lang, setLang, t, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
