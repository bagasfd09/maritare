"use client";

/* eslint-disable @next/next/no-img-element -- device-screen mockups are
   decorative, fixed-size inside their frames; a raw <img> keeps the markup a
   1:1 port of the design without next/image fill plumbing */

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { FlowerMark } from "./flower-mark";

// Word-by-word reveal timing (matches the design's inline transition-delays).
// Each word renders as an inline-block; an explicit space text node between
// words supplies the gap (a trailing space inside an inline-block collapses).
const HEADLINE = [
  { text: "Undangan", delay: 80 },
  { text: "cantik,", delay: 160, breakAfter: true },
  { text: "tamu", delay: 260 },
  { text: "tercatat", delay: 340 },
  { text: "otomatis.", delay: 420, em: true },
];

export function Hero() {
  const [entered, setEntered] = useState(false);

  // Entrance: flip .entered on the next frame so the CSS eyebrow/word/CTA
  // transitions play in. (The design's mouse/scroll parallax targeted a
  // full-bleed #heroBg photo that this device-showcase hero no longer has, so
  // those handlers are intentionally dropped — they were no-ops here.)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={`hero${entered ? " entered" : ""}`} id="beranda">
      <FlowerMark className="hero-watermark one" inner={false} stamen="none" />
      <FlowerMark className="hero-watermark two" inner={false} stamen="none" />

      <div className="hero-grid">
        {/* LEFT — message */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot" />
            <span>Undangan Website</span>
            <span className="pipe" />
            <span>Buku Tamu Digital</span>
          </div>
          <h1 className="hero-headline">
            {HEADLINE.map((w, i) => (
              <Fragment key={i}>
                <span className="h-word" style={{ transitionDelay: `${w.delay}ms` }}>
                  {w.em ? <em>{w.text}</em> : w.text}
                </span>
                {w.breakAfter ? <br /> : i < HEADLINE.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className="hero-subhead">
            Tamu kamu buka undangan website yang indah lewat ponsel. Kamu pegang buku tamu
            digital yang mencatat kehadiran real-time di hari-H. Satu link, semuanya beres.
          </p>
          <div className="hero-cta">
            <Link href="/login?mode=signin" className="btn-primary">
              Rancang undanganmu
              <span className="cta-mark">
                <FlowerMark />
              </span>
            </Link>
          </div>
        </div>

        {/* RIGHT — device stage */}
        <div className="hero-stage">
          {/* floating live check-in toast */}
          <div className="hero-toast">
            <span className="t-av">SW</span>
            <div>
              <div className="t-name">Sinta Wijaya</div>
              <div className="t-sub">Baru saja check-in</div>
            </div>
          </div>

          {/* iPad: Buku Tamu — layar selamat datang (idle) */}
          <div className="device-ipad">
            <div className="screen">
              <div className="gbi">
                <FlowerMark className="gbi-watermark one" inner={false} stamen="none" />
                <FlowerMark className="gbi-watermark two" inner={false} stamen="none" />

                <div className="gbi-logo">
                  <FlowerMark inner={false} stamen="none" />
                  <span className="wm">Maritare</span>
                </div>
                <div className="gbi-counter">
                  <div className="c-lbl">Tamu hadir</div>
                  <div className="c-num">
                    142 <span>/ 280</span>
                  </div>
                </div>

                <div className="gbi-eyebrow">
                  <span className="r" />
                  <span className="t">Resepsi Pernikahan</span>
                  <span className="r" />
                </div>

                <div className="gbi-center">
                  <h1 className="gbi-name">Kiki</h1>
                  <h1 className="gbi-name">
                    <span className="amp">&amp;</span> Bagas
                  </h1>
                  <div className="gbi-rule" />
                  <div className="gbi-ctx">14 Juni 2026 · Pendopo Kayon</div>
                </div>

                <div className="gbi-bottom">
                  <span className="gbi-cta">
                    Sentuh untuk check-in
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <div className="gbi-hint">Tulis nama atau pindai QR dari undangan</div>
                </div>
              </div>
            </div>
          </div>

          {/* iPhone: contoh undangan */}
          <div className="device-iphone">
            <span className="island" />
            <div className="screen">
              <img src="/invitation/folk/cover.webp" alt="Contoh undangan website Maritare" />
              <div className="iphone-shade" />
              <div className="iphone-cta">Buka Undangan</div>
            </div>
          </div>

          {/* floating stat chip */}
          <div className="hero-statchip">
            <div className="sc-num">
              +38<span style={{ fontSize: "0.62em", letterSpacing: 0 }}>%</span>
            </div>
            <div className="sc-lbl">RSVP minggu ini</div>
          </div>
        </div>
      </div>

      <div className="hero-stage-end" />
    </section>
  );
}
