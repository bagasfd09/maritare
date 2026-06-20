import { redirect } from "next/navigation";

import { GuestbookIdle } from "@/components/templates/guestbook-idle";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

export default async function Page() {
  // Couple + live HADIR counter + date/venue from the kiosk TOKEN session. Null
  // → no valid token (or a kicked/revoked one) → send to the attendant login.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }
  return <GuestbookIdle header={data.header} />;
}
