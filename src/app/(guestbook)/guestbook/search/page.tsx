import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GuestbookSearch } from "@/components/templates/guestbook-search";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

export const metadata: Metadata = {
  title: "Cari Tamu · Buku Tamu · Maritare",
};

export default async function Page() {
  // The wedding is derived from the kiosk token inside getKioskData(); a null
  // result (no valid token / kicked) sends the device to the attendant login.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }
  return <GuestbookSearch header={data.header} guests={data.guests} />;
}
