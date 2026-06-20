// Decorative SVG flower used at section corners. Reused across sections.
// Color/position controlled by className (e.g. "outline or-top-right").

type Props = {
  variant: "outline" | "outline-terra";
  position: "or-top-right" | "or-bottom-left";
  rotateOffset?: number;
};

export function SectionOrnament({ variant, position, rotateOffset = 0 }: Props) {
  // 5 petals around a center. rotateOffset lets us shift petal angles
  // between top-right (0deg base) and bottom-left (36deg base) so the two
  // ornaments look distinct.
  const angles = [0, 72, 144, 216, 288].map((a) => a + rotateOffset);
  return (
    <span aria-hidden className={`sec-ornament ${variant} ${position}`}>
      <svg viewBox="-50 -50 100 100">
        {angles.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path
              className="or-petal"
              d="M 0 -42 C 18 -42 22 -16 0 -2 C -22 -16 -18 -42 0 -42 Z"
            />
          </g>
        ))}
        <circle className="or-core" r="10" cx="0" cy="0" />
      </svg>
    </span>
  );
}
