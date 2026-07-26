import { redirect } from "next/navigation";

// The kiosk flow now lives on ONE route (offline-capable view switching); the
// confirm screen needs in-flow context, so land on search and re-pick.
export default function Page() {
  redirect("/guestbook?v=search");
}
