import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

// Variable fonts — leave `weight` unset so next/font loads the full variable
// axis (300–900) instead of pinned static files. This is what enables
// `font-variation-settings: "opsz" 144` to actually change the optical size
// and give Fraunces its editorial display character.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"], // match the design's Google Fonts URL exactly
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maritare — Pernikahanmu adalah Karya yang Layak Diceritakan",
  description:
    "Undangan website editorial untuk pasangan Indonesia. Kurasi tipografi, komposisi foto, dan kalimat yang kamu tulis sendiri.",
  openGraph: {
    title: "Maritare — Undangan digital editorial",
    description:
      "Bikin undangan pertama dalam 5 menit. Bayar setelah siap publish — tidak sebelumnya.",
    type: "website",
    locale: "id_ID",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`maritare ${fraunces.variable} ${instrumentSans.variable}`}>
      {children}
    </div>
  );
}
