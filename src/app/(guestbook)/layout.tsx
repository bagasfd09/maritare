import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

// Variable fonts — full axis (weight unset) so `font-variation-settings` works.
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

export const metadata: Metadata = {
  title: "Buku Tamu · Maritare",
};

export default function GuestbookLayout({ children }: { children: React.ReactNode }) {
  // No gate here. The kiosk is gated SOLELY by the Petugas Resepsi token
  // (gb_session); the dashboard/owner login never grants kiosk access. The login
  // page itself (/guestbook/login) must render to anonymous visitors. The
  // optimistic cookie check lives in the proxy; the authoritative check is per
  // page (each kiosk getter resolves the token and the page redirects to
  // /guestbook/login when it returns null).
  return <div className={`${fraunces.variable} ${instrumentSans.variable}`}>{children}</div>;
}
