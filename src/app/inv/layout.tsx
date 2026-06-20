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

// /inv is fully public — guests are anonymous, so unlike (guestbook) there is
// deliberately NO auth gate here (proxy.ts also excludes the path).

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

// Crimson Pavilion template fonts (open-licensed Google Fonts): a tall elegant
// display serif + a rounded humanist serif for headings/labels.
const cormorant = Cormorant_Upright({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ovo = Ovo({
  variable: "--font-ovo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Scarlet Editorial template — a clean humanist sans for body/labels, paired
// with the tall Cormorant Upright display serif (already loaded above).
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Folk Garden template — a casual handwritten script for playful accents.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Scarlet (Katsudoto "Anselma & Alvaro") type system — the reference's exact
// fonts: Pinyon Script (calligraphy headings), Lancelot (decorative body),
// Cormorant Garamond (secondary serif). Self-hosted via next/font so they always
// load (the page's Google-Fonts @import was unreliable inside an injected style).
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

export default function InvitationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${instrumentSans.variable} ${cormorant.variable} ${ovo.variable} ${roboto.variable} ${caveat.variable} ${pinyon.variable} ${lancelot.variable} ${cormorantGaramond.variable} font-body antialiased`}
    >
      {children}
    </div>
  );
}
