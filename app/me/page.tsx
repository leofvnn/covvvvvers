import { redirect } from "next/navigation";

/** The account opens on Lists, where Bookmarked is the first, default list. */
export default function AccountPage() {
  redirect("/me/lists");
}
