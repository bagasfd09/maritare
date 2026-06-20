import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  light?: boolean;
  className?: string;
};

// "maritare*" wordmark lockup. Ports `.d-logo`.
export function Logo({ size = 22, light = false, className }: LogoProps) {
  return (
    <span
      style={{ fontSize: size }}
      className={cn(
        "font-display font-extrabold tracking-[-0.04em] lowercase",
        "inline-flex items-baseline gap-[2px] [font-variation-settings:'opsz'_48]",
        light ? "text-cream" : "text-charcoal",
        className,
      )}
    >
      maritare
      <span
        className={cn(
          "font-body text-[18px] -translate-y-[3px] inline-block",
          light ? "text-peach" : "text-terracotta",
        )}
      >
        *
      </span>
    </span>
  );
}
