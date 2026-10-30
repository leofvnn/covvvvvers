import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { firstSentence, getFeatured } from "@/lib/data";
import { squareImage } from "@/lib/img";
import { SITE_URL, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Sends the cover of the week to every subscriber. Vercel runs it every Monday (see vercel.json).
 * Needs CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY and EMAIL_FROM.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!serviceKey || !resendKey || !from || !SUPABASE_URL) {
    return NextResponse.json({ error: "Email isn't set up yet. See the README." }, { status: 500 });
  }

  const db = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
  const { data: subs, error } = await db.from("subscribers").select("email, token").is("unsubscribed_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cover = await getFeatured();
  const link = `${SITE_URL}/covers/${cover.slug}`;
  const bg = cover.color ?? "#111111";
  const subject = `Cover of the week: ${cover.title}`;
  const html = (token: string) => `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Helvetica,Arial,sans-serif;color:#000">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td style="font-size:22px;font-weight:800;padding-bottom:20px">Covvvvvers</td></tr>
<tr><td style="background:${esc(bg)};padding:32px"><a href="${link}"><img src="${squareImage(cover.image_url, 1000)}" width="496" alt="${esc(cover.title)} by ${esc(cover.artist)}" style="display:block;width:100%;height:auto;border:0"></a></td></tr>
<tr><td style="padding-top:24px;font-size:13px;color:#6b6b6b">Cover of the week</td></tr>
<tr><td style="padding-top:6px;font-size:32px;font-weight:800;line-height:1.05">${esc(cover.title)}</td></tr>
<tr><td style="padding-top:6px;font-size:17px">${esc(cover.artist)}, ${cover.release_year}</td></tr>
<tr><td style="padding-top:16px;font-family:Georgia,serif;font-size:18px;line-height:1.55">${esc(firstSentence(cover.description_html))}</td></tr>
<tr><td style="padding-top:20px"><a href="${link}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">Read the story</a></td></tr>
<tr><td style="padding-top:40px;font-size:12px;color:#6b6b6b">You get this because you joined the Covvvvvers weekly email. <a href="${SITE_URL}/unsubscribe?token=${token}" style="color:#6b6b6b">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;

  let sent = 0;
  const failed: string[] = [];
  // Resend's batch endpoint takes up to 100 emails per call.
  for (let i = 0; i < (subs ?? []).length; i += 100) {
    const batch = subs!.slice(i, i + 100).map((s) => ({
      from,
      to: [s.email],
      subject,
      html: html(s.token),
      headers: { "List-Unsubscribe": `<${SITE_URL}/unsubscribe?token=${s.token}>` },
    }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (res.ok) sent += batch.length;
    else failed.push(`${res.status} ${await res.text()}`);
  }
  return NextResponse.json({ cover: cover.title, sent, failed });
}
