import { redirect } from "next/navigation";

import { GuestbookFlow, type KioskInitialView } from "@/components/templates/guestbook-flow";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

// The entire guest-facing kiosk lives on this one route: the flow component
// switches screens client-side so check-in keeps working when the venue
// network drops. `?v=` picks the opening screen (used by the attendant
// shortcuts and the legacy sub-route redirects).
const INITIAL_VIEWS: readonly KioskInitialView[] = ["search", "qr", "notfound"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;

  // The wedding + full guest directory resolve from the kiosk TOKEN session.
  // Null → no valid token (or a kicked/revoked one) → attendant login.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }

  const initialView = INITIAL_VIEWS.find((view) => view === v);
  return <GuestbookFlow initial={data} initialView={initialView} />;
}
