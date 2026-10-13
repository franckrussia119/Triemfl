import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

export type Account = {
  id: number; email: string; name: string; accountType: "researcher" | "institution"; role: "user" | "reviewer" | "editor" | "admin";
  status: "active" | "pending" | "suspended"; emailVerified: boolean; title: string; institution: string; position: string; country: string;
  orcid: string; bio: string; expertise: string; photo: string; phone: string; website: string; publicProfile: boolean; createdAt: string;
};
type Me = { user: Account | null; counts?: { unread: number; pendingReviews: number }; emailEnabled: boolean };
type Ctx = Me & { loading: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };

const AuthContext = createContext<Ctx>({ user: null, emailEnabled: false, loading: true, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me>({ user: null, emailEnabled: false });
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setMe(await api<Me>("/api/account/me")); } catch { setMe({ user: null, emailEnabled: false }); }
    setLoading(false);
  }, []);
  const signOut = useCallback(async () => { await api("/api/account/signout", { method: "POST" }).catch(() => {}); await refresh(); }, [refresh]);
  useEffect(() => { refresh(); }, [refresh]);
  return <AuthContext.Provider value={{ ...me, loading, refresh, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export const isStaff = (u: Account | null) => !!u && (u.role === "editor" || u.role === "admin");

// Sends a multipart form (with files) and turns errors into ApiError.
export async function postForm<T = any>(url: string, fd: FormData, method = "POST"): Promise<T> {
  const { ApiError } = await import("./api");
  let res: Response;
  try { res = await fetch(url, { method, body: fd, credentials: "same-origin" }); } catch { throw new ApiError(0, { error: "network" }); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
