// Folk Garden ornament kit — the watercolor <img> wrapper (FolkFloral) plus the
// one hand-built SVG still in use, FolkGarland (a small flower-dotted vine
// divider). Colours are baked in; callers only pass {className} for sizing.

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
/* FolkGarland — horizontal vine divider (the one SVG ornament still used)  */
/* ----------------------------------------------------------------------- */

/* Raw bloom bodies (no own <svg>) composed inside FolkGarland. */

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
