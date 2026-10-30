"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";

export async function reviewSubmission(form: FormData) {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !["approved", "rejected", "pending"].includes(status)) return;
  const db = await getServerClient();
  if (!db) return;
  // Row level security only lets admins update submissions.
  await db
    .from("submissions")
    .update({ status, reviewed_at: status === "pending" ? null : new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}
