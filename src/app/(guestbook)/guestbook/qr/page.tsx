import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GuestbookQr } from "@/components/templates/guestbook-qr";
import { getKioskData } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

export const metadata: Metadata = {
  title: "Pindai QR · Buku Tamu · Maritare",
};

export default async function Page() {
  // Header (couple + live stats) from the kiosk token session; null → no valid
  // token / kicked → send to the attendant login.
  const data = await getKioskData();
  if (!data) {
    redirect(await kioskLoginPath());
  }
  return <GuestbookQr header={data.header} />;
}
