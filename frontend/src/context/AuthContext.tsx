import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { storage } from "@/src/utils/storage";
import { api } from "@/src/lib/api";
import { AuthUser } from "@/src/types";

WebBrowser.maybeCompleteAuthSession?.();

const TOKEN_KEY = "derle.session";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  signInWithGoogle: async () => ({ ok: false }),
  signOut: async () => {},
  deleteAccount: async () => false,
});

export const useAuth = () => useContext(AuthContext);

function extractSessionId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/[#?&]session_id=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const processing = useRef(false);

  const applySession = useCallback(async (sessionId: string) => {
    if (processing.current) return false;
    processing.current = true;
    try {
      const res = await api.authSession(sessionId);
      if (res?.session_token) {
        await storage.secureSet(TOKEN_KEY, res.session_token);
        setToken(res.session_token);
        setUser(res.user);
        return true;
      }
      return false;
    } finally {
      processing.current = false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          const sid =
            extractSessionId(window.location.hash) ||
            extractSessionId(window.location.search);
          if (sid) {
            await applySession(sid);
            window.history.replaceState(null, "", window.location.pathname);
            setLoading(false);
            return;
          }
        } else {
          const initial = await Linking.getInitialURL();
          const sid = extractSessionId(initial);
          if (sid) await applySession(sid);
        }
        const stored = await storage.secureGet(TOKEN_KEY, "");
        if (stored) {
          const me = await api.authMe(stored as string);
          if (me?.user) {
            setToken(stored as string);
            setUser(me.user);
          } else {
            await storage.secureRemove(TOKEN_KEY);
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [applySession]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Linking.addEventListener("url", ({ url }) => {
      const sid = extractSessionId(url);
      if (sid) applySession(sid);
    });
    return () => sub.remove();
  }, [applySession]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl =
        Platform.OS === "web" && typeof window !== "undefined"
          ? window.location.origin + "/"
          : Linking.createURL("auth");
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
        redirectUrl,
      )}`;
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = authUrl;
        return { ok: true };
      }
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type === "success" && result.url) {
        const sid = extractSessionId(result.url);
        if (sid) {
          const ok = await applySession(sid);
          return ok ? { ok: true } : { ok: false, error: "exchange" };
        }
      }
      return { ok: false, error: "cancelled" };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  }, [applySession]);

  const signOut = useCallback(async () => {
    try {
      if (token) await api.logout(token);
    } catch {
      /* ignore */
    }
    await storage.secureRemove(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const deleteAccount = useCallback(async () => {
    if (!token) {
      await storage.secureRemove(TOKEN_KEY);
      setToken(null);
      setUser(null);
      return true;
    }
    const ok = await api.deleteAccount(token);
    if (ok) {
      await storage.secureRemove(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
    return ok;
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signInWithGoogle, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
