"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";

// Shared SVG geometry for the auth/forgot screens.
export const PETAL = "M 0 -36 C 14 -36 18 -14 0 -2 C -18 -14 -14 -36 0 -36 Z";
export const PETAL_IN = "M 0 -28 C 6 -28 8 -16 0 -8 C -8 -16 -6 -28 0 -28 Z";
export const OR_PETAL = "M 0 -42 C 18 -42 22 -16 0 -2 C -22 -16 -18 -42 0 -42 Z";
export const ANGLES = [0, 72, 144, 216, 288];
const PETAL_COLORS = ["#EAD3C2", "#D4906F", "#B66B4D", "#C8CAB0"];

// Small flower beside the "maritare" wordmark (classed p/pi/c/s — colored by
// .brand-logo .fm in globals.css).
function LogoFlower() {
  return (
    <span className="fm" aria-hidden>
      <svg viewBox="-50 -50 100 100">
        {ANGLES.map((d) => (
          <g key={d} transform={`rotate(${d})`}>
            <path className="p" d={PETAL} />
            <path className="pi" d={PETAL_IN} />
          </g>
        ))}
        <circle className="c" r="9" cx="0" cy="0" />
        <circle className="s" r="2" cx="0" cy="-3" />
        <circle className="s" r="1.6" cx="3.5" cy="2" />
        <circle className="s" r="1.6" cx="-3.5" cy="2" />
      </svg>
    </span>
  );
}

// The decorative flower ornament in the top-right of the form panel.
export function FormOrnament() {
  return (
    <span className="form-ornament" aria-hidden>
      <svg viewBox="-50 -50 100 100">
        {ANGLES.map((d) => (
          <g key={d} transform={`rotate(${d})`}>
            <path className="or-petal" d={OR_PETAL} />
          </g>
        ))}
        <circle className="or-core" r="10" cx="0" cy="0" />
      </svg>
    </span>
  );
}

type Stat = { num: string; lbl: string };
type BrandPanelProps = {
  eyebrow: { mid: string; right: string };
  tag: React.ReactNode;
  stats?: Stat[];
};

// The left brand/animation panel, shared by the sign-in and forgot-password
// screens. Drifting petals are built imperatively (random, client-only) so
// there's no SSR/hydration mismatch and no setState-in-effect.
export function BrandPanel({ eyebrow, tag, stats }: BrandPanelProps) {
  const petalSkyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sky = petalSkyRef.current;
    if (!sky) return;
    const svg =
      '<svg viewBox="-50 -50 100 100" aria-hidden="true"><path d="M 0 -38 C 16 -38 22 -14 0 -2 C -22 -14 -16 -38 0 -38 Z"/></svg>';
    let html = "";
    for (let i = 0; i < 14; i++) {
      const x0 = `${Math.round(Math.random() * 100)}%`;
      const dx = `${Math.random() * 120 - 60}px`;
      const dx2 = `${Math.random() * 120 - 60}px`;
      const s = (Math.random() * 0.8 + 0.6).toFixed(2);
      const dur = `${Math.random() * 14 + 12}s`;
      const delay = `${-Math.random() * 16}s`;
      const c = PETAL_COLORS[i % PETAL_COLORS.length];
      const o = (Math.random() * 0.3 + 0.4).toFixed(2);
      html += `<div class="pp" style="--x0:${x0};--dx:${dx};--dx2:${dx2};--s:${s};--dur:${dur};--delay:${delay};--ppc:${c};--ppo:${o};--max-o:${o}">${svg}</div>`;
    }
    sky.innerHTML = html;
  }, []);

  return (
    <aside className="auth-brand">
      <span className="brand-grain" aria-hidden />
      <span className="brand-grid" aria-hidden />
      <div className="petal-sky" aria-hidden ref={petalSkyRef} />

      <div className="brand-top">
        <div className="l">
          <Link href="/" className="brand-logo">
            maritare
            <LogoFlower />
          </Link>
        </div>
        <Link href="/" className="back-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Beranda
        </Link>
      </div>

      <div className="v-bloom">
        <div className="bloom-eyebrow">
          <span className="dot" />
          <span>{eyebrow.mid}</span>
          <span className="pipe" />
          <span>{eyebrow.right}</span>
        </div>

        <div className="bloom-wordmark">
          <h1 className="brand">
            {"maritare".split("").map((ch, i) => (
              <span key={i} className="letter" style={{ animationDelay: `${0.06 + i * 0.08}s` }}>
                {ch}
              </span>
            ))}
          </h1>

          <div className="bloom-flower" id="bloomFlower">
            <svg viewBox="-50 -50 100 100" aria-hidden>
              {ANGLES.map((d, i) => (
                <g key={d} transform={`rotate(${d})`}>
                  <g className={`petal-group p-${i + 1}`}>
                    <path className="petal" d={PETAL} />
                    <path className="petal-inner" d={PETAL_IN} />
                  </g>
                </g>
              ))}
              <circle className="core core-anim" r="9" cx="0" cy="0" />
              <g className="stamen-anim">
                <circle className="stamen" r="2" cx="0" cy="-3" />
                <circle className="stamen" r="1.6" cx="3.5" cy="2" />
                <circle className="stamen" r="1.6" cx="-3.5" cy="2" />
              </g>
            </svg>
          </div>
        </div>

        <p className="bloom-tag">
          <span className="rule" />
          {tag}
        </p>
      </div>

      {stats && stats.length > 0 && (
        <div className="bloom-stat">
          {stats.map((s, i) => (
            <Fragment key={s.lbl}>
              {i > 0 && <span className="sep" />}
              <div className="cell">
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            </Fragment>
          ))}
        </div>
      )}

    </aside>
  );
}
