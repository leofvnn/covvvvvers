import AccountSettings from "@/components/AccountSettings";
import { getAccount } from "@/lib/account";
import { getCovers } from "@/lib/data";
import { squareImage } from "@/lib/img";

export default async function SettingsPage() {
  const { db, user, profile } = await getAccount("/me/settings");
  const [favs, covers] = await Promise.all([
    db.from("favorites").select("cover_id").eq("user_id", user.id).order("created_at", { ascending: false }),
    getCovers(),
  ]);
  const byId = new Map(covers.map((c) => [c.id, c]));
  // Profile pictures come from the member's own saved covers.
  const choices = (favs.data ?? [])
    .map((f) => byId.get(f.cover_id))
    .filter(Boolean)
    .map((c) => ({ id: c!.id, title: c!.title, artist: c!.artist, image: squareImage(c!.image_url, 240) }));
  return (
    <AccountSettings
      userId={user.id}
      email={user.email ?? ""}
      name={profile.display_name ?? ""}
      avatar={profile.avatar_cover_id ?? null}
      choices={choices}
      isAdmin={Boolean(profile.is_admin)}
    />
  );
}
