import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number; // 0–100
  className?: string; // track
  trackClassName?: string;
  fillClassName?: string;
  height?: number;
};

// Thin rounded progress track + fill. Generic across screens.
export function ProgressBar({ value, trackClassName, fillClassName, height = 6, className }: ProgressBarProps) {
  return (
    <div
      style={{ height }}
      className={cn("flex-1 rounded-full overflow-hidden relative bg-charcoal/[0.07]", trackClassName, className)}
    >
      <div
        style={{ width: `${value}%` }}
        className={cn("absolute left-0 top-0 bottom-0 rounded-full bg-burgundy", fillClassName)}
      />
    </div>
  );
}
