import { redirect } from "next/navigation";

import { GuestbookThankYou } from "@/components/templates/guestbook-thankyou";
import { getKioskData, getKioskGuest } from "@/server/queries/guestbook";
import { kioskLoginPath } from "@/lib/guestbook-session";

// Next.js 16: searchParams is async. `?guest=` is read server-side via the
// token-scoped getter, so a foreign id resolves to null. We still resolve the
// kiosk token for the header and redirect to login when there is none, so a
// kicked/invalid device is never shown the prototype mock.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const { guest } = await searchParams;
  const scoped = guest ? await getKioskGuest(guest) : null;
  const header = scoped?.header ?? (await getKioskData())?.header ?? null;
  if (!header) {
    redirect(await kioskLoginPath());
  }

  return <GuestbookThankYou header={header} guest={scoped?.guest ?? null} />;
}
