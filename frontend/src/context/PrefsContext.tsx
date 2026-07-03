import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";

const AI_KEY = "derle.aiEnabled";

interface PrefsContextValue {
  aiEnabled: boolean;
  setAiEnabled: (v: boolean) => void;
}

const PrefsContext = createContext<PrefsContextValue>({
  aiEnabled: true,
  setAiEnabled: () => {},
});

export const usePrefs = () => useContext(PrefsContext);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [aiEnabled, setAiEnabledState] = useState(true);

  useEffect(() => {
    storage.getItem<string>(AI_KEY, "1").then((v) => setAiEnabledState(v !== "0"));
  }, []);

  const setAiEnabled = useCallback((v: boolean) => {
    setAiEnabledState(v);
    storage.setItem(AI_KEY, v ? "1" : "0");
  }, []);

  const value = useMemo(() => ({ aiEnabled, setAiEnabled }), [aiEnabled, setAiEnabled]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}
