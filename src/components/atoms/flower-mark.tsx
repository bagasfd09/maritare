import { cn } from "@/lib/utils";

type FlowerMarkProps = {
  size?: number;
  color?: string;
  core?: string;
  stamen?: string;
  className?: string;
};

// The Maritare flower glyph — six petals, a core, and a stamen. Carried over
// from the landing brand mark. Colors are overridable for dark surfaces.
export function FlowerMark({
  size = 20,
  color = "var(--color-terracotta)",
  core = "var(--color-burgundy)",
  stamen = "var(--color-peach)",
  className,
}: FlowerMarkProps) {
  return (
    <span className={cn("inline-block leading-[0] shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full block overflow-visible">
        {[0, 60, 120, 180, 240, 300].map((rot) => (
          <ellipse
            key={rot}
            cx="12"
            cy="5"
            rx="3"
            ry="5.5"
            fill={color}
            transform={`rotate(${rot} 12 12)`}
            opacity="0.95"
          />
        ))}
        <circle cx="12" cy="12" r="3" fill={core} />
        <circle cx="12" cy="12" r="1.2" fill={stamen} />
      </svg>
    </span>
  );
}
