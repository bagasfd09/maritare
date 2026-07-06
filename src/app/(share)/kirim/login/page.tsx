import type { Metadata } from "next";

import { ShareLogin } from "@/components/templates/share-login";

export const metadata: Metadata = {
  title: "Masuk · Kirim Undangan · Maritare",
};

// Public family login. `?t=<code>` prefills the code from a share link;
// `?expired=1` = the 1-hour window ended, `?kicked=1` = the session was taken
// over by another device or the token was revoked/regenerated.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; expired?: string; kicked?: string }>;
}) {
  const { t, expired, kicked } = await searchParams;
  const reason = expired === "1" ? "expired" : kicked === "1" ? "kicked" : null;
  return <ShareLogin initialCode={t ?? ""} reason={reason} />;
}
