import { redirect } from "next/navigation";

// The kiosk flow now lives on ONE route (offline-capable view switching);
// kept as a redirect so old bookmarks / restored tabs still land right.
export default function Page() {
  redirect("/guestbook?v=search");
}
