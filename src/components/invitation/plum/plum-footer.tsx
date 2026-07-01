// Plum footer — Maritare brand credit. Verbatim Kinanti <section.footer> wrapper
// (class names match the scoped .plum-inv CSS, which styles .footer-inner /
// .footer-inner p), with the Katsudoto branding ("Powered by" + the footer-logo
// SVG + katsudoto.id link) replaced by the Maritare flower mark + wordmark +
// link. This brand swap is the one intentional non-verbatim part of the port
// (mirrors sienna-/ivory-/folk-footer's Maritare credit). Static; always renders.

import { FlowerMark } from "@/components/atoms/flower-mark";

export function PlumFooter() {
  return (
    <section className="footer" data-section-footer="">
      <div className="footer-inner ">
        <a
          href="https://maritare.id"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            textDecoration: "none",
          }}
        >
          {/* Maritare flower glyph — tinted to the footer's text color so it stays
              monochrome-in-theme like the original logo. */}
          <FlowerMark
            size={40}
            color="var(--button-text-primary)"
            core="var(--button-text-primary)"
            stamen="var(--button-text-primary)"
          />
          <p>Maritare</p>
        </a>
      </div>
    </section>
  );
}
