// Crimson Pavilion — original SVG line-art ornament set.
//
// The lush PAINTED layer is Crimson's OWN licensed watercolor florals
// (CrimsonFloralImg in crimson-florals.tsx → public/invitation/crimson/florals);
// only the FallingPetals SVG and the scroll Reveal are reused from the Flora
// template. This file adds Crimson's own gold line-art: a monogram emblem, a
// Javanese joglo pavilion silhouette, gold hairline frames/arches and floral
// dividers. All strokes use currentColor so callers tint with text-* utilities.

type OrnamentProps = {
  className?: string;
};

/**
 * Couple monogram — two initials inside a circular gold-hairline emblem with a
 * tiny crown flourish on top and a small leaf spray at the foot. Replaces the
 * reference's photographic gold crest with original line-art.
 */
type MonogramProps = OrnamentProps & {
  left: string;
  right: string;
};

export function CrimsonMonogram({ className, left, right }: MonogramProps) {
  return (
    <svg viewBox="0 0 120 140" fill="none" aria-hidden="true" className={className}>
      <g
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* tiny crown flourish */}
        <path d="M48 16l4 8 8-10 8 10 4-8" />
        <path d="M48 16l-1.5 7M72 16l1.5 7" />
        <circle cx="46.5" cy="13.5" r="1.4" />
        <circle cx="73.5" cy="13.5" r="1.4" />
        <circle cx="60" cy="4" r="1.6" />
        {/* double oval frame */}
        <ellipse cx="60" cy="78" rx="40" ry="48" />
        <ellipse cx="60" cy="78" rx="35" ry="43" />
        {/* leaf spray at the foot */}
        <path d="M44 124c6-3 11-3 16 0 5-3 10-3 16 0" />
        <path d="M50 124c-4-2-6-6-6-10 4 2 6 6 6 10ZM70 124c4-2 6-6 6-10-4 2-6 6-6 10Z" />
      </g>
      {/* the two initials, set in the display serif (gold = currentColor) */}
      <text
        x="44"
        y="92"
        textAnchor="middle"
        className="[font-family:var(--font-cormorant)]"
        fontSize="46"
        fontWeight="500"
        fill="currentColor"
        stroke="none"
      >
        {left}
      </text>
      <text
        x="60"
        y="98"
        textAnchor="middle"
        className="[font-family:var(--font-cormorant)]"
        fontSize="24"
        fontStyle="italic"
        fill="currentColor"
        stroke="none"
      >
        &
      </text>
      <text
        x="78"
        y="92"
        textAnchor="middle"
        className="[font-family:var(--font-cormorant)]"
        fontSize="46"
        fontWeight="500"
        fill="currentColor"
        stroke="none"
      >
        {right}
      </text>
    </svg>
  );
}

/**
 * Javanese joglo pavilion — an elegant gold line-art landmark: a tiered
 * trapezoidal tajug roof on slim pillars, raised on a low base. Original
 * silhouette standing in for the reference's photographic pavilion.
 */
export function CrimsonJoglo({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 240 170" fill="none" aria-hidden="true" className={className}>
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* finial on the ridge */}
        <path d="M120 6v8" />
        <circle cx="120" cy="4" r="2" />
        {/* upper steep tajug roof */}
        <path d="M120 14L150 50H90L120 14Z" />
        {/* roof ridge break */}
        <path d="M90 50h60" />
        {/* lower flared roof — wide eaves with upturned ends */}
        <path d="M150 50C168 56 184 70 196 92C172 86 150 84 120 84C90 84 68 86 44 92C56 70 72 56 90 50" />
        {/* eave underline */}
        <path d="M52 88C84 82 156 82 188 88" />
        {/* entablature beam */}
        <path d="M64 92h112" />
        <path d="M64 98h112" />
        {/* four slim pillars */}
        <path d="M72 98v52M104 98v52M136 98v52M168 98v52" />
        {/* mid-rail between pillars */}
        <path d="M72 124h96" />
        {/* low base / platform */}
        <path d="M48 150h144" />
        <path d="M40 158h160" />
        {/* steps */}
        <path d="M100 150v8M140 150v8" />
      </g>
    </svg>
  );
}

/**
 * Tall gold oval/arch hairline frame for couple profile photos — a slim double
 * line that arches over the top and squares at the foot.
 */
export function CrimsonArchFrame({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 200 250"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1.4" fill="none">
        <path d="M8 248V96C8 47 49 8 100 8C151 8 192 47 192 96V248" />
        <path d="M16 248V96C16 51 54 16 100 16C146 16 184 51 184 96V248" />
      </g>
    </svg>
  );
}

/** Thin gold double-rule card border (for event / gift cards). */
export function CrimsonCardFrame({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <rect x="5" y="5" width="290" height="190" rx="10" />
        <rect x="11" y="11" width="278" height="178" rx="6" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/**
 * Gold divider — a slim rule broken by a centred lotus/rose bud flanked by
 * leaf scrolls. The Crimson section separator.
 */
export function CrimsonDivider({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 260 30" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 15H92" />
        <path d="M168 15H254" />
        {/* scroll curls flanking the centre */}
        <path d="M92 15C100 9 108 11 110 17C112 11 104 7 96 9" />
        <path d="M168 15C160 9 152 11 150 17C148 11 156 7 164 9" />
        {/* leaves */}
        <path d="M114 15C110 11 108 6 109 1C113 4 116 9 114 15Z" />
        <path d="M146 15C150 11 152 6 151 1C147 4 144 9 146 15Z" />
        {/* centre rose bud */}
        <path d="M130 7C126 11 126 19 130 23C134 19 134 11 130 7Z" />
        <path d="M130 9C133 12 133 18 130 21C127 18 127 12 130 9Z" />
        <circle cx="130" cy="15" r="1.5" />
      </g>
    </svg>
  );
}

/**
 * Small corner flourish — a gold scroll with a bud, drawn for the top-left.
 * Rotate via className for other corners.
 */
export function CrimsonCornerScroll({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10C40 14 72 30 92 64C100 78 102 92 100 110" />
        <path d="M10 38C32 44 52 58 62 82" />
        <path d="M40 26C34 20 31 12 32 4C39 9 42 18 40 26Z" />
        <path d="M62 42C54 40 47 35 44 27C52 27 60 33 62 42Z" />
        <path d="M82 66C74 67 66 64 61 57C69 55 78 58 82 66Z" />
        {/* bud at the corner */}
        <path d="M18 16C15 19 15 25 18 28C21 25 21 19 18 16Z" />
        <circle cx="18" cy="22" r="1.4" />
      </g>
    </svg>
  );
}
