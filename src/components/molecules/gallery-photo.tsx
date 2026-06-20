import { cn } from "@/lib/utils";

export type PhotoTone = "peach" | "sage" | "forest" | "burgundy" | "blush" | "dark";

// Gradient per tone is data-driven, so it stays an inline style. Ports `.d-photo`.
const GRADIENTS: Record<PhotoTone, string> = {
  peach: "linear-gradient(135deg, var(--color-peach), var(--color-terracotta-soft))",
  sage: "linear-gradient(135deg, var(--color-sage-pill), var(--color-sage))",
  forest: "linear-gradient(135deg, var(--color-forest), var(--color-forest-deep))",
  burgundy: "linear-gradient(135deg, var(--color-terracotta), var(--color-burgundy-deep))",
  blush: "linear-gradient(135deg, var(--color-blush), var(--color-terracotta-soft))",
  dark: "linear-gradient(135deg, #2A2520, #1A1410)",
};

type PhotoPlaceholderProps = {
  tone?: PhotoTone;
  label?: string | null;
  className?: string;
  labelClassName?: string;
};

// No-image photo placeholder: tonal gradient + soft light/shadow overlay,
// optional italic caption pinned bottom-left. Ports `.d-photo` + `.ph-label`.
export function PhotoPlaceholder({ tone = "peach", label, className, labelClassName }: PhotoPlaceholderProps) {
  return (
    <div
      className={cn("relative overflow-hidden text-cream", className)}
      style={{ background: GRADIENTS[tone] }}
    >
      {/* `.d-photo::after` overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_25%_80%,rgba(124,45,45,0.35),transparent_50%)]" />
      {label && (
        <span
          className={cn(
            "absolute left-[14px] bottom-[14px] z-[2] font-display italic text-[14px] text-[rgba(255,255,255,0.92)] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
