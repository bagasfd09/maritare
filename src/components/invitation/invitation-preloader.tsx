"use client";

// Full-screen opening gate shown the instant an invitation loads, so guests
// never see a half-painted page with images still streaming in. It holds until
// the CRITICAL assets settle — every non-lazy <img> (cover photo, hero, eager
// ornaments), the web fonts, and the window 'load' (CSS backgrounds etc.) — then
// fades out to reveal the invitation behind it. Lazy ornaments are deliberately
// excluded: they only fetch on scroll, so waiting for them would never finish.
//
// Design: imported "Maritare Loader" (wordmark + spinning bloom + progress rail).
// Styles live in globals.css under .inv-loader (matches the other inv-* CSS).

import { useEffect, useState } from "react";

// Show at least briefly so cached pages don't flash the loader for one frame;
// never trap a guest behind it if an asset hangs (broken image, dead network).
const MIN_MS = 600;
const MAX_MS = 8000;
const FADE_MS = 700; // keep in sync with the .inv-loader opacity transition

export function InvitationPreloader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let finished = false;
    const startedAt = performance.now();

    // Critical = currently-rendered images that aren't lazy-loaded.
    const critical = () => Array.from(document.images).filter((img) => img.loading !== "lazy");
    const imgs = critical();
    const total = imgs.length || 1;

    const bump = () => {
      const loaded = imgs.filter((img) => img.complete).length;
      // Cap at 95% until `ready` confirms fonts + window load; finish jumps to 100.
      setProgress((p) => Math.max(p, Math.min(95, (loaded / total) * 95)));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      const wait = Math.max(0, MIN_MS - (performance.now() - startedAt));
      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setGone(true), FADE_MS);
      }, wait);
    };

    // Progress ticks as each image settles (load OR error — a broken image must
    // not stall the bar).
    for (const img of imgs) {
      if (img.complete) continue;
      img.addEventListener("load", bump, { once: true });
      img.addEventListener("error", bump, { once: true });
    }
    bump(); // account for already-cached images

    const ready = Promise.all([
      // every critical image settled
      Promise.all(
        imgs.map(
          (img) =>
            img.complete ||
            new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
        ),
      ),
      // fonts loaded so text doesn't reflow right after the reveal
      document.fonts ? document.fonts.ready : Promise.resolve(),
      // window 'load' covers CSS background images and remaining subresources
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((res) =>
            window.addEventListener("load", () => res(), { once: true }),
          ),
    ]);

    ready.then(finish);
    const safety = window.setTimeout(finish, MAX_MS);
    return () => window.clearTimeout(safety);
  }, []);

  if (gone) return null;

  return (
    <div className={`inv-loader${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      <div className="inv-loader__lockup">
        <h1 className="inv-loader__word">maritare</h1>
        <div className="inv-loader__flower">
          <svg viewBox="-50 -50 100 100" aria-hidden="true">
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <g className={`inv-loader__petal-group p-${i + 1}`}>
                  <path
                    className="inv-loader__petal"
                    d="M 0 -36 C 14 -36 18 -14 0 -2 C -18 -14 -14 -36 0 -36 Z"
                  />
                  <path
                    className="inv-loader__petal-inner"
                    d="M 0 -28 C 6 -28 8 -16 0 -8 C -8 -16 -6 -28 0 -28 Z"
                  />
                </g>
              </g>
            ))}
            <circle className="inv-loader__core" r="9" cx="0" cy="0" />
            <g>
              <circle className="inv-loader__stamen" r="2" cx="0" cy="-3" />
              <circle className="inv-loader__stamen" r="1.6" cx="3.5" cy="2" />
              <circle className="inv-loader__stamen" r="1.6" cx="-3.5" cy="2" />
            </g>
          </svg>
        </div>
      </div>

      <div className="inv-loader__progress">
        <div className="inv-loader__rail">
          <div className="inv-loader__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="inv-loader__pct">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
