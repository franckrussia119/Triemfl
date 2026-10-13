export type Author = { name: string; affiliation?: string; orcid?: string };

export type Publication = {
  id: number; slug: string; type: string; title: string; authors: Author[]; abstract: string;
  keywords: string[]; jelCodes: string[]; category: string; publishedDate: string;
  series: string; number: string; volume: string; issue: string; pages: string; doi: string;
  hasPdf: boolean; downloads: number; views: number;
  status?: string; submissionId?: number | null;
};

export type Announcement = { id: number; kind: string; title: string; body: string; date: string; link: string };

export class ApiError extends Error {
  constructor(public status: number, public data: any) { super(data?.error || `HTTP ${status}`); }
}

export async function api<T = any>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const opts: RequestInit = { credentials: "same-origin", ...init };
  if (init?.json !== undefined) {
    opts.body = JSON.stringify(init.json);
    opts.headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  }
  let res: Response;
  try { res = await fetch(url, opts); } catch { throw new ApiError(0, { error: "network" }); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

// Turns an API error into one plain sentence for the person using the form.
export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(e instanceof ApiError)) return fallback;
  switch (e.data?.error) {
    case "network": return "The connection dropped before your request reached us. Check your connection and try again.";
    case "rate_limited": return "Too many attempts from this connection. Wait a few minutes and try again.";
    case "file_too_large": return `The file is larger than ${e.data.maxMb} MB. Compress it or split it, then try again.`;
    case "unsupported_type": return `This file type isn't accepted. Use ${e.data.allowed || "PDF or Word"}.`;
    case "validation": return "Some fields need attention. They are marked below.";
    default: return fallback;
  }
}

export const authorNames = (a: Author[]) => a.map((x) => x.name).join(", ");

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", opts);
}
