// Decorative SVG flower placed inside a card. Slow sway animation, subtle
// opacity. Sage outline by default; burgundy on .filled cards; peach on
// .wide cards (handled via parent CSS selectors).

type CardFlowerProps = {
  /** CSS position styles applied to the absolute-positioned wrapper. */
  position?: React.CSSProperties;
  /** Override default petal/core color (sage). */
  color?: "sage" | "burgundy" | "peach";
  /** Sway animation delay so adjacent cards aren't synchronized. */
  delay?: number;
  /** Override default opacity (0.22). */
  opacity?: number;
};

const colorMap = {
  sage: "var(--color-sage)",
  burgundy: "var(--color-burgundy)",
  peach: "var(--color-peach)",
};

export function CardFlower({
  position = { top: -24, right: -24, width: 120, height: 120 },
  color = "sage",
  opacity = 0.22,
}: CardFlowerProps) {
  const stroke = colorMap[color];

  return (
    <span
      aria-hidden
      className="card-flower"
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
        // Sway animation removed — 7 cards × continuous infinite rotation
        // was adding compositor work for negligible visual gain.
        ...position,
      }}
    >
      <svg
        viewBox="-50 -50 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible", display: "block" }}
      >
        {[0, 72, 144, 216, 288].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path
              d="M 0 -42 C 18 -42 22 -16 0 -2 C -22 -16 -18 -42 0 -42 Z"
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        ))}
        <circle r="10" cx="0" cy="0" fill="none" stroke={stroke} strokeWidth={1.5} />
      </svg>
    </span>
  );
}
