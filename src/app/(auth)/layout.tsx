import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

// Same variable-font setup as the marketing layout so the ported design tokens
// (--font-fraunces / --font-instrument, consumed by .maritare in globals.css)
// resolve on the auth route too.
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
  title: "Masuk · Maritare",
  description: "Masuk atau daftar untuk mulai merancang undangan editorialmu.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`maritare ${fraunces.variable} ${instrumentSans.variable}`}>{children}</div>
  );
}
