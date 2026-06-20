import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuestQrCard } from "@/components/templates/guest-qr-card";
import { getGuestQrInfo } from "@/server/queries/guest-qr";

export const metadata: Metadata = {
  title: "QR Check-in · Maritare",
};

// Public per-guest QR page. Guests open this from their WhatsApp invite to show
// the check-in QR. Gated only by the unguessable guest UUID.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const info = await getGuestQrInfo(id);
  if (!info) {
    notFound();
  }
  return <GuestQrCard info={info} />;
}
