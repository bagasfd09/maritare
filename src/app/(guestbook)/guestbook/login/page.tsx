import type { Metadata } from "next";

import { GuestbookLogin } from "@/components/templates/guestbook-login";

export const metadata: Metadata = {
  title: "Masuk Petugas · Buku Tamu · Maritare",
};

// Public attendant login. `?t=<code>` prefills the code from a share link;
// `?kicked=1` is set when a stale session is bounced here (kicked by another
// device or a revoked token) so we can explain why.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; kicked?: string }>;
}) {
  const { t, kicked } = await searchParams;
  return <GuestbookLogin initialCode={t ?? ""} kicked={kicked === "1"} />;
}
