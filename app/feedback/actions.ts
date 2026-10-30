"use server";

import { getServerClient } from "@/lib/supabase/server";

export type FeedbackState = { ok: boolean; message: string };

const TOPICS = ["general", "idea", "problem", "correction"];

export async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  // A hidden field people can't see; bots fill it in.
  if (String(form.get("website") ?? "")) return { ok: true, message: "Thanks. Your feedback was sent." };

  const message = String(form.get("message") ?? "").trim().slice(0, 3000);
  const topic = String(form.get("topic") ?? "general");
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const page = String(form.get("page") ?? "").trim().slice(0, 300);
  if (!message) return { ok: false, message: "Write a few words before sending." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Check the email address." };

  const db = await getServerClient();
  if (!db) return { ok: false, message: "Feedback opens once the site is connected to Supabase." };
  const {
    data: { user },
  } = await db.auth.getUser();
  const { error } = await db.from("feedback").insert({
    user_id: user?.id ?? null,
    email: email || user?.email || null,
    topic: TOPICS.includes(topic) ? topic : "general",
    message,
    page: page || null,
  });
  if (error) return { ok: false, message: "Your feedback didn't send. Try again in a moment." };
  return { ok: true, message: "Thanks. Your feedback was sent, and every message gets read." };
}
