"use client";

/**
 * Bookmarks, shared by every part of the page that shows them (the cover page's Bookmark
 * button, the mark on cover cards, the account). Each bookmarked cover lives in exactly one
 * place: the default list, "Saved" (the favorites table), or one of the member's own lists.
 */
import { useEffect, useState } from "react";
import { getBrowserClient } from "./supabase/client";

export type ListInfo = { id: string; title: string };
export type Where = string | null; // a list id, or null for Saved
export type BookmarkState = {
  userId: string | null;
  ready: boolean;
  /** cover id -> where it's bookmarked */
  where: Map<string, Where>;
  lists: ListInfo[];
};

export const DEFAULT_LIST = "Saved";

let state: BookmarkState = { userId: null, ready: false, where: new Map(), lists: [] };
let loading: Promise<void> | null = null;
const listeners = new Set<(s: BookmarkState) => void>();

const set = (next: Partial<BookmarkState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
};

async function load() {
  const db = getBrowserClient();
  if (!db) return set({ ready: true });
  const { data } = await db.auth.getSession();
  const userId = data.session?.user.id ?? null;
  if (!userId) return set({ userId: null, ready: true, where: new Map(), lists: [] });
  const [favs, lists] = await Promise.all([
    db.from("favorites").select("cover_id").eq("user_id", userId),
    db.from("lists").select("id, title").eq("user_id", userId).order("updated_at", { ascending: false }),
  ]);
  const where = new Map<string, Where>();
  const own = (lists.data ?? []) as ListInfo[];
  if (own.length) {
    const { data: items } = await db.from("list_items").select("list_id, cover_id").in(
      "list_id",
      own.map((l) => l.id),
    );
    for (const i of items ?? []) where.set(i.cover_id, i.list_id);
  }
  for (const f of favs.data ?? []) where.set(f.cover_id, null);
  set({ userId, ready: true, where, lists: own });
}

function ensure() {
  if (!loading) {
    loading = load();
    getBrowserClient()?.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") loading = load();
    });
  }
  return loading;
}

/** The current bookmarks, kept up to date across the page. */
export function useBookmarks() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    ensure();
    setS(state);
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

/** Takes a cover out of every place it's bookmarked. */
async function clear(coverId: string) {
  const db = getBrowserClient()!;
  const ids = state.lists.map((l) => l.id);
  await Promise.all([
    db.from("favorites").delete().eq("user_id", state.userId).eq("cover_id", coverId),
    ids.length ? db.from("list_items").delete().eq("cover_id", coverId).in("list_id", ids) : null,
  ]);
}

/** Bookmarks a cover in a list (null: the default list, Saved), moving it if it was elsewhere. */
export async function bookmark(coverId: string, to: Where = null) {
  const db = getBrowserClient();
  if (!db || !state.userId) throw new Error("Sign in to bookmark covers.");
  await clear(coverId);
  const { error } = to
    ? await db.from("list_items").insert({ list_id: to, cover_id: coverId })
    : await db.from("favorites").insert({ user_id: state.userId, cover_id: coverId });
  if (error) {
    await load();
    throw new Error("That didn't save. Try again.");
  }
  if (to) await db.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", to);
  const where = new Map(state.where);
  where.set(coverId, to);
  set({ where });
}

export async function unbookmark(coverId: string) {
  if (!state.userId) return;
  await clear(coverId);
  const where = new Map(state.where);
  where.delete(coverId);
  set({ where });
}

/** Makes a new private list and returns it. */
export async function createList(title: string): Promise<ListInfo> {
  const db = getBrowserClient();
  if (!db || !state.userId) throw new Error("Sign in to make lists.");
  const name = title.trim().slice(0, 80);
  const { data, error } = await db.from("lists").insert({ user_id: state.userId, title: name, is_public: false }).select("id, title").single();
  if (error || !data) throw new Error("The list wasn't created. Try again.");
  set({ lists: [data as ListInfo, ...state.lists] });
  return data as ListInfo;
}

export const listName = (s: BookmarkState, where: Where | undefined) =>
  where === undefined ? null : where === null ? DEFAULT_LIST : (s.lists.find((l) => l.id === where)?.title ?? DEFAULT_LIST);
