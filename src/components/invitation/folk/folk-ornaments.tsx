// Folk Garden ornament kit.
//
// ORIGINAL flat naive-folk floral SVGs — solid fills with simple shading, in
// the Folk palette. Unlike Flora (photographic watercolor scans) these are
// hand-built illustrated shapes: charming, slightly irregular, "folk feel".
// Every component takes {className} for sizing/positioning/rotation on the
// wrapper <svg>. Colours are baked in (these are coloured illustrations), so
// callers do not tint them — though `FolkGarland` uses palette constants too.
//
// Palette anchors used below:
//   magenta #9E2B62 / deep #7A1E48 · olive #52602F / dark #3C471F / sage #8A9A5B
//   sunflower #E8A33D · amber #D98324 · cream #F5EFE0 · blush #E8A0B8
//   periwinkle #8AA0D8

type OrnamentProps = {
  className?: string;
};

/* ----------------------------------------------------------------------- */
/* Watercolor floral assets (user's own transparent webp)                   */
/* ----------------------------------------------------------------------- */

// Filenames under public/invitation/folk/garden/*.webp (see README there).
export type FolkFloralName =
  | "burgundy-roses-bouquet"
  | "babys-breath-bouquet"
  | "hibiscus-peony-arrangement"
  | "peony-alstroemeria-bouquet"
  | "pastel-chrysanthemum-bouquet"
  | "flowers-on-rock"
  | "bee-balm-red"
  | "lily-red"
  | "calendula-orange"
  | "trumpet-vine-orange"
  | "peony-pink"
  | "calla-lily-white"
  | "white-umbel-cluster"
  | "grass-border"
  | "green-leaves-branch"
  | "gold-ornament"
  | "tree-green-01"
  | "landscape-watercolor";

type FolkFloralProps = {
  name: FolkFloralName;
  className?: string;
  /** Decorative by default; set false only when the image carries meaning. */
  decorative?: boolean;
  /** Map the alpha edge cleanly onto any surface; lazy by default. */
  alt?: string;
};

/**
 * Thin <img> wrapper for the lush watercolor florals. These ship with a real
 * alpha channel so they composite cleanly over cream/magenta/olive surfaces —
 * the recurring visual motif that ties every Folk section together. Render as
 * a plain <img> (not next/image) to keep them off the optimizer, matching the
 * existing folk/cover pattern.
 */
export function FolkFloral({ name, className, decorative = true, alt = "" }: FolkFloralProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static watercolor asset; plain img keeps it off the optimizer and preserves the transparent webp alpha
    <img
      src={`/invitation/folk/garden/${name}.webp`}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      loading="lazy"
      draggable={false}
      className={className}
    />
  );
}

/* ----------------------------------------------------------------------- */
/* Single blooms                                                            */
/* ----------------------------------------------------------------------- */

/** Big orange sunflower — petal ring + brown seed center. */
export function FolkSunflower({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* outer petal ring (slightly irregular, two tones) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const deg = i * 30 + (i % 2 === 0 ? 0 : 4);
        const fill = i % 2 === 0 ? "#E8A33D" : "#D98324";
        return (
          <path
            key={i}
            d="M32 9C35.4 14 35.4 21 32 27C28.6 21 28.6 14 32 9Z"
            fill={fill}
            transform={`rotate(${deg} 32 32)`}
          />
        );
      })}
      {/* seed center */}
      <circle cx="32" cy="32" r="11" fill="#6B4A1E" />
      <circle cx="32" cy="32" r="11" fill="#3C471F" fillOpacity="0.25" />
      {/* seed dots */}
      {[
        [32, 32],
        [28, 30],
        [36, 30],
        [30, 35],
        [34, 35],
        [32, 27],
        [27, 33],
        [37, 33],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.1" fill="#E8A33D" fillOpacity="0.7" />
      ))}
    </svg>
  );
}

