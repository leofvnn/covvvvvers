import { redirect } from "next/navigation";

/** The account opens on Lists, where Saved is the first, default list. */
export default function AccountPage() {
  redirect("/me/lists");
}
