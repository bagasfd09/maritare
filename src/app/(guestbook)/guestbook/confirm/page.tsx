import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuestbookConfirm } from "@/components/templates/guestbook-confirm";
import { getKioskGuest } from "@/server/queries/guestbook";

export const metadata: Metadata = {
  title: "Konfirmasi · Buku Tamu · Maritare",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const { guest } = await searchParams;

  // No guest id → nothing to confirm. getKioskGuest also returns null for a
  // malformed id or one that doesn't belong to the session-owned wedding
  // (ownership scoped in the WHERE clause), so a forged id never leaks.
  if (!guest) {
    redirect("/guestbook/search");
  }

  const data = await getKioskGuest(guest);
  if (!data) {
    redirect("/guestbook/search");
  }

  // key forces a fresh client component per guest so useState initializers
  // (stepper/food) re-seed when navigating between different guests.
  return <GuestbookConfirm key={data.guest.id} header={data.header} guest={data.guest} />;
}
