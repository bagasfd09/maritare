import { Fraunces, Instrument_Sans } from "next/font/google";

// Editorial fonts + .maritare class so brand type tokens resolve on this public
// route (it sits outside the marketing/auth route groups).
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

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`maritare ${fraunces.variable} ${instrumentSans.variable}`}>{children}</div>
  );
}
