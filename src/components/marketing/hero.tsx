"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FlowerMark } from "./flower-mark";

// Hero footer partners — the script/mono treatment is per the design, not
// alternating (Bridestory + Femina are script; the middle two are mono).
const PARTNERS = [
  { name: "Bridestory", style: "script" },
  { name: "Parents Guide", style: "mono" },
  { name: "The Bride Dept", style: "mono" },
  { name: "Femina", style: "script" },
];

// Word-by-word reveal timing (matches the design's inline transition-delays).
const HEADLINE = [
  { text: "Hari ", delay: 80 },
  { text: "paling ", delay: 160 },
  { text: "pentingmu,", delay: 240, breakAfter: true },
  { text: "dirancang ", delay: 340 },
  { text: "seperti karya.", delay: 420, em: true },
];

export function Hero() {
  const [entered, setEntered] = useState(false);
  const bgRef = useRef<HTMLImageElement>(null);

  // Entrance: flip .entered on the next frame so the CSS word/eyebrow/CTA
  // transitions play in.
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Mouse parallax — eased follow on the hero photo (sets `translate`, leaving
  // the ken-burns `transform` animation untouched).
  useEffect(() => {
    const photo = bgRef.current;
    if (!photo) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      photo.style.translate = `${x}px ${y}px`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = 400;
      tx = ((cx - e.clientX) / cx) * 12;
      ty = ((cy - e.clientY) / cy) * 8;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll parallax — drift the photo down as the hero leaves the viewport.
  useEffect(() => {
    const photo = bgRef.current;
    const hero = photo?.closest<HTMLElement>(".hero");
    if (!photo || !hero) return;
    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      if (r.bottom < 0) return;
      const y = Math.max(0, -r.top);
      photo.style.marginTop = `${y * 0.3}px`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={`hero${entered ? " entered" : ""}`} id="beranda">
      {/* eslint-disable-next-line @next/next/no-img-element -- imperative
          translate/marginTop parallax needs a raw element, not next/image */}
      <img ref={bgRef} className="hero-bg" src="/landing/hero-couple.png" alt="Pasangan Maritare" />
      <div className="hero-shade" />

      <div className="hero-eyebrow">
        <span className="dot" />
        <span>Ditulis di Jakarta</span>
        <span className="pipe" />
        <span>Untuk seluruh Nusantara</span>
      </div>

      <div className="hero-content">
        <h1 className="hero-headline">
          {HEADLINE.map((w, i) => (
            <span key={i}>
              <span className="h-word" style={{ transitionDelay: `${w.delay}ms` }}>
                {w.em ? <em>{w.text}</em> : w.text}
              </span>
              {w.breakAfter && <br />}
            </span>
          ))}
        </h1>
        <p className="hero-subhead">
          Undangan website editorial — bukan template. Kurasi tipografi, komposisi foto, dan
          kalimat yang kamu tulis sendiri.
        </p>
        <div className="hero-cta">
          <Link href="/login?mode=signup" className="btn-primary">
            Rancang undanganmu
            <span className="cta-mark">
              <FlowerMark />
            </span>
          </Link>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="partners">
          {PARTNERS.map((p) => (
            <span key={p.name} className={`partner ${p.style}`}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
