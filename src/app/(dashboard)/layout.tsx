import type { Metadata } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  Cormorant_Upright,
  Fraunces,
  Instrument_Sans,
  Lancelot,
  Ovo,
  Pinyon_Script,
  Roboto,
} from "next/font/google";
import { redirect } from "next/navigation";

import { AssistBanner } from "@/components/molecules/assist-banner";
import { auth } from "@/lib/auth";
import { resolveAssistWeddingId } from "@/server/queries/wedding";

// Variable fonts — full axis (weight unset) so `font-variation-settings` works.
// Exposed as --font-fraunces / --font-instrument, which @theme maps to
// --font-display / --font-body (the `font-display` / `font-body` utilities).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Invitation-template fonts — mirror the /inv layout so the editor's LIVE PREVIEW
// renders with the SAME fonts as the published page (otherwise the template's
// --font-* CSS vars are undefined in the dashboard tree and fall back to serif).
const cormorant = Cormorant_Upright({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const ovo = Ovo({ variable: "--font-ovo", subsets: ["latin"], weight: "400", display: "swap" });
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const lancelot = Lancelot({
  variable: "--font-lancelot",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard · Maritare",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Authoritative gate: Proxy only does an optimistic cookie check, so verify
  // the real session here before rendering the authenticated area.
  // NOTE: on config errors Auth.js returns a truthy error object instead of a
  // session, so the check must require session.user — never just truthiness.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  // Role separation: admins belong in /admin, not the customer dashboard — the
  // ONE exception is an active "bantu edit" session (admin helping a customer
  // fill their invitation). The proxy narrows which dashboard pages that allows.
  const assistedWeddingId = session.user.role === "admin" ? await resolveAssistWeddingId() : null;
  if (session.user.role === "admin" && !assistedWeddingId) {
    redirect("/admin");
  }

  return (
    <div
      className={`${fraunces.variable} ${instrumentSans.variable} ${cormorant.variable} ${ovo.variable} ${roboto.variable} ${caveat.variable} ${pinyon.variable} ${lancelot.variable} ${cormorantGaramond.variable}`}
    >
      {assistedWeddingId && <AssistBanner weddingId={assistedWeddingId} />}
      {children}
    </div>
  );
}
