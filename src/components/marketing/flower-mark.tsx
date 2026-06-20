// The Maritare flower mark. Emits the design's class-based SVG (fm-petal /
// fm-petal-in / fm-core / fm-stamen) with NO inline fills — colors come from
// the --mark-* CSS variables that each context (nav logo, hero CTA, footer,
// divider…) sets on `.flower-mark` in globals.css. Size is likewise set by the
// context selector, so `size` is only an optional override.
const PETAL = "M 0 -36 C 14 -36 18 -14 0 -2 C -18 -14 -14 -36 0 -36 Z";
const PETAL_IN = "M 0 -28 C 6 -28 8 -16 0 -8 C -8 -16 -6 -28 0 -28 Z";
const ANGLES = [0, 72, 144, 216, 288];

type FlowerMarkProps = {
  className?: string;
  /** render the inner petal outline (off for the engraved stamp variant) */
  inner?: boolean;
  /** core circle radius — 9 for the wordmark marks, 7 for stamp/divider */
  coreR?: number;
  /** "triple" = three offset stamens (wordmark); "center" = one centered; "none" */
  stamen?: "triple" | "center" | "none";
  /** optional inline size override; normally the context CSS sets the size */
  size?: number;
};

export function FlowerMark({
  className = "",
  inner = true,
  coreR = 9,
  stamen = "triple",
  size,
}: FlowerMarkProps) {
  return (
    <span
      aria-hidden
      className={`flower-mark ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg viewBox="-50 -50 100 100">
        {ANGLES.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path className="fm-petal" d={PETAL} />
            {inner && <path className="fm-petal-in" d={PETAL_IN} />}
          </g>
        ))}
        <circle className="fm-core" r={coreR} cx="0" cy="0" />
        {stamen === "triple" && (
          <>
            <circle className="fm-stamen" r="2" cx="0" cy="-3" />
            <circle className="fm-stamen" r="1.6" cx="3.5" cy="2" />
            <circle className="fm-stamen" r="1.6" cx="-3.5" cy="2" />
          </>
        )}
        {stamen === "center" && <circle className="fm-stamen" r="3" cx="0" cy="0" />}
      </svg>
    </span>
  );
}