/** Cream daisy — rounded petals around a gold button. */
export function FolkDaisy({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse
          key={i}
          cx="24"
          cy="11"
          rx="3.6"
          ry="7"
          fill="#F5EFE0"
          stroke="#E0D6BE"
          strokeWidth="0.6"
          transform={`rotate(${i * 40} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="6" fill="#E8A33D" />
      <circle cx="24" cy="24" r="6" fill="#D98324" fillOpacity="0.3" />
    </svg>
  );
}

/** Magenta/pink folk tulip. */
export function FolkTulip({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 40 56" fill="none" aria-hidden="true" className={className}>
      {/* stem + leaf */}
      <path d="M20 28C20 38 20 46 20 54" stroke="#52602F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 44C14 42 9 44 7 50C13 51 18 49 20 44Z" fill="#8A9A5B" />
      {/* tulip cup: three lobes */}
      <path d="M9 24C9 13 14 6 20 6C26 6 31 13 31 24C31 30 26 33 20 33C14 33 9 30 9 24Z" fill="#9E2B62" />
      <path d="M20 6C17 11 15 18 15 33C12 31 9 28 9 24C9 14 14 6 20 6Z" fill="#7A1E48" />
      <path d="M20 6C23 11 25 18 25 33C28 31 31 28 31 24C31 14 26 6 20 6Z" fill="#E8A0B8" fillOpacity="0.55" />
    </svg>
  );
}

/** Periwinkle forget-me-not cluster (folk "bud"). */
export function FolkBud({ className }: OrnamentProps) {
  const flower = (cx: number, cy: number, r: number) => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <circle
          key={i}
          cx={cx + Math.cos((i * 72 * Math.PI) / 180) * r}
          cy={cy + Math.sin((i * 72 * Math.PI) / 180) * r}
          r={r * 0.62}
          fill="#8AA0D8"
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#E8A33D" />
    </>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path d="M24 46C20 38 17 30 18 22" stroke="#52602F" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 46C28 39 31 33 31 25" stroke="#52602F" strokeWidth="1.8" strokeLinecap="round" />
      {flower(15, 16, 5)}
      {flower(31, 14, 4.4)}
      {flower(24, 8, 4)}
    </svg>
  );
}

/** Olive leafy vine spray. */
export function FolkLeafSpray({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path d="M8 56C20 48 30 34 36 12" stroke="#3C471F" strokeWidth="2" strokeLinecap="round" />
      {[
        { d: "M30 30C24 30 19 27 16 21C23 20 29 24 30 30Z", f: "#52602F" },
        { d: "M33 22C39 19 42 13 42 6C35 9 32 15 33 22Z", f: "#8A9A5B" },
        { d: "M27 40C21 39 16 35 14 29C21 29 27 33 27 40Z", f: "#8A9A5B" },
        { d: "M20 48C15 46 11 42 10 36C16 37 21 42 20 48Z", f: "#52602F" },
        { d: "M36 16C41 13 44 8 44 2C39 5 35 10 36 16Z", f: "#52602F" },
      ].map((leaf, i) => (
        <path key={i} d={leaf.d} fill={leaf.f} />
      ))}
    </svg>
  );
}

/** The little gabled house from the reference — cream walls, magenta roof. */
export function FolkHouse({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 64 56" fill="none" aria-hidden="true" className={className}>
      {/* little green ground knoll */}
      <ellipse cx="32" cy="50" rx="26" ry="6" fill="#8A9A5B" fillOpacity="0.6" />
      {/* walls */}
      <rect x="16" y="28" width="32" height="22" rx="1.5" fill="#F5EFE0" stroke="#E0D6BE" strokeWidth="1" />
      {/* roof */}
      <path d="M12 30L32 12L52 30Z" fill="#9E2B62" />
      <path d="M12 30L32 12L32 30Z" fill="#7A1E48" />
      {/* door */}
      <path d="M27 50V40C27 37.8 28.8 36 31 36H33C35.2 36 37 37.8 37 40V50Z" fill="#9E2B62" />
      {/* windows */}
      <rect x="19.5" y="33" width="5" height="5" rx="0.6" fill="#8AA0D8" />
      <rect x="39.5" y="33" width="5" height="5" rx="0.6" fill="#8AA0D8" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Composed clusters                                                        */
/* ----------------------------------------------------------------------- */

/**
 * A corner bouquet composing several blooms + leaves, drawn for a top-left
 * placement. Mirror with `-scale-x-100` on the wrapper for the right side.
 */
export function FolkBorderCluster({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      {/* leafy backbone vines fanning out of the corner */}
      <path d="M6 18C30 26 52 44 66 78" stroke="#3C471F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 44C28 50 44 64 54 90" stroke="#52602F" strokeWidth="2" strokeLinecap="round" />
      {/* leaves along the vines */}
      {[
        "M30 34C24 32 20 27 19 20C26 21 31 27 30 34Z",
        "M46 50C40 48 36 43 35 36C42 37 47 43 46 50Z",
        "M28 58C22 58 17 55 14 49C21 48 27 52 28 58Z",
        "M44 74C38 75 33 73 30 67C37 65 43 69 44 74Z",
      ].map((d, i) => (
        <path key={i} d={d} fill={i % 2 === 0 ? "#52602F" : "#8A9A5B"} />
      ))}

      {/* sunflower near the corner */}
      <g transform="translate(8 8) scale(0.62)">
        <FolkSunflowerRaw />
      </g>
      {/* tulip */}
      <g transform="translate(40 6) scale(0.5)">
        <FolkTulipRaw />
      </g>
      {/* daisy */}
      <g transform="translate(54 56) scale(0.7)">
        <FolkDaisyRaw />
      </g>
      {/* periwinkle dots */}
      {[
        [70, 84],
        [60, 96],
        [76, 92],
      ].map(([cx, cy], i) => (
        <g key={i}>
          {Array.from({ length: 5 }).map((_, p) => (
            <circle
              key={p}
              cx={cx + Math.cos((p * 72 * Math.PI) / 180) * 3.6}
              cy={cy + Math.sin((p * 72 * Math.PI) / 180) * 3.6}
              r="2.3"
              fill="#8AA0D8"
            />
          ))}
          <circle cx={cx} cy={cy} r="1.8" fill="#E8A33D" />
        </g>
      ))}
    </svg>
  );
}

/* Raw bloom bodies (no own <svg>) reused inside FolkBorderCluster / FolkGarland. */

function FolkSunflowerRaw() {
  return (
    <g transform="translate(-32 -32)">
      {Array.from({ length: 12 }).map((_, i) => {
        const deg = i * 30 + (i % 2 === 0 ? 0 : 4);
        const fill = i % 2 === 0 ? "#E8A33D" : "#D98324";
        return (
          <path
            key={i}
            d="M32 9C35.4 14 35.4 21 32 27C28.6 21 28.6 14 32 9Z"
            fill={fill}
            transform={`rotate(${deg} 32 32)`}
          />
        );
      })}
      <circle cx="32" cy="32" r="11" fill="#6B4A1E" />
    </g>
  );
}

function FolkDaisyRaw() {
  return (
    <g transform="translate(-24 -24)">
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse
          key={i}
          cx="24"
          cy="11"
          rx="3.6"
          ry="7"
          fill="#F5EFE0"
          stroke="#E0D6BE"
          strokeWidth="0.6"
          transform={`rotate(${i * 40} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="6" fill="#E8A33D" />
    </g>
  );
}

function FolkTulipRaw() {
  return (
    <g transform="translate(-20 -28)">
      <path d="M20 28C20 38 20 46 20 54" stroke="#52602F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 44C14 42 9 44 7 50C13 51 18 49 20 44Z" fill="#8A9A5B" />
      <path d="M9 24C9 13 14 6 20 6C26 6 31 13 31 24C31 30 26 33 20 33C14 33 9 30 9 24Z" fill="#9E2B62" />
      <path d="M20 6C17 11 15 18 15 33C12 31 9 28 9 24C9 14 14 6 20 6Z" fill="#7A1E48" />
    </g>
  );
}

/**
 * Horizontal garland divider — a gentle olive vine with alternating little
 * flowers (sunflower · daisy · periwinkle), replacing Flora's line divider.
 */
export function FolkGarland({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 240 40" fill="none" aria-hidden="true" className={className}>
      {/* swooping vine */}
      <path
        d="M6 20C40 8 60 32 92 20C120 9 124 31 152 20C184 7 200 33 234 20"
        stroke="#52602F"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* little leaves */}
      {[
        { x: 48, m: false },
        { x: 110, m: true },
        { x: 178, m: false },
      ].map((leaf, i) => (
        <path
          key={i}
          d="M0 0C-5 -2 -8 -6 -8 -12C-2 -11 2 -6 0 0Z"
          fill="#8A9A5B"
          transform={`translate(${leaf.x} 18) ${leaf.m ? "scale(-1 1)" : ""}`}
        />
      ))}
      {/* center sunflower */}
      <g transform="translate(120 20) scale(0.34)">
        <FolkSunflowerRaw />
      </g>
      {/* flanking daisies */}
      <g transform="translate(74 20) scale(0.42)">
        <FolkDaisyRaw />
      </g>
      <g transform="translate(166 20) scale(0.42)">
        <FolkDaisyRaw />
      </g>
      {/* periwinkle end dots */}
      {[
        [18, 19],
        [222, 19],
      ].map(([cx, cy], i) => (
        <g key={i}>
          {Array.from({ length: 5 }).map((_, p) => (
            <circle
              key={p}
              cx={cx + Math.cos((p * 72 * Math.PI) / 180) * 3}
              cy={cy + Math.sin((p * 72 * Math.PI) / 180) * 3}
              r="2"
              fill="#8AA0D8"
            />
          ))}
          <circle cx={cx} cy={cy} r="1.5" fill="#E8A33D" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Scattered watermark sprig — a faint single leaf+flower used as the olive
 * page's background texture (placed at low opacity by callers).
 */
export function FolkWatermark({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className={className}>
      <path d="M20 70C34 58 44 40 48 16" stroke="#3C471F" strokeWidth="2" strokeLinecap="round" />
      {[
        "M40 40C33 40 27 36 24 28C32 27 39 32 40 40Z",
        "M44 28C51 25 55 18 55 10C47 13 43 20 44 28Z",
        "M34 52C28 50 23 46 22 39C29 39 35 45 34 52Z",
      ].map((d, i) => (
        <path key={i} d={d} fill="#3C471F" />
      ))}
      <g transform="translate(50 10) scale(0.5)">
        <FolkSunflowerRaw />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Unifying section heading — the recurring motif                           */
/* ----------------------------------------------------------------------- */

type FolkSectionHeadingProps = {
  /** Caveat script eyebrow, e.g. "Mempelai". */
  eyebrow: string;
  /** Heading body (can include emphasis spans). */
  children: React.ReactNode;
  /** Tint set for cream cards (magenta heading) vs olive page (cream heading). */
  tone?: "onCream" | "onOlive" | "onMagenta";
};

/**
 * Recurring section header used across every Folk section: a small gold
 * Javanese ornament hangs above a Caveat eyebrow and a Fraunces heading. The
 * shared ornament is what makes the sections read as one family.
 */
export function FolkSectionHeading({ eyebrow, children, tone = "onOlive" }: FolkSectionHeadingProps) {
  const eyebrowColor = tone === "onMagenta" ? "#E8A0B8" : "#E8A33D";
  const titleColor = tone === "onOlive" ? "#F5EFE0" : tone === "onMagenta" ? "#F5EFE0" : "#9E2B62";
  return (
    <div className="text-center">
      <FolkFloral name="gold-ornament" className="mx-auto mb-2 h-12 w-auto opacity-90" />
      <p
        className="[font-family:var(--font-caveat)] text-[22px] font-semibold"
        style={{ color: eyebrowColor }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-1 font-display text-[26px] font-bold tracking-[-0.02em] [font-variation-settings:'opsz'_96]"
        style={{ color: titleColor }}
      >
        {children}
      </h2>
    </div>
  );
}
