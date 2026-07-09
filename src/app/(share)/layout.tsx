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
  title: "Kirim Undangan · Maritare",
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  // No gate here — mirrors the guestbook layout. The quick-send pages are gated
  // SOLELY by the share-token session; the login page must render to anonymous
  // visitors. The optimistic cookie check lives in the proxy; the authoritative
  // check is per page (getShareSendData() → redirect to /kirim/login on null).
  return <div className={`${fraunces.variable} ${instrumentSans.variable}`}>{children}</div>;
}
