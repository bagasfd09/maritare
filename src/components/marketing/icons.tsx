// Inline SVG icons matching the design's exact paths/stroke weights. Kept as a
// small shared set because the up-right arrow, chevron and check repeat across
// the nav, features, pricing and final-CTA sections.
type IconProps = { size?: number; strokeWidth?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor" as const,
});

export function ArrowRight({ size = 14, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ChevronDown({ size = 14, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Check({ size = 24, strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

export function ArrowDown({ size = 12, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function ArrowUp({ size = 11, strokeWidth = 2.6, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

export function Phone({ size = 16, strokeWidth = 1.6, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
