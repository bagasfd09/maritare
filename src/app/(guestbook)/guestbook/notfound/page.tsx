import { redirect } from "next/navigation";

import { GuestbookNotFound } from "@/components/templates/guestbook-notfound";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

export default async function Page() {
  // Walk-in registration. Resolve the kiosk token first; null → no valid token
  // (or a kicked/revoked one) → send to login rather than render the shell mock.
  // The walk-in form also re-derives the wedding server-side on submit.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }
  return <GuestbookNotFound header={data.header} />;
}
