import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

// Same variable-font setup as the (auth) layout so the editorial type tokens
// (--font-fraunces / --font-instrument → font-display / font-body) resolve on
// the public /invite route. This route is intentionally public (no auth gate):
// the invite token in the URL is the credential.
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
  title: "Undangan tim · Maritare",
  description: "Terima undangan untuk bergabung sebagai admin Maritare.",
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`maritare ${fraunces.variable} ${instrumentSans.variable} font-body antialiased`}>
      {children}
    </div>
  );
}
