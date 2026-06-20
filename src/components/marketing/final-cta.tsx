"use client";

/* eslint-disable @next/next/no-img-element -- decorative floating photos are
   animated imperatively (.shown / .bob) and don't need next/image */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FlowerMark } from "./flower-mark";
import { ArrowUpRight } from "./icons";
import { floatPhotos } from "./data";

function Orn({ pos }: { pos: "tl" | "br" }) {
  return (
    <span className={`final-orn ${pos}`} aria-hidden>
      <svg viewBox="-50 -50 100 100">
        {[0, 72, 144, 216, 288].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path className="or-petal" d="M 0 -42 C 18 -42 22 -16 0 -2 C -22 -16 -18 -42 0 -42 Z" />
          </g>
        ))}
        <circle className="or-core" cx="0" cy="0" r="6" />
      </svg>
    </span>
  );
}

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);

  // Ports finalCTA(): once the section is in view, fade the photos in largest
  // first (120ms stagger), then start each bobbing 900ms later.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const photos = Array.from(section.querySelectorAll<HTMLElement>(".float-photo"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const sorted = [...photos].sort(
            (a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight,
          );
          sorted.forEach((p, i) => {
            setTimeout(() => {
              p.classList.add("shown");
              setTimeout(() => p.classList.add("bob"), 900);
            }, i * 120);
          });
          io.unobserve(section);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section className="final" id="finalCta" ref={sectionRef}>
      <Orn pos="tl" />
      <Orn pos="br" />

      {floatPhotos.map((p, i) => (
        <span
          key={i}
          className={`float-photo fp${i + 1}`}
          style={{ "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as React.CSSProperties}
        >
          <img src={p.src} alt="" />
        </span>
      ))}

      <div className="final-card reveal">
        <span className="corner tl" aria-hidden />
        <span className="corner tr" aria-hidden />
        <span className="corner bl" aria-hidden />
        <span className="corner br" aria-hidden />

        <div className="final-stamp" aria-hidden>
          <span className="s-top">Maritare</span>
          <FlowerMark className="s-flower" inner={false} coreR={7} stamen="center" />
          <span className="s-mid">Est.</span>
          <span className="s-bot">MMXXIV</span>
        </div>

        <div className="final-eyebrow">Sebuah Undangan</div>
        <h2>
          Mulai tulis<br />
          <em>hari bahagiamu.</em>
        </h2>
        <p className="final-lede">
          Rancang undangan pertama kalian dalam lima menit. Bayar hanya saat siap publish — tidak
          sebelumnya.
        </p>

        <div className="final-divider">
          <span className="d-rule" />
          <FlowerMark coreR={7} stamen="center" />
          <span className="d-rule" />
        </div>

        <div className="final-cta-row">
          <Link href="/login?mode=signup" className="final-cta-primary">
            Rancang Undanganmu
            <span className="arrow-circle">
              <ArrowUpRight size={14} strokeWidth={2} />
            </span>
          </Link>
          <a href="#harga" className="final-cta-link">
            atau lihat harga lengkap
          </a>
        </div>

        <div className="final-signoff">Dengan rasa, dari Maritare</div>
      </div>
    </section>
  );
}
