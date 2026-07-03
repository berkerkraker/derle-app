import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";

import { storage } from "@/src/utils/storage";
import { ThemeMode } from "@/src/types";
import { DARK, LIGHT, Palette } from "@/src/theme/colors";

const THEME_KEY = "derle.theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  scheme: "light" | "dark";
  colors: Palette;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setMode: () => {},
  scheme: "dark",
  colors: DARK,
  ready: false,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem<string>(THEME_KEY, "system");
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored);
      }
      setReady(true);
    })();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    storage.setItem(THEME_KEY, m);
  }, []);

  const scheme: "light" | "dark" =
    mode === "system" ? (system === "light" ? "light" : "dark") : mode;
  const colors = scheme === "light" ? LIGHT : DARK;

  const value = useMemo(
    () => ({ mode, setMode, scheme, colors, ready }),
    [mode, setMode, scheme, colors, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
