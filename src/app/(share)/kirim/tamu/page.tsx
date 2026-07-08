import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShareGuests } from "@/components/templates/share-guests";
import { shareBouncePath } from "@/server/share-resolve";
import { getShareGuestsData } from "@/server/queries/share";

export const metadata: Metadata = {
  title: "Dashboard Tamu · Akses Keluarga · Maritare",
};

export default async function Page() {
  const data = await getShareGuestsData();
  if (!data) {
    redirect(await shareBouncePath());
  }
  return <ShareGuests data={data} />;
}
