// Staff notifications (Telegram) and emails to authors/clients (Resend).
// Both are optional: if not configured, data is still saved in the database
// and visible in the admin portal.

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function notifyStaff(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html.slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!res.ok) console.error("Telegram error:", await res.text());
    return res.ok;
  } catch (e) {
    console.error("Telegram error:", e);
    return false;
  }
}

export function emailEnabled() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendEmail(to: string, subject: string, text: string, replyTo?: string): Promise<boolean> {
  if (!emailEnabled()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error("Email error:", await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email error:", e);
    return false;
  }
}
