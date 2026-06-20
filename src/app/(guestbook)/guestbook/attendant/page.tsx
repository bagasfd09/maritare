import { redirect } from "next/navigation";

import { GuestbookAttendant } from "@/components/templates/guestbook-attendant";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

export default async function Page() {
  // Stats + recent check-in feed from the kiosk token session; null → no valid
  // token / kicked → send to the attendant login.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }
  return <GuestbookAttendant header={data.header} guests={data.guests} />;
}
