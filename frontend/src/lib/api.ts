import { Note, OrganizedItem } from "@/src/types";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";

interface ReqResult {
  ok: boolean;
  status: number;
  data: any;
}

async function req(
  path: string,
  options: RequestInit = {},
  timeoutMs = 20000,
): Promise<ReqResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  async organize(
    text: string,
    lang: string,
  ): Promise<{ source: "ai" | "fallback"; items: OrganizedItem[] }> {
    try {
      const r = await req(
        "/api/ai/organize",
        { method: "POST", body: JSON.stringify({ text, lang }) },
        25000,
      );
      if (r.ok && r.data && Array.isArray(r.data.items)) {
        return { source: r.data.source === "ai" ? "ai" : "fallback", items: r.data.items };
      }
    } catch {
      /* fall through */
    }
    return { source: "fallback", items: [] };
  },

  async authSession(session_id: string) {
    try {
      const r = await req("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ session_id }),
      });
      return r.ok ? r.data : null;
    } catch {
      return null;
    }
  },

  async authMe(token: string) {
    try {
      const r = await req("/api/auth/me", { headers: authHeader(token) });
      return r.ok ? r.data : null;
    } catch {
      return null;
    }
  },

  async logout(token: string) {
    try {
      await req("/api/auth/logout", { method: "POST", headers: authHeader(token) });
    } catch {
      /* ignore */
    }
  },

  async deleteAccount(token: string): Promise<boolean> {
    try {
      const r = await req("/api/auth/account", {
        method: "DELETE",
        headers: authHeader(token),
      });
      return r.ok;
    } catch {
      return false;
    }
  },

  async syncNotes(
    token: string,
    notes: Note[],
  ): Promise<{ notes: Note[] } | null> {
    try {
      const r = await req("/api/notes/sync", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ notes }),
      });
      return r.ok ? r.data : null;
    } catch {
      return null;
    }
  },
};
