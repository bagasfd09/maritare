import { redirect } from "next/navigation";

// The kiosk flow now lives on ONE route (offline-capable view switching).
export default function Page() {
  redirect("/guestbook");
}
